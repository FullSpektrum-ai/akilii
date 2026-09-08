'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { capabilitiesFor, requireCapability } = require('./rebaseline/capabilities.cjs');
const { createHostConfig, loopbackOrigin } = require('./rebaseline/host-config.cjs');
const { modeTransition, normaliseWorkspaceMode } = require('./rebaseline/mode.cjs');
const { createRuntimeController } = require('./rebaseline/runtime-controller.cjs');
const { allowedExternalUrl, browserWindowOptions, installNavigationGuards, trustedAppUrl } = require('./rebaseline/window-security.cjs');

test('desktop modes are explicit and hybrid never means automatic routing', () => {
  assert.equal(normaliseWorkspaceMode('cloud'), 'cloud');
  assert.equal(normaliseWorkspaceMode('local'), 'local');
  assert.throws(() => normaliseWorkspaceMode('hybrid'), error => error.code === 'EXPLICIT_MODE_REQUIRED');
  const transition = modeTransition('cloud', 'local');
  assert.deepEqual(transition, {
    from: 'cloud',
    to: 'local',
    changed: true,
    requiresReload: true,
    automaticDataTransfer: false,
  });
});

test('local capabilities are honest instead of simulated', () => {
  const local = capabilitiesFor('local');
  assert.equal(local.chat, true);
  assert.equal(local.voice, false);
  assert.equal(local.localModels, true);
  assert.equal(local.automaticSync, false);
  assert.equal(local.flowState, 'probe_only');
  assert.throws(() => requireCapability('local', 'voice'), error => error.code === 'CAPABILITY_UNAVAILABLE');
});

test('host config binds loopback only and forbids automatic fallback/sync', () => {
  const config = createHostConfig({
    mode: 'local',
    port: 4321,
    userDataPath: '/tmp/akilii',
    preloadPath: '/tmp/preload.cjs',
    iconPath: '/tmp/icon.png',
  });
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.allowAutomaticModeFallback, false);
  assert.equal(config.allowAutomaticSync, false);
  assert.equal(loopbackOrigin(config, 4321), 'http://127.0.0.1:4321');
  assert.throws(() => createHostConfig({ mode: 'cloud', port: 80, userDataPath: 'x', preloadPath: 'y', iconPath: 'z' }), /1024/);
});

test('BrowserWindow defaults remain hardened', () => {
  const options = browserWindowOptions({ preloadPath: '/tmp/preload.cjs', iconPath: '/tmp/icon.png' });
  assert.equal(options.webPreferences.nodeIntegration, false);
  assert.equal(options.webPreferences.contextIsolation, true);
  assert.equal(options.webPreferences.sandbox, true);
  assert.equal(options.webPreferences.webSecurity, true);
});

test('navigation guards keep app navigation same-origin and external links allowlisted', () => {
  assert.equal(trustedAppUrl('http://127.0.0.1:4555/#/home', 'http://127.0.0.1:4555'), true);
  assert.equal(trustedAppUrl('https://evil.example/', 'http://127.0.0.1:4555'), false);
  assert.equal(allowedExternalUrl('https://fullspektrum.ai/akilii'), true);
  assert.equal(allowedExternalUrl('javascript:alert(1)'), false);
  assert.equal(allowedExternalUrl('https://example.com/'), false);

  const handlers = {};
  let windowHandler;
  const opened = [];
  const webContents = {
    setWindowOpenHandler(handler) { windowHandler = handler; },
    on(name, handler) { handlers[name] = handler; },
  };
  installNavigationGuards(webContents, {
    appOrigin: 'http://127.0.0.1:4555',
    openExternal: url => opened.push(url),
  });
  assert.deepEqual(windowHandler({ url: 'https://fullspektrum.ai/' }), { action: 'deny' });
  assert.deepEqual(opened, ['https://fullspektrum.ai/']);
  assert.deepEqual(windowHandler({ url: 'https://example.com/' }), { action: 'deny' });
  let blocked = false;
  handlers['will-navigate']({ preventDefault() { blocked = true; } }, 'https://example.com/');
  assert.equal(blocked, true);
  blocked = false;
  handlers['will-navigate']({ preventDefault() { blocked = true; } }, 'http://127.0.0.1:4555/work');
  assert.equal(blocked, false);
});

test('runtime switching is explicit and never silently falls back', async () => {
  const events = [];
  const adapters = {
    cloud: {
      async start() { events.push('cloud:start'); return { id: 'cloud' }; },
      async stop() { events.push('cloud:stop'); },
    },
    local: {
      async start() { events.push('local:start'); return { id: 'local' }; },
      async stop() { events.push('local:stop'); },
    },
  };
  const controller = createRuntimeController({ adapters, initialMode: 'cloud' });
  assert.deepEqual(await controller.start(), { id: 'cloud' });
  assert.deepEqual(await controller.switchMode('local'), { id: 'local' });
  assert.equal(controller.status().mode, 'local');
  assert.equal(controller.status().automaticFallback, false);
  assert.deepEqual(events, ['cloud:start', 'cloud:stop', 'local:start']);
  await controller.stop();
  assert.deepEqual(events, ['cloud:start', 'cloud:stop', 'local:start', 'local:stop']);

  const failing = createRuntimeController({
    initialMode: 'local',
    adapters: {
      cloud: adapters.cloud,
      local: { async start() { throw new Error('Ollama unavailable'); }, async stop() {} },
    },
  });
  await assert.rejects(failing.start(), /Ollama unavailable/);
  assert.equal(failing.status().mode, 'local');
  assert.equal(failing.status().running, false);
});

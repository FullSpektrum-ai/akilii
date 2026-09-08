'use strict';

const { capabilitiesFor } = require('./capabilities.cjs');
const { normaliseWorkspaceMode } = require('./mode.cjs');

function adapterFor(adapters, mode) {
  const adapter = adapters?.[mode];
  if (!adapter || typeof adapter.start !== 'function' || typeof adapter.stop !== 'function') {
    throw new TypeError(`A ${mode} runtime adapter with start() and stop() is required.`);
  }
  return adapter;
}

function createRuntimeController({ adapters, initialMode = 'cloud' } = {}) {
  let mode = normaliseWorkspaceMode(initialMode);
  let active = null;

  async function start() {
    if (active) return active.handle;
    const adapter = adapterFor(adapters, mode);
    const handle = await adapter.start({ mode, capabilities: capabilitiesFor(mode) });
    if (!handle || typeof handle !== 'object') throw new Error(`${mode} runtime returned an invalid handle.`);
    active = { adapter, handle };
    return handle;
  }

  async function stop() {
    if (!active) return;
    const current = active;
    active = null;
    await current.adapter.stop(current.handle);
  }

  async function switchMode(requested) {
    const next = normaliseWorkspaceMode(requested);
    if (next === mode) return start();
    await stop();
    mode = next;
    return start();
  }

  function status() {
    return Object.freeze({
      mode,
      running: !!active,
      capabilities: capabilitiesFor(mode),
      automaticFallback: false,
      automaticSync: false,
    });
  }

  return Object.freeze({ start, stop, switchMode, status });
}

module.exports = Object.freeze({ createRuntimeController });

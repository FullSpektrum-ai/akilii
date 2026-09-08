'use strict';

const { normaliseWorkspaceMode } = require('./mode.cjs');

function integerPort(value, fallback = 0) {
  if (value === undefined || value === null || value === '' || Number(value) === 0) return fallback;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1024 || port > 65535) {
    throw new TypeError('Desktop loopback port must be between 1024 and 65535, or 0 for an ephemeral port.');
  }
  return port;
}

function requiredPath(value, name) {
  if (typeof value !== 'string' || !value.trim()) throw new TypeError(`${name} path is required.`);
  return value;
}

function createHostConfig(input = {}) {
  const mode = normaliseWorkspaceMode(input.mode, 'cloud');
  return Object.freeze({
    mode,
    host: '127.0.0.1',
    port: integerPort(input.port, 0),
    userDataPath: requiredPath(input.userDataPath, 'userData'),
    preloadPath: requiredPath(input.preloadPath, 'preload'),
    iconPath: requiredPath(input.iconPath, 'icon'),
    allowAutomaticModeFallback: false,
    allowAutomaticSync: false,
  });
}

function loopbackOrigin(config, resolvedPort) {
  const port = integerPort(resolvedPort, config.port);
  if (!port) throw new TypeError('A resolved loopback port is required.');
  return `http://${config.host}:${port}`;
}

module.exports = Object.freeze({ createHostConfig, loopbackOrigin });

'use strict';

const CAPABILITIES = Object.freeze({
  cloud: Object.freeze({
    chat: true,
    voice: true,
    context: true,
    threads: true,
    work: true,
    localModels: false,
    connectors: 'explicit_gate',
    externalActions: 'approval_and_receipt',
    automaticSync: false,
    flowState: 'unqualified',
  }),
  local: Object.freeze({
    chat: true,
    voice: false,
    context: true,
    threads: true,
    work: true,
    localModels: true,
    connectors: false,
    externalActions: false,
    automaticSync: false,
    flowState: 'probe_only',
  }),
});

function capabilitiesFor(mode) {
  const capabilities = CAPABILITIES[mode];
  if (!capabilities) throw new TypeError(`Unsupported desktop workspace mode: ${mode}`);
  return capabilities;
}

function capabilityAvailable(mode, name) {
  const value = capabilitiesFor(mode)[name];
  return value === true;
}

function requireCapability(mode, name) {
  const value = capabilitiesFor(mode)[name];
  if (value === true) return true;
  const error = new Error(`${name} is not available in the ${mode} workspace.`);
  error.code = 'CAPABILITY_UNAVAILABLE';
  error.capability = name;
  error.mode = mode;
  error.policy = value ?? false;
  throw error;
}

module.exports = Object.freeze({ CAPABILITIES, capabilitiesFor, capabilityAvailable, requireCapability });

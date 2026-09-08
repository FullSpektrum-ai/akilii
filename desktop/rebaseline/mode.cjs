'use strict';

const MODES = Object.freeze(['cloud', 'local']);
const MODE_SET = new Set(MODES);

function normaliseWorkspaceMode(value, fallback = 'cloud') {
  if (!MODE_SET.has(fallback)) throw new TypeError('Desktop mode fallback must be cloud or local.');
  if (value === undefined || value === null || value === '') return fallback;
  if (value === 'hybrid') {
    const error = new Error('Hybrid is a user-selected workspace boundary, not an automatic execution mode. Choose cloud or local.');
    error.code = 'EXPLICIT_MODE_REQUIRED';
    throw error;
  }
  if (!MODE_SET.has(value)) throw new TypeError('Desktop workspace mode must be cloud or local.');
  return value;
}

function modeTransition(current, requested) {
  const from = normaliseWorkspaceMode(current);
  const to = normaliseWorkspaceMode(requested);
  return Object.freeze({
    from,
    to,
    changed: from !== to,
    requiresReload: from !== to,
    automaticDataTransfer: false,
  });
}

module.exports = Object.freeze({ MODES, normaliseWorkspaceMode, modeTransition });

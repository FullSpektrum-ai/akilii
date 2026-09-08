function requireAdapter(adapter, name) {
  if (!adapter || typeof adapter.start !== 'function') {
    throw new TypeError(`${name} runtime adapter with start() is required.`);
  }
  return adapter;
}

/** Dispatch by modality only. Provider fallback is intentionally not implemented here. */
export function createConversationRuntime({ textAdapter, voiceAdapter } = {}) {
  const text = textAdapter ? requireAdapter(textAdapter, 'text') : null;
  const voice = voiceAdapter ? requireAdapter(voiceAdapter, 'voice') : null;

  async function start(request = {}) {
    const modality = request.modality === 'voice' ? 'voice' : 'text';
    const adapter = modality === 'voice' ? voice : text;
    if (!adapter) {
      const error = new Error(`${modality} conversation capability is unavailable in this runtime.`);
      error.code = 'CAPABILITY_UNAVAILABLE';
      throw error;
    }
    return adapter.start(request);
  }

  return Object.freeze({ start });
}

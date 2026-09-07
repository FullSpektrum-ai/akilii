const os = require('node:os');
const base = 'http://127.0.0.1:11434';
let latest = null;
function recordTiming(value) {
  latest = { ...value, at: new Date().toISOString() };
}
async function json(route, body) {
  const r = await fetch(base + route, {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(5000),
  });
  if (!r.ok) throw Error('Ollama did not accept ' + route);
  return r.json();
}
async function inspect() {
  const hardware = {
    architecture: os.arch(),
    memoryGiB: Math.round(os.totalmem() / 2 ** 30),
  };
  try {
    const [version, tags, running] = await Promise.all([
      json('/api/version'),
      json('/api/tags'),
      json('/api/ps'),
    ]);
    return {
      available: true,
      runtime: 'Ollama',
      version: version.version,
      hardware,
      installed: (tags.models || []).map((m) => ({
        name: m.name,
        sizeBytes: m.size,
      })),
      running: (running.models || []).map((m) => ({
        name: m.name,
        sizeBytes: m.size,
        gpuBytes: m.size_vram,
        contextLength: m.context_length,
      })),
      latest,
    };
  } catch {
    return {
      available: false,
      runtime: 'Ollama',
      hardware,
      latest,
      message:
        'Start Ollama on this device, then retry. No other local runtime is connected in this build.',
    };
  }
}
module.exports = { json, inspect, recordTiming };

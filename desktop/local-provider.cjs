const { chat, models } = require('./local.cjs');
let cached = [],
  checkedAt = 0;
async function localModels() {
  if (Date.now() - checkedAt < 30000) return cached;
  const installed = await models();
  const inspected = await Promise.all(
    installed.map(async (id) => {
      try {
        const info = await require('./local-diagnostics.cjs').json(
          '/api/show',
          { model: id },
        );
        if (
          !Array.isArray(info.capabilities) ||
          !info.capabilities.includes('completion')
        )
          return null;
        return {
          id,
          label: id,
          description: 'Ollama · chat-capable · on this device',
          maxOutput: 1800,
        };
      } catch {
        return null;
      }
    }),
  );
  cached = inspected.filter(Boolean);
  checkedAt = Date.now();
  return cached;
}

async function modelFetch(_url, options) {
  const b = JSON.parse(options.body);
  let cancelled = false;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(c) {
      const emit = (e) => {
        if (!cancelled)
          c.enqueue(encoder.encode('data: ' + JSON.stringify(e) + '\n\n'));
      };
      chat(
        b.model,
        [{ role: 'system', content: b.instructions }, ...b.input],
        options.signal,
        (text) => emit({ type: 'response.output_text.delta', delta: text }),
        {
          options: { num_predict: b.max_output_tokens || 1800 },
          ...(b.agent_choice || b.text?.format ? { format: 'json' } : {}),
        },
      )
        .then(() => {
          emit({ type: 'response.completed' });
          if (!cancelled) c.close();
        })
        .catch(() => {
          emit({ type: 'response.failed' });
          if (!cancelled) c.close();
        });
    },
    cancel() {
      cancelled = true;
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
module.exports = { localModels, modelFetch };

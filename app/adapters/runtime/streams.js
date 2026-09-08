async function* chunks(body) {
  if (!body) throw new Error('Provider response body is missing.');
  if (typeof body[Symbol.asyncIterator] === 'function') {
    for await (const chunk of body) yield chunk;
    return;
  }
  const reader = body.getReader?.();
  if (!reader) throw new Error('Provider response body is not streamable.');
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock?.();
  }
}

export async function* readLines(body, maxBuffer = 1_048_576) {
  const decoder = new TextDecoder();
  let pending = '';
  for await (const chunk of chunks(body)) {
    pending += typeof chunk === 'string' ? chunk : decoder.decode(chunk, { stream: true });
    if (pending.length > maxBuffer) throw new Error('Provider event buffer exceeded its limit.');
    let index;
    while ((index = pending.indexOf('\n')) >= 0) {
      const line = pending.slice(0, index).replace(/\r$/, '');
      pending = pending.slice(index + 1);
      yield line;
    }
  }
  pending += decoder.decode();
  if (pending) yield pending.replace(/\r$/, '');
}

export async function* readSseJson(body) {
  for await (const line of readLines(body)) {
    if (!line.startsWith('data:')) continue;
    const data = line.slice(5).trim();
    if (!data || data === '[DONE]') continue;
    yield JSON.parse(data);
  }
}

export async function* readNdjson(body) {
  for await (const line of readLines(body)) {
    if (!line.trim()) continue;
    yield JSON.parse(line);
  }
}

export async function* readSseEvents(body, { maxBuffer = 1_048_576 } = {}) {
  if (!body?.getReader) throw new Error('Streaming response body is unavailable.');
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pending = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      pending += decoder.decode(value, { stream: true });
      if (pending.length > maxBuffer) throw new Error('Streaming response exceeded its limit.');

      let boundary;
      while ((boundary = pending.indexOf('\n\n')) >= 0) {
        const block = pending.slice(0, boundary);
        pending = pending.slice(boundary + 2);
        for (const line of block.split(/\r?\n/)) {
          if (!line.startsWith('data:')) continue;
          const data = line.slice(5).trim();
          if (data) yield JSON.parse(data);
        }
      }
    }
    pending += decoder.decode();
    if (pending.trim()) {
      for (const line of pending.split(/\r?\n/)) {
        if (!line.startsWith('data:')) continue;
        const data = line.slice(5).trim();
        if (data) yield JSON.parse(data);
      }
    }
  } finally {
    reader.releaseLock?.();
  }
}

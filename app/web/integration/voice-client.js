const INPUT_DONE = 'conversation.item.input_audio_transcription.completed';
const OUTPUT_DONE = 'response.output_audio_transcript.done';

export function createIntegrationVoiceClient({
  api,
  navigatorLike = globalThis.navigator,
  RTCPeerConnectionImpl = globalThis.RTCPeerConnection,
  AudioImpl = globalThis.Audio,
  onState = () => {},
  onTurn = () => {},
} = {}) {
  if (!api?.createVoiceSession || !api?.saveVoiceTranscript) {
    throw new TypeError('Voice API is required.');
  }
  let active = null;

  async function flush(session, ended = false, status = 'completed') {
    if (!session?.episodeId || !session?.conversationId) return;
    const turns = [...session.turns.values()].sort((a, b) => a.order - b.order);
    await api.saveVoiceTranscript({
      episodeId: session.episodeId,
      conversationId: session.conversationId,
      turns,
      ended,
      status,
    });
  }

  function record(session, role, rawId, rawContent) {
    if (!rawId || typeof rawContent !== 'string' || !rawContent.trim()) return;
    const id = String(rawId).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 100);
    const prior = session.turns.get(id);
    const turn = {
      id,
      role,
      content: rawContent.trim().slice(0, 10_000),
      order: prior?.order ?? session.nextOrder++,
    };
    session.turns.set(id, turn);
    onTurn(turn);
    void flush(session, false).catch(() => {});
  }

  async function start(input = {}) {
    if (active) throw new Error('Voice is already connected.');
    if (!navigatorLike?.mediaDevices?.getUserMedia || typeof RTCPeerConnectionImpl !== 'function') {
      throw Object.assign(
        new Error('Voice is unavailable in this browser.'),
        { code: 'CAPABILITY_UNAVAILABLE' },
      );
    }

    const stream = await navigatorLike.mediaDevices.getUserMedia({ audio: true });
    const pc = new RTCPeerConnectionImpl();
    const dataChannel = pc.createDataChannel('oai-events');
    const session = {
      pc,
      dataChannel,
      stream,
      turns: new Map(),
      nextOrder: 0,
      audio: null,
    };
    active = session;
    stream.getTracks().forEach(track => pc.addTrack(track, stream));

    pc.ontrack = event => {
      if (typeof AudioImpl !== 'function') return;
      const audio = new AudioImpl();
      audio.autoplay = true;
      audio.srcObject = event.streams?.[0] || null;
      session.audio = audio;
      void audio.play?.().catch(() => {});
    };
    dataChannel.onmessage = event => {
      let data;
      try { data = JSON.parse(event.data); } catch { return; }
      if (data.type === INPUT_DONE) {
        record(session, 'user', data.item_id || `user_${session.nextOrder}`, data.transcript);
      }
      if (data.type === OUTPUT_DONE) {
        record(session, 'assistant', data.item_id || `assistant_${session.nextOrder}`, data.transcript);
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const response = await api.createVoiceSession({
        sdp: pc.localDescription?.sdp || offer.sdp,
        voice: input.voice,
        speed: input.speed,
        useContext: input.useContext === true,
        objective: input.objective || 'Voice conversation',
        intent: input.intent || 'Talk this through with me.',
        session: input.session || {},
      });
      session.episodeId = response.episodeId;
      session.conversationId = response.conversationId;
      session.runId = response.runId;
      await pc.setRemoteDescription({ type: 'answer', sdp: response.sdpAnswer });
      onState({ status: 'connected', conversationId: session.conversationId });
      return {
        runId: session.runId,
        episodeId: session.episodeId,
        conversationId: session.conversationId,
      };
    } catch (error) {
      stream.getTracks().forEach(track => track.stop());
      pc.close();
      active = null;
      onState({ status: 'error', error });
      throw error;
    }
  }

  async function stop({ abandoned = false } = {}) {
    const session = active;
    if (!session) return;
    active = null;
    try {
      await flush(session, true, abandoned ? 'abandoned' : 'completed');
    } finally {
      session.stream?.getTracks().forEach(track => track.stop());
      session.pc?.close();
      session.audio?.pause?.();
      onState({ status: 'idle' });
    }
  }

  return Object.freeze({
    start,
    stop,
    status: () => active ? 'connected' : 'idle',
  });
}

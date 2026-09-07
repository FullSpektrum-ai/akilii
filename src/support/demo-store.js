import { validateProposal } from '../../backend/runtime.js';
import {
  validateThreadCreate,
  validateThreadUpdate,
  validateThreadClose,
} from '../../backend/threads.js';
const KEY = 'akilii-phase8-synthetic-v1';
const fail = (status, message) => {
  throw Object.assign(new Error(message), { status });
};
/** Explicit demo adapter. No cloud calls. Only approved synthetic state is stored. */
export function createDemoStore(storage) {
  let state, serialized;
  try {
    serialized = storage.getItem(KEY) || null;
    state = JSON.parse(serialized || 'null');
  } catch {
    fail(503, 'Demo storage cannot be read.');
  }
  state ||= { work: [], threads: [], runs: [], outcomes: [] };
  if (
    !['work', 'threads', 'runs', 'outcomes'].every((k) =>
      Array.isArray(state[k]),
    )
  )
    fail(
      503,
      'Demo storage is invalid. Clear the synthetic demo storage to restart.',
    );
  const write = (fn) => {
    if ((storage.getItem(KEY) || null) !== serialized)
      fail(409, 'Demo changed in another tab. Reload before saving.');
    const next = structuredClone(state);
    const result = fn(next);
    try {
      const value = JSON.stringify(next);
      storage.setItem(KEY, value);
      serialized = value;
    } catch {
      fail(503, 'Demo save failed. Nothing was confirmed.');
    }
    state = next;
    return structuredClone(result);
  };
  const bootstrap = () => ({
    user: { id: 'synthetic-demo', email: 'demo@example.test' },
    profile: { name: 'Alex', focus: '', style: '' },
    policy: '2026-09-05-v1',
    work: structuredClone(state.work),
    memories: [],
    conversations: [],
  });
  return async function request(path, method = 'GET', body = {}) {
    if (path === 'bootstrap') return bootstrap();
    if (path === 'health') return { ok: true };
    if (path === 'models') return { models: [] };
    if (path === 'workspace') return { workspace: {}, projects: [] };
    if (path === 'runtime')
      return {
        capabilities: {
          direct: { available: true },
          flowstate: { available: false },
        },
      };
    if (path === 'threads' && method === 'GET')
      return { threads: structuredClone(state.threads) };
    if (path === 'threads' && method === 'POST')
      return write((s) => {
        const old = s.threads.find((t) => t.request_key === body.request_key);
        if (old) return { thread: old };
        const value = validateThreadCreate(body);
        if (value.work_id && !s.work.some((w) => w.id === value.work_id))
          fail(404, 'Linked Work missing.');
        if (value.project_id || value.conversation_id)
          fail(400, 'This fixture supports saved Work links only.');
        const thread = {
          ...value,
          id: crypto.randomUUID(),
          version: 1,
          created_at: Date.now(),
          updated_at: Date.now(),
        };
        s.threads.unshift(thread);
        return { thread };
      });
    if (path.startsWith('threads/')) {
      const [, id, operation] = path.split('/');
      const current = state.threads.find((t) => t.id === id);
      if (!current) fail(404, 'Thread missing.');
      if (method === 'GET') return { thread: structuredClone(current) };
      return write((s) => {
        const thread = s.threads.find((t) => t.id === id);
        if (operation === 'close') {
          const old = s.outcomes.find(
            (o) => o.request_key === body.request_key && o.thread_id === id,
          );
          if (old) return { thread, outcome: old };
          const value = validateThreadClose(body, thread);
          const outcome = { ...value, id: crypto.randomUUID(), thread_id: id };
          s.outcomes.push(outcome);
          Object.assign(thread, {
            status: 'closed',
            version: thread.version + 1,
          });
          return { thread, outcome };
        }
        Object.assign(thread, validateThreadUpdate(body, thread), {
          version: thread.version + 1,
          updated_at: Date.now(),
        });
        return { thread };
      });
    }
    if (path === 'runs' && method === 'POST')
      return write((s) => {
        const prior = s.runs.find((r) => r.request_key === body.request_key);
        if (prior) return { run: prior, action_id: prior.action_id };
        const args = validateProposal(body);
        if (args.operation !== 'create')
          fail(400, 'Demo supports new Work only.');
        const run = {
          id: crypto.randomUUID(),
          action_id: crypto.randomUUID(),
          status: 'awaiting_approval',
          request_key: args.request_key,
          args,
          expires_at: Date.now() + 600000,
        };
        s.runs.push(run);
        return { run, action_id: run.action_id };
      });
    if (path.startsWith('runs/')) {
      const [, id, action] = path.split('/');
      const current = state.runs.find((r) => r.id === id);
      if (!current) fail(404, 'Proposal missing.');
      if (method === 'GET')
        return {
          run: structuredClone(current),
          actions: [
            {
              status: current.receipt ? 'executed' : 'proposed',
              receipt: current.receipt,
            },
          ],
        };
      return write((s) => {
        const run = s.runs.find((r) => r.id === id);
        if (action === 'cancel') {
          if (run.status !== 'succeeded') run.status = 'cancelled';
          return { run };
        }
        if (action !== 'approve' || body.action_id !== run.action_id)
          fail(400, 'Invalid approval.');
        if (run.receipt) return { run, receipt: run.receipt };
        if (run.status !== 'awaiting_approval' || run.expires_at < Date.now())
          fail(409, 'Proposal cancelled or expired.');
        const item = {
          id: crypto.randomUUID(),
          title: run.args.title,
          body: run.args.body,
          version: 1,
          updated_at: Date.now(),
        };
        s.work.unshift(item);
        run.status = 'succeeded';
        run.receipt = { work_id: item.id, title: item.title, version: 1 };
        return { run, receipt: run.receipt };
      });
    }
    if (path.startsWith('work?id=') && method === 'GET') {
      const item = state.work.find(
        (w) => w.id === decodeURIComponent(path.split('=')[1]),
      );
      if (!item) fail(404, 'Work missing.');
      return { versions: structuredClone(item.history || []) };
    }
    if (path === 'work' && method === 'POST') {
      if (
        typeof body.title !== 'string' ||
        !body.title.trim() ||
        body.title.length > 120 ||
        typeof body.body !== 'string' ||
        !body.body.trim() ||
        body.body.length > 14000
      )
        fail(400, 'A bounded title and body are required.');
      write((s) => {
        if (body.id) {
          const item = s.work.find((w) => w.id === body.id);
          if (!item) fail(404, 'Work missing.');
          if (item.version !== body.version)
            fail(409, 'Work changed. Reopen before saving.');
          item.history ||= [];
          item.history.unshift({ version: item.version, body: item.body });
          Object.assign(item, {
            title: body.title,
            body: body.body,
            version: item.version + 1,
            updated_at: Date.now(),
          });
        } else {
          s.work.unshift({
            id: crypto.randomUUID(),
            title: body.title,
            body: body.body,
            version: 1,
            updated_at: Date.now(),
          });
        }
      });
      return bootstrap();
    }
    if (path === 'work' && method === 'DELETE') {
      write((s) => {
        if (!s.work.some((w) => w.id === body.id)) fail(404, 'Work missing.');
        s.work = s.work.filter((w) => w.id !== body.id);
      });
      return { ok: true };
    }
    fail(503, 'This action is outside the synthetic flagship demo.');
  };
}

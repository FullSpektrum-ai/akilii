import { validateBootstrapPorts } from './ports.js';

const text = (value, max = 200) =>
  typeof value === 'string' ? value.trim().slice(0, max) : '';

export function createBootstrapService(rawPorts, { capabilities = {} } = {}) {
  const ports = validateBootstrapPorts(rawPorts);
  const safeCapabilities = capabilities && typeof capabilities === 'object' ? { ...capabilities } : {};

  async function load(input = {}) {
    const subjectId = text(input.subjectId, 100);
    if (!subjectId) throw new TypeError('Bootstrap subject is required.');
    const user = input.user && typeof input.user === 'object'
      ? { id: subjectId, email: text(input.user.email, 320), name: text(input.user.name, 160) }
      : { id: subjectId, email: '', name: '' };

    const [profile, conversations, threads, work, items, proposals] = await Promise.all([
      ports.profileRepository.get({ subjectId }),
      ports.conversationRepository.list({ subjectId, limit: 100 }),
      ports.threadRepository.list({ subjectId, limit: 100 }),
      ports.workRepository.list({ subjectId, limit: 100 }),
      ports.contextRepository.listForSubject(subjectId),
      ports.contextRepository.listProposals(subjectId),
    ]);

    return {
      version: 1,
      user,
      profile,
      conversations,
      threads,
      work,
      context: { items, proposals },
      capabilities: safeCapabilities,
    };
  }

  return Object.freeze({ load });
}

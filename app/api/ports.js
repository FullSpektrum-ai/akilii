const isFunction = value => typeof value === 'function';

export function requirePort(port, name, methods) {
  if (!port || typeof port !== 'object') throw new TypeError(`${name} port is required.`);
  for (const method of methods) {
    if (!isFunction(port[method])) throw new TypeError(`${name}.${method}() is required.`);
  }
  return port;
}

export function requireFactory(factory, name) {
  if (!isFunction(factory)) throw new TypeError(`${name} is required.`);
  return factory;
}

export function validateConversationPorts(ports = {}) {
  return {
    contextRepository: requirePort(ports.contextRepository, 'contextRepository', ['listForSubject']),
    conversationRepository: requirePort(ports.conversationRepository, 'conversationRepository', ['listRecent']),
    episodeRepository: requirePort(ports.episodeRepository, 'episodeRepository', ['open']),
    conversationRuntime: requirePort(ports.conversationRuntime, 'conversationRuntime', ['start']),
    idFactory: requireFactory(ports.idFactory, 'idFactory'),
    clock: requireFactory(ports.clock, 'clock'),
  };
}

export function validateDurableConversationPorts(ports = {}) {
  requirePort(ports.conversationRepository, 'conversationRepository', ['ensure', 'append']);
  requirePort(ports.episodeRepository, 'episodeRepository', ['close']);
  return ports;
}

export function validateContextPorts(ports = {}) {
  return {
    contextRepository: requirePort(ports.contextRepository, 'contextRepository', [
      'listForSubject',
      'listProposals',
      'confirmProposal',
      'rejectProposal',
      'restrictItem',
      'deleteItem',
    ]),
  };
}

export function validateThreadPorts(ports = {}) {
  return {
    threadRepository: requirePort(ports.threadRepository, 'threadRepository', ['get', 'list', 'save']),
    idFactory: requireFactory(ports.idFactory, 'idFactory'),
    clock: requireFactory(ports.clock, 'clock'),
  };
}

export function validateWorkPorts(ports = {}) {
  return {
    workRepository: requirePort(ports.workRepository, 'workRepository', ['get', 'list', 'save']),
    idFactory: requireFactory(ports.idFactory, 'idFactory'),
    clock: requireFactory(ports.clock, 'clock'),
  };
}

export function validateBootstrapPorts(ports = {}) {
  return {
    profileRepository: requirePort(ports.profileRepository, 'profileRepository', ['get']),
    conversationRepository: requirePort(ports.conversationRepository, 'conversationRepository', ['list']),
    threadRepository: requirePort(ports.threadRepository, 'threadRepository', ['list']),
    workRepository: requirePort(ports.workRepository, 'workRepository', ['list']),
    contextRepository: requirePort(ports.contextRepository, 'contextRepository', ['listForSubject', 'listProposals']),
  };
}

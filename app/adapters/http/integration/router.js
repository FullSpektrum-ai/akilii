const ROUTES = Object.freeze([
  ['GET', /^\/api\/v1\/bootstrap$/, 'bootstrap'],
  ['GET', /^\/api\/v1\/context$/, 'context.inspect'],
  ['POST', /^\/api\/v1\/context\/proposals\/([^/]+)\/confirm$/, 'context.confirm'],
  ['POST', /^\/api\/v1\/context\/proposals\/([^/]+)\/reject$/, 'context.reject'],
  ['PATCH', /^\/api\/v1\/context\/items\/([^/]+)\/control$/, 'context.control'],
  ['DELETE', /^\/api\/v1\/context\/items\/([^/]+)$/, 'context.delete'],
  ['GET', /^\/api\/v1\/threads$/, 'threads.list'],
  ['POST', /^\/api\/v1\/threads$/, 'threads.create'],
  ['PATCH', /^\/api\/v1\/threads\/([^/]+)$/, 'threads.transition'],
  ['GET', /^\/api\/v1\/work$/, 'work.list'],
  ['POST', /^\/api\/v1\/work$/, 'work.create'],
  ['PATCH', /^\/api\/v1\/work\/([^/]+)$/, 'work.transition'],
  ['POST', /^\/api\/v1\/chat$/, 'chat.start'],
  ['POST', /^\/api\/v1\/voice\/session$/, 'voice.start'],
  ['POST', /^\/api\/v1\/voice\/transcript$/, 'voice.transcript'],
]);

export function matchIntegrationRoute(method, pathname) {
  const allowed = [];
  for (const [routeMethod, pattern, name] of ROUTES) {
    const match = pattern.exec(pathname);
    if (!match) continue;
    allowed.push(routeMethod);
    if (routeMethod === method) {
      return {
        name,
        params: match.slice(1).map(decodeURIComponent),
        allowed: [routeMethod],
      };
    }
  }
  if (allowed.length) return { name: null, params: [], allowed: [...new Set(allowed)] };
  return null;
}

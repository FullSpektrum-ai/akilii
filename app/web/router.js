export const PRIMARY_VIEWS = Object.freeze(['home', 'chat', 'work']);
export const SECONDARY_VIEWS = Object.freeze(['context']);
const ALL_VIEWS = new Set([...PRIMARY_VIEWS, ...SECONDARY_VIEWS]);

export function routeFor(view) {
  return ALL_VIEWS.has(view) ? `#/${view}` : '#/home';
}

export function viewFromLocation(locationLike = {}) {
  const hash = typeof locationLike.hash === 'string' ? locationLike.hash : '';
  const candidate = hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  return ALL_VIEWS.has(candidate) ? candidate : 'home';
}

export function createRouter({ windowLike = globalThis.window, onChange } = {}) {
  if (!windowLike?.location || typeof windowLike.addEventListener !== 'function') {
    throw new TypeError('Router requires a browser-like window.');
  }
  if (typeof onChange !== 'function') throw new TypeError('Router onChange callback is required.');

  const emit = () => onChange(viewFromLocation(windowLike.location));
  const listener = () => emit();
  windowLike.addEventListener('hashchange', listener);

  function start() {
    if (!windowLike.location.hash) windowLike.location.hash = routeFor('home');
    emit();
  }

  function go(view) {
    const target = routeFor(view);
    if (windowLike.location.hash === target) emit();
    else windowLike.location.hash = target;
  }

  function stop() {
    windowLike.removeEventListener?.('hashchange', listener);
  }

  return Object.freeze({ go, start, stop });
}

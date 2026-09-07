const DEFAULTS = Object.freeze({
  publicSite: 'https://fullspektrum.ai/akilii',
  appOrigin: 'https://akilii.fullspektrum.ai',
  appBasePath: '/',
  previewOrigin: 'https://fullspektrum-ai.github.io/akilii/'
});

function parseHttpsUrl(value, label, {allowPath = false} = {}) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid URL.`);
  }
  if (url.protocol !== 'https:') throw new Error(`${label} must use https.`);
  if (!allowPath && (url.pathname !== '/' || url.search || url.hash)) {
    throw new Error(`${label} must be an origin with no path, query or fragment.`);
  }
  return allowPath ? value.replace(/\/$/, '') : url.origin;
}

function normalizeBasePath(value) {
  if (!value.startsWith('/')) throw new Error('AKILII_APP_BASE_PATH must start with /.');
  return value === '/' ? '/' : `/${value.replace(/^\/+|\/+$/g, '')}/`;
}

export function getDeploymentConfig(env = process.env) {
  const publicSite = parseHttpsUrl(env.AKILII_PUBLIC_SITE || DEFAULTS.publicSite, 'AKILII_PUBLIC_SITE', {allowPath: true});
  const appOrigin = parseHttpsUrl(env.AKILII_APP_ORIGIN || DEFAULTS.appOrigin, 'AKILII_APP_ORIGIN');
  const previewOrigin = parseHttpsUrl(env.AKILII_PREVIEW_ORIGIN || DEFAULTS.previewOrigin, 'AKILII_PREVIEW_ORIGIN', {allowPath: true}) + '/';
  const appBasePath = normalizeBasePath(env.AKILII_APP_BASE_PATH || DEFAULTS.appBasePath);
  return Object.freeze({publicSite, appOrigin, appBasePath, previewOrigin});
}

export function publishCustomDomain(env = process.env) {
  return env.AKILII_PUBLISH_CUSTOM_DOMAIN === '1';
}

export {DEFAULTS};

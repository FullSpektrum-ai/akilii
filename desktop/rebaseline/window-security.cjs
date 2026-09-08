'use strict';

function browserWindowOptions({ preloadPath, iconPath, backgroundColor = '#101713' } = {}) {
  if (typeof preloadPath !== 'string' || !preloadPath) throw new TypeError('Preload path is required.');
  return {
    width: 1180,
    height: 800,
    minWidth: 720,
    minHeight: 560,
    title: 'akilii',
    icon: iconPath,
    backgroundColor,
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
    },
  };
}

function parseUrl(value) {
  try { return new URL(value); } catch { return null; }
}

function trustedAppUrl(value, appOrigin) {
  const url = parseUrl(value);
  const origin = parseUrl(appOrigin);
  return !!url && !!origin && url.origin === origin.origin && ['http:', 'https:'].includes(url.protocol);
}

function allowedExternalUrl(value, allowedHosts = ['fullspektrum.ai']) {
  const url = parseUrl(value);
  if (!url || url.protocol !== 'https:') return false;
  const hosts = new Set(allowedHosts.map(host => String(host).toLowerCase()));
  return hosts.has(url.hostname.toLowerCase());
}

function installNavigationGuards(webContents, { appOrigin, openExternal, allowedExternalHosts } = {}) {
  if (!webContents?.setWindowOpenHandler || !webContents?.on) throw new TypeError('webContents is required.');
  if (typeof openExternal !== 'function') throw new TypeError('openExternal callback is required.');

  webContents.setWindowOpenHandler(({ url }) => {
    if (allowedExternalUrl(url, allowedExternalHosts)) Promise.resolve(openExternal(url)).catch(() => {});
    return { action: 'deny' };
  });
  webContents.on('will-navigate', (event, url) => {
    if (!trustedAppUrl(url, appOrigin)) event.preventDefault();
  });
  webContents.on('will-attach-webview', event => event.preventDefault());
}

module.exports = Object.freeze({ browserWindowOptions, trustedAppUrl, allowedExternalUrl, installNavigationGuards });

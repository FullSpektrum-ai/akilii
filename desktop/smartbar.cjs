const path = require('node:path');
const { pathToFileURL } = require('node:url');
const allowed = new Set([
  'capture',
  'home',
  'work',
  'resume',
  'stop',
  'demo',
  'dismiss',
]);
function validateAction(action, text) {
  if (!allowed.has(action)) throw new Error('Unknown quick-panel action.');
  if (typeof text !== 'string' || text.length > 4000)
    throw new Error('Keep a quick capture under 4,000 characters.');
  if (action === 'capture' && !text.trim())
    throw new Error('Add a thought first.');
  return { action, text: action === 'capture' ? text.trim() : '' };
}
function createSmartbar({ BrowserWindow, ipcMain, screen, tray, dispatch }) {
  const file = path.join(__dirname, 'smartbar/index.html');
  const panel = new BrowserWindow({
    width: 360,
    height: 650,
    show: false,
    frame: false,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    backgroundColor: '#171d18',
    webPreferences: {
      preload: path.join(__dirname, 'smartbar/preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
  });
  panel.loadFile(file);
  panel.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  panel.webContents.on('will-navigate', (event) => event.preventDefault());
  ipcMain.handle('akilii:smartbar', async (event, action, text = '') => {
    if (
      event.sender !== panel.webContents ||
      event.senderFrame !== panel.webContents.mainFrame ||
      event.senderFrame.url !== pathToFileURL(file).href
    )
      throw new Error('Untrusted quick panel.');
    const command = validateAction(action, text);
    if (action !== 'dismiss') await dispatch(command);
    panel.hide();
    return true;
  });
  panel.on('blur', () => panel.hide());
  return {
    toggle() {
      if (panel.isVisible()) {
        panel.hide();
        return;
      }
      const anchor = tray.getBounds(),
        area = screen.getDisplayMatching(anchor).workArea;
      const width = Math.min(360, area.width),
        height = Math.min(650, area.height);
      panel.setBounds({
        x: Math.max(
          area.x,
          Math.min(
            Math.round(anchor.x + anchor.width / 2 - width / 2),
            area.x + area.width - width,
          ),
        ),
        y: Math.min(
          anchor.y + anchor.height + 6,
          area.y + area.height - height,
        ),
        width,
        height,
      });
      panel.show();
      panel.focus();
    },
    destroy() {
      ipcMain.removeHandler('akilii:smartbar');
      panel.destroy();
    },
  };
}
module.exports = { validateAction, createSmartbar };

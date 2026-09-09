import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('./', import.meta.url));
const output = path.join(here, 'out', '0.1.0-alpha.9');
const releases = path.join(here, '..', '.build-cache', 'releases');
const sourceIcon = path.join(here, 'icons', 'akilii.icns');
fs.mkdirSync(releases, { recursive: true });

for (const architecture of ['arm64', 'x64']) {
  const source = path.join(output, `akilii-darwin-${architecture}`, 'akilii.app');
  if (!fs.existsSync(source)) throw new Error(`Missing macOS ${architecture} package.`);
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), `akilii-${architecture}-`));
  const app = path.join(temporary, 'akilii.app');
  try {
    execFileSync('ditto', ['--noextattr', '--noqtn', source, app], { stdio: 'inherit' });
    const resources = path.join(app, 'Contents', 'Resources');
    const plistPath = path.join(app, 'Contents', 'Info.plist');
    fs.copyFileSync(sourceIcon, path.join(resources, 'akilii.icns'));
    const plist = fs
      .readFileSync(plistPath, 'utf8')
      .replace('<string>electron.icns</string>', '<string>akilii.icns</string>');
    if (!plist.includes('<string>akilii.icns</string>'))
      throw new Error(`Could not set the macOS ${architecture} application icon.`);
    fs.writeFileSync(plistPath, plist);
    execFileSync('xattr', ['-cr', app], { stdio: 'inherit' });
    execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'inherit' });
    execFileSync('codesign', ['--verify', '--deep', '--strict', app], { stdio: 'inherit' });
    const label = architecture === 'arm64' ? 'mac-apple-silicon' : 'mac-intel';
    const archive = path.join(releases, `akilii-0.1.0-alpha.9-${label}.zip`);
    execFileSync('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', app, archive], {
      stdio: 'inherit',
    });
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

console.log('Created branded, ad-hoc signed macOS review archives for Apple Silicon and Intel.');

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('./', import.meta.url));
const source = path.join(here, 'out', '0.1.0-alpha.9', 'akilii-win32-x64');
const releases = path.join(here, '..', '.build-cache', 'releases');
if (!fs.existsSync(path.join(source, 'akilii.exe')))
  throw new Error('Missing Windows x64 package.');
fs.mkdirSync(releases, { recursive: true });
execFileSync(
  'ditto',
  ['-c', '-k', '--keepParent', source, path.join(releases, 'akilii-0.1.0-alpha.9-windows-x64.zip')],
  { stdio: 'inherit' },
);
console.log('Created the Windows x64 review archive.');

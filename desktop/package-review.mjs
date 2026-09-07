import { packager } from '@electron/packager';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const here = fileURLToPath(new URL('./', import.meta.url));
execFileSync(process.execPath, [here + 'build-shared.mjs'], {
  stdio: 'inherit',
});
const paths = await packager({
  dir: here,
  name: 'akilii',
  platform: process.env.AKILII_PLATFORM || 'darwin',
  arch: (process.env.AKILII_ARCH || 'x64,arm64').split(','),
  out: here + 'out/phase8',
  overwrite: true,
  extendInfo: {NSMicrophoneUsageDescription:'Use your microphone when you choose a voice conversation or dictation in akilii.'},
  icon: here + (process.env.AKILII_PLATFORM === 'win32' ? 'icons/akilii.ico' : 'icons/akilii.icns'),
  protocols: [{ name: 'akilii', schemes: ['akilii'] }],
  download: { cacheRoot: here + '../.build-cache/electron' },
  ignore: [/^\/out($|\/)/, /\.test\.cjs$/],
});
console.log(paths.join('\n'));

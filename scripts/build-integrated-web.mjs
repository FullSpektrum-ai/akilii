import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const source = path.join(root, 'app', 'web', 'integration');
const output = path.join(root, 'dist', 'integration');

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

const result = await build({
  entryPoints: [path.join(source, 'main.js')],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  outfile: path.join(output, 'app.js'),
  sourcemap: true,
  minify: false,
  metafile: true,
  legalComments: 'none',
  logLevel: 'warning',
});

fs.copyFileSync(path.join(source, 'index.html'), path.join(output, 'index.html'));
fs.copyFileSync(path.join(root, 'app', 'web', 'app.css'), path.join(output, 'app.css'));

const tokens = JSON.parse(fs.readFileSync(path.join(root, 'theme-tokens.json'), 'utf8'));
const tokenName = name => `--${name.replaceAll('/', '-').replaceAll(/[^a-zA-Z0-9-]/g, '-')}`;
let tokenCss = '';
for (const mode of ['light', 'dark']) {
  const selector = mode === 'light'
    ? ':root,[data-theme="light"]'
    : '[data-theme="dark"]';
  tokenCss += `${selector}{\n`;
  for (const token of tokens) tokenCss += `  ${tokenName(token.name)}:${token[mode]};\n`;
  tokenCss += '}\n';
}
fs.writeFileSync(path.join(output, 'tokens.css'), tokenCss);

const runtime = {
  apiBase: process.env.AKILII_API_BASE || '/api/v1',
  supabaseUrl: process.env.AKILII_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.AKILII_PUBLIC_SUPABASE_ANON_KEY || '',
  build: 'integration',
};
fs.writeFileSync(
  path.join(output, 'runtime-config.js'),
  `window.__AKILII_RUNTIME_CONFIG__=${JSON.stringify(runtime)};\n`,
);
fs.writeFileSync(
  path.join(output, 'build-meta.json'),
  JSON.stringify(result.metafile, null, 2),
);

console.log(`Built integrated web shell at ${path.relative(root, output)}/`);

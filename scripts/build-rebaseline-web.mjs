import fs from 'node:fs';
import path from 'node:path';
import { build } from 'esbuild';

const root = process.cwd();
const source = path.join(root, 'app', 'web');
const output = path.join(root, 'dist', 'rebaseline');

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

for (const name of ['index.html', 'app.css']) {
  fs.copyFileSync(path.join(source, name), path.join(output, name));
}

const tokens = JSON.parse(fs.readFileSync(path.join(root, 'theme-tokens.json'), 'utf8'));
const modes = ['light', 'dark'];
const tokenName = name => `--${name.replaceAll('/', '-').replaceAll(/[^a-zA-Z0-9-]/g, '-')}`;
let tokenCss = '';
for (const mode of modes) {
  const selector = mode === 'light' ? ':root,[data-theme="light"]' : '[data-theme="dark"]';
  tokenCss += `${selector}{\n`;
  for (const token of tokens) tokenCss += `  ${tokenName(token.name)}:${token[mode]};\n`;
  tokenCss += '}\n';
}
fs.writeFileSync(path.join(output, 'tokens.css'), tokenCss);
fs.writeFileSync(path.join(output, 'build-meta.json'), JSON.stringify(result.metafile, null, 2));

console.log(`Built re-baselined web shell at ${path.relative(root, output)}/`);

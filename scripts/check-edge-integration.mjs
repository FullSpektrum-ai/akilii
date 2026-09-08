import { build } from 'esbuild';

await build({
  entryPoints: ['supabase/functions/akilii-api-integration/index.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'neutral',
  target: 'es2022',
  external: ['npm:*', 'https://*'],
  logLevel: 'warning',
});

console.log('Integrated Supabase Edge composition compiled successfully.');

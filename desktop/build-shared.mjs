import fs from 'node:fs';import {execFileSync} from 'node:child_process';import {build} from '../node_modules/esbuild/lib/main.js';import {fileURLToPath} from 'node:url';
process.chdir(fileURLToPath(new URL('../',import.meta.url)));execFileSync(process.execPath,['build.mjs'],{cwd:process.cwd(),stdio:'inherit'});
await build({absWorkingDir:process.cwd(),entryPoints:['src/server.js'],bundle:true,format:'cjs',platform:'node',target:'node24',outfile:'desktop/shared-server.cjs',loader:{'.html':'text','.bundle.js':'text','.mjs':'text'}});
fs.cpSync('drizzle','desktop/migrations',{recursive:true});

fs.copyFileSync('auth-options.json','desktop/auth-options.json');

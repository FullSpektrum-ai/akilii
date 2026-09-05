import fs from 'node:fs';import {build} from 'esbuild';
await import('./build.mjs');
const out='dist/web';fs.mkdirSync(out+'/storyboard',{recursive:true});
const auth=await build({entryPoints:['src/supabase-auth.js'],bundle:true,format:'iife',target:'es2022',write:false,minify:true});
let html=fs.readFileSync('src/app.html','utf8');
fs.copyFileSync('src/desktop-handoff.js',out+'/desktop-handoff.js');
fs.copyFileSync('src/desktop-return.js',out+'/desktop-return.js');
fs.writeFileSync(out+'/desktop-return.html','<!doctype html><html><head><meta charset="utf-8"><title>Return to akilii</title></head><body><h1>Return to akilii</h1><p id="handoff-status">Opening your desktop workspace…</p><a id="handoff-link" hidden>Open akilii desktop</a><script src="./desktop-return.js"></script></body></html>');
html=html.replace('<head>','<head><script src="./desktop-handoff.js"></script>');
html=html.replace('<head>','<head><meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data:; font-src \'self\' data:; connect-src \'self\' https://xmesqilkgeaoqrxbooqe.supabase.co https://login.microsoftonline.com https://graph.microsoft.com; frame-src https://login.microsoftonline.com; media-src \'self\' blob:; worker-src \'self\' blob:; object-src \'none\'; base-uri \'self\'">');
html=html.replace('<script>const $=', '<script>'+auth.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script><script>const $=');
if(!html.includes('akilii-v01-auth'))throw new Error('Auth bootstrap not embedded');
html=html.replaceAll('href="/storyboard"','href="./storyboard/"').replaceAll("import('/document-tools.js')","import('./document-tools.js')");
fs.writeFileSync(out+'/index.html',html);fs.copyFileSync('src/storyboard.html',out+'/storyboard/index.html');
fs.copyFileSync('src/document-tools.bundle.js',out+'/document-tools.js');fs.copyFileSync('src/pdf.worker.mjs',out+'/pdf.worker.mjs');fs.writeFileSync(out+'/.nojekyll','');
console.log('Google/Supabase application built in dist/web.');

const microsoft=await build({entryPoints:['src/microsoft-auth.js'],bundle:true,format:'iife',target:'es2022',write:false,minify:true});
let published=fs.readFileSync(out+'/index.html','utf8');published=published.replace('</body>','<script>'+microsoft.outputFiles[0].text.replaceAll('</script','<\\/script')+'</script></body>');fs.writeFileSync(out+'/index.html',published);
await build({entryPoints:['src/microsoft-redirect.js'],bundle:true,format:'iife',target:'es2022',outfile:out+'/microsoft-redirect.js',minify:true});fs.writeFileSync(out+'/microsoft-redirect.html','<!doctype html><html><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Return to akilii</title></head><body><p>Returning to akilii…</p><script src="./microsoft-redirect.js"></script></body></html>');

fs.cpSync('assets/app-icons',out+'/icons',{recursive:true});
const iconLinks=`<link rel="icon" href="./icons/akilii.ico" sizes="any"><link rel="icon" type="image/svg+xml" href="./icons/icon-dark.svg"><link rel="apple-touch-icon" href="./icons/icon-dark-180.png">`;
let withIcons=fs.readFileSync(out+'/index.html','utf8').replace('</head>',iconLinks+'</head>');fs.writeFileSync(out+'/index.html',withIcons);
let storyIcons=fs.readFileSync(out+'/storyboard/index.html','utf8').replace('</head>',iconLinks.replaceAll('./icons/','../icons/')+'</head>');fs.writeFileSync(out+'/storyboard/index.html',storyIcons);

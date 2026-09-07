import fs from 'node:fs';
const out='dist/web';
let html=fs.readFileSync(out+'/index.html','utf8');
html=html.replace('content="noindex,nofollow"','content="index,follow"').replace('<title>akilii · Your next step</title>','<title>akilii Beta | AI Thinking Partner by FullSpektrum</title>');
html=html.replace('<head>','<head><script>window.akiliiPhase8Default=true;</script>');
html=html.replace('AKILII · PRIVATE EARLY ACCESS','AKILII · BETA DEVELOPMENT PROGRAMME').replace('Bring what’s on your mind. Find a next step that works for you.','Bring what’s on your mind. Find a next step that works for you. Join FullSpektrum’s beta development programme and help shape a conversational AI workspace through real use and feedback.');
html=html.replace('<div id="entry-action">','<p><a class="text-link" href="?phase8=demo">Explore the flagship demo →</a></p><div id="entry-action">');
fs.writeFileSync(out+'/index.html',html);
fs.writeFileSync(out+'/sitemap.xml','<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://akilii.fullspektrum.ai/</loc></url></urlset>');

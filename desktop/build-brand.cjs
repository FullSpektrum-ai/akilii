const fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'..'),brand=JSON.parse(fs.readFileSync(path.join(root,'assets/brand_exports.json'),'utf8'));
const mono=s=>s.replace(/(fill|stroke)="(?:#[0-9a-fA-F]{3,8}|black|white)"/gi,'$1="currentColor"');
const symbol=mono(brand.brand).replace('<svg ','<svg aria-hidden="true" class="brand-symbol" '),word=mono(brand.wordmark).replace('<svg ','<svg aria-hidden="true" class="brand-word" ');
const logo='<div class="brand" aria-label="akilii">'+symbol+'<div class="brand-text">'+word+'<small>EARLY ACCESS</small></div></div>';
const file=path.join(__dirname,'ui/index.html');let html=fs.readFileSync(file,'utf8');html=html.replace(/<!-- BRAND START -->[\s\S]*?<!-- BRAND END -->/,'<!-- BRAND START -->'+logo+'<!-- BRAND END -->');fs.writeFileSync(file,html);

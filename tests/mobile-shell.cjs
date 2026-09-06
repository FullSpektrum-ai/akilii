const {chromium}=require('/Users/andreskepple/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});try{
for(const width of [320,390,430,1280]){
const page=await browser.newPage({viewport:{width,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/*',r=>r.fulfill({status:200,contentType:r.request().url().includes('/api/')?'application/json':'text/html',body:r.request().url().includes('/api/')?JSON.stringify({error:'Fixture signed out'}):fs.readFileSync('src/app.html','utf8')}));
await page.goto('http://fixture.test');await page.evaluate(()=>{document.querySelector('#entry').hidden=true;document.querySelector('#application').hidden=false;});
if(width<=760){
assert(await page.locator('#mobile-nav .brand-symbol').isVisible());
for(const value of ['', 'A next step']){await page.locator('#message-input').count().then(async count=>{await page.locator(count?'#message-input':'.composer textarea').fill(value)});const c=await page.locator('.composer').boundingBox(),s=await page.locator('#send').boundingBox();assert(Math.abs(c.x+c.width-s.x-s.width-13)<3,'send right');assert(Math.abs(c.y+c.height-s.y-s.height-13)<3,'send bottom');}
await page.locator('#mobile-nav').click();assert(await page.locator('.sidebar .search input').isVisible());assert.equal(await page.locator('.brand-area .brand-symbol').evaluate(e=>getComputedStyle(e).width),'32px');await page.screenshot({path:'/tmp/akilii-drawer-'+width+'.png'});assert.equal(await page.locator('.workspace').evaluate(e=>e.inert),true);
await page.locator('#collapse').click();assert.equal(await page.locator('.workspace').evaluate(e=>e.inert),false);
assert.equal(await page.locator('.mobile-context-choices input').count(),2);
await page.screenshot({path:'/tmp/akilii-mobile-'+width+'.png'});await page.evaluate(()=>document.documentElement.dataset.theme='dark');await page.screenshot({path:'/tmp/akilii-mobile-dark-'+width+'.png'});
}
assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'page overflow');assert.deepEqual(errors,[]);await page.close();}
console.log('PASS mobile 320/390/430 and desktop 1280: brand, drawer, composer anchors, no overflow or script errors');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});

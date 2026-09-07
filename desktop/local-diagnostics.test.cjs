const test=require('node:test'),assert=require('node:assert/strict');
const {inspect,recordTiming}=require('./local-diagnostics.cjs');
test('diagnostics expose metadata without chat content and handle unavailable service',async()=>{
 const old=global.fetch;
 try{recordTiming({model:'test',firstTokenMs:20});global.fetch=async()=>{throw Error('offline')};const offline=await inspect();assert.equal(offline.available,false);assert.equal(offline.latest.model,'test');
 global.fetch=async url=>new Response(JSON.stringify(url.endsWith('version')?{version:'test'}:{models:[{name:'test',size:100,size_vram:80,context_length:2048,secret:'not exposed'}]}));const online=await inspect();assert.equal(online.running[0].gpuBytes,80);assert.equal(JSON.stringify(online).includes('not exposed'),false);
 }finally{global.fetch=old;}
});

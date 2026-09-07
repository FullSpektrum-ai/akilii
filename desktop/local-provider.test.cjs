const test=require('node:test'),assert=require('node:assert/strict');
test('installed embedding-only and unverified models cannot be offered for chat',async()=>{
 const old=global.fetch;
 try{global.fetch=async(url,options)=>{
  if(url.endsWith('/api/tags'))return new Response(JSON.stringify({models:[{name:'chat'},{name:'embed'},{name:'unknown'}]}));
  const {model}=JSON.parse(options.body);
  return new Response(JSON.stringify(model==='chat'?{capabilities:['completion']}:model==='embed'?{capabilities:['embedding']}:{details:{}}));
 };const {localModels}=require('./local-provider.cjs');assert.deepEqual((await localModels()).map(m=>m.id),['chat']);}
 finally{global.fetch=old;}
});

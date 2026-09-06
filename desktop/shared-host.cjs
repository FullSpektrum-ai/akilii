const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{randomBytes}=require('node:crypto');
const worker=require('./shared-server.cjs').default;
async function startSharedHost(directory,openExternal=async()=>{},fetchImpl=globalThis.fetch){
 const {DatabaseSync}=require('node:sqlite');fs.mkdirSync(directory,{recursive:true,mode:0o700});const file=path.join(directory,'workspace.sqlite');const sql=new DatabaseSync(file);fs.chmodSync(file,0o600);
 sql.exec('CREATE TABLE IF NOT EXISTS desktop_migrations (name TEXT PRIMARY KEY)');
 for(const name of fs.readdirSync(path.join(__dirname,'migrations')).filter(n=>n.endsWith('.sql')).sort()){if(sql.prepare('SELECT name FROM desktop_migrations WHERE name=?').get(name))continue;sql.exec('BEGIN');try{sql.exec(fs.readFileSync(path.join(__dirname,'migrations',name),'utf8'));sql.prepare('INSERT INTO desktop_migrations VALUES (?)').run(name);sql.exec('COMMIT');}catch(e){sql.exec('ROLLBACK');throw e;}}
 const DB={prepare(query){return {bind(...args){return {async first(){return sql.prepare(query).get(...args)||null},async all(){return {results:sql.prepare(query).all(...args)}},async run(){return {meta:{changes:sql.prepare(query).run(...args).changes}}}}}}},async batch(statements){sql.exec('BEGIN');try{const out=[];for(const s of statements)out.push(await s.run());sql.exec('COMMIT');return out;}catch(e){sql.exec('ROLLBACK');throw e;}}};
 const cloud=require('./cloud-session.cjs').cloudSession(openExternal,fetchImpl);const modeFile=path.join(directory,'mode.json');let mode='cloud';try{const saved=JSON.parse(fs.readFileSync(modeFile,'utf8')).mode;if(['cloud','local','hybrid'].includes(saved))mode=saved;}catch{}
 const secret=randomBytes(32).toString('hex');let origin;
 const server=http.createServer(async(req,res)=>{try{
  if(req.headers.host!==new URL(origin).host){res.writeHead(403);res.end();return;}
  const url=new URL(req.url,origin);
  if(url.pathname==='/launch'&&url.searchParams.get('key')===secret){res.writeHead(302,{'Set-Cookie':`akilii_local=${secret}; HttpOnly; SameSite=Strict; Path=/`,Location:'/'});res.end();return;}
  if(!(req.headers.cookie||'').split(';').some(c=>c.trim()===`akilii_local=${secret}`)){res.writeHead(403);res.end('Open this workspace from akilii desktop.');return;}
  if(url.pathname.startsWith('/desktop/')){
   if(req.method==='POST'&&req.headers.origin!==origin){res.writeHead(403);res.end();return;}
   res.setHeader('Content-Type','application/json');
   if(url.pathname==='/desktop/signin'&&req.method==='POST'){await cloud.signIn();res.end('{}');return;}
   if(url.pathname==='/desktop/signout'&&req.method==='POST'){cloud.signOut();res.end('{}');return;}
   if(url.pathname==='/desktop/mode'){if(req.method==='POST'){let body='';for await(const c of req){body+=c;if(body.length>200)throw Error('Too large');}const next=JSON.parse(body).mode;if(!['cloud','local','hybrid'].includes(next)){res.writeHead(400);res.end('{}');return;}if(next==='local'){let installed=[];try{installed=await require('./local-provider.cjs').localModels();}catch{}if(!installed.length){res.writeHead(409);res.end(JSON.stringify({error:'Start Ollama and install a model before switching to local-first.'}));return;}}mode=next;fs.writeFileSync(modeFile,JSON.stringify({mode}),{mode:0o600});}res.end(JSON.stringify({mode}));return;}
   res.writeHead(404);res.end('{}');return;
  }
  const chunks=[];let bytes=0;for await(const c of req){bytes+=c.length;if(bytes>48000){res.writeHead(413);res.end();return;}chunks.push(c);}
  const control=new AbortController();res.on('close',()=>control.abort());
  const request=new Request(url,{method:req.method,headers:req.headers,signal:control.signal,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(chunks)});
  let available=[];try{available=await require('./local-provider.cjs').localModels();}catch{}
  let response;if(url.pathname.startsWith('/api/')&&mode!=='local')response=await cloud.request(request);else response=await worker.fetch(request,{DB,models:available,selectModel:id=>{const m=available.find(m=>m.id===id);if(!m)throw Object.assign(new Error('Choose an installed local model.'),{status:400});return m;},modelFetch:require('./local-provider.cjs').modelFetch,actor:{id:'local-device-owner',email:'local@device.invalid'}},{waitUntil:p=>p.catch(()=>{})});
  if((response.headers.get('content-type')||'').includes('text/html')){let html=await response.text();html=html.replace('<script>const $=', '<script>'+fs.readFileSync(path.join(__dirname,'bridge-ui.js'),'utf8')+'</script><script>const $=');response=new Response(html,{status:response.status,headers:response.headers});}
  res.writeHead(response.status,Object.fromEntries(response.headers));if(response.body){for await(const chunk of response.body){if(res.destroyed)break;res.write(chunk);}}res.end();
 }catch{if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Unable to connect. Check your internet connection and try again.'}));}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin=`http://127.0.0.1:${server.address().port}`;
 return {origin,url:origin+'/launch?key='+secret,acceptAuth:value=>cloud.accept(value),close:()=>server.close()};
}
module.exports={startSharedHost};

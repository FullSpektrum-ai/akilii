import http from 'node:http';import fs from 'node:fs';import worker from './dist/server/index.js';import {makeDB} from './tests/db-adapter.mjs';import {createFlowStateClient} from './runtime/flowstate-client.mjs';
const DB=makeDB();const flowstate=createFlowStateClient();const env={DB,FLOWSTATE_BASE_URL:flowstate.origin,flowstateGenerate:flowstate.generate};if(fs.existsSync('.env.local')){for(const line of fs.readFileSync('.env.local','utf8').split('\n')){const i=line.indexOf('=');if(i>0)env[line.slice(0,i)]=line.slice(i+1).replace(/^['"]|['"]$/g,'');}}
http.createServer(async(req,res)=>{const localPath=new URL(req.url,'http://127.0.0.1:4317').pathname;
const reviewFiles={
 '/downloads/akilii-alpha.9-mac-intel.zip':['.build-cache/releases/akilii-alpha.9-mac-intel.zip','application/zip'],
 '/downloads/akilii-alpha.9-mac-arm64.zip':['.build-cache/releases/akilii-alpha.9-mac-arm64.zip','application/zip'],
 '/review/smartbar/index.html':['desktop/smartbar/index.html','text/html'],
 '/review/smartbar/style.css':['desktop/smartbar/style.css','text/css'],
 '/review/smartbar/app.js':['desktop/smartbar/app.js','text/javascript'],
 '/review/icons/icon-dark-512.png':['desktop/icons/icon-dark-512.png','image/png']
};
if(reviewFiles[localPath]){const [file,type]=reviewFiles[localPath];if(!fs.existsSync(file)){res.writeHead(404);res.end('Build not available.');return;}res.writeHead(200,{'Content-Type':type,'Content-Length':fs.statSync(file).size,...(type==='application/zip'?{'Content-Disposition':'attachment; filename="'+file.split('/').at(-1)+'"'}:{})});if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file).pipe(res);return;}
const headers=new Headers(req.headers);headers.set('oai-authenticated-user-id','local-reviewer');headers.set('oai-authenticated-user-email','local-reviewer@example.test');const parts=[];for await(const p of req)parts.push(p);const request=new Request('http://127.0.0.1:4317'+req.url,{method:req.method,headers,body:['GET','HEAD'].includes(req.method)?undefined:Buffer.concat(parts)});const response=await worker.fetch(request,env,{waitUntil:p=>p.catch(()=>{})});res.writeHead(response.status,Object.fromEntries(response.headers));if(response.body){const reader=response.body.getReader();res.on('close',()=>reader.cancel().catch(()=>{}));try{while(true){const {done,value}=await reader.read();if(done)break;res.write(value);}}catch{}}res.end();}).listen(4317,'127.0.0.1',()=>console.log('Local review: http://127.0.0.1:4317 (synthetic identity, in-memory test database)'));

import postgres from 'npm:postgres@3.4.7';
import api from '../../../src/api.js';
import {postgresAdapter} from '../../../backend/postgres-adapter.js';
import {connectionRoute,mcpCall} from '../../../backend/mcp.js';
import {runtimeRoute} from '../../../backend/runtime.js';
const project=Deno.env.get('SUPABASE_URL')!;
const sql=postgres(Deno.env.get('SUPABASE_DB_URL')!,{prepare:false,max:2,idle_timeout:10,connect_timeout:10,types:{bigint:{to:20,from:[20],serialize:String,parse:Number}}});
const origins=new Set(['https://fullspektrum-ai.github.io','http://127.0.0.1:4318']);
Deno.serve(async req=>{
 const origin=req.headers.get('origin')||'';
 const headers={'Access-Control-Allow-Origin':origins.has(origin)?origin:'https://fullspektrum-ai.github.io','Access-Control-Allow-Headers':'authorization, apikey, content-type, x-client-info','Access-Control-Allow-Methods':'GET, POST, DELETE, OPTIONS','Vary':'Origin','Cache-Control':'no-store','Content-Type':'application/json'};
 const response=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers});
 if(req.method==='OPTIONS')return new Response(null,{status:origins.has(origin)?204:403,headers});
 if(!origins.has(origin))return response({error:'This application origin is not approved.'},403);
 try{
  const authorization=req.headers.get('authorization');if(!authorization?.startsWith('Bearer '))return response({error:'Please sign in with Google.'},401);
  const auth=await fetch(project+'/auth/v1/user',{headers:{Authorization:authorization,apikey:Deno.env.get('SUPABASE_ANON_KEY')!}});
  if(!auth.ok)return response({error:'Your session expired. Please sign in again.'},401);
  const user=await auth.json();
  if(!user.id||!user.email_confirmed_at||!user.identities?.some((i:any)=>i.provider==='google'))return response({error:'A verified Google account is required.'},403);
  const [grant]=await sql`select email,user_id from akilii.beta_access where email=${user.email.toLowerCase()} and enabled=true`;
  if(!grant||(grant.user_id&&grant.user_id!==user.id))return response({error:'This preview is available to invited beta reviewers. Contact the preview owner for access.'},403);
  await sql`update akilii.beta_access set user_id=${user.id} where email=${grant.email} and user_id is null`;
  const actor={id:user.id,email:user.email},db=postgresAdapter(sql,actor);
  const url=new URL(req.url);const path=url.pathname.replace(/^\/akilii-api|^\/functions\/v1\/akilii-api/,'')||'/api/bootstrap';
  if(!path.startsWith('/api/'))return response({error:'Not found.'},404);
  // Only authenticated server-derived identity reaches the shared application handler.
  const h=new Headers({'origin':'https://akilii.internal','content-type':req.headers.get('content-type')||'application/json'});
  let raw:Uint8Array|undefined;
  if(!['GET','HEAD'].includes(req.method)){
   const reader=req.body?.getReader();let size=0;const chunks=[];
   if(reader){for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>48000){await reader.cancel();return response({error:'Request too large.'},413);}chunks.push(value);}}
   raw=new Uint8Array(size);let offset=0;for(const c of chunks){raw.set(c,offset);offset+=c.length;}
  }
  if(path==='/api/connections'||path==='/api/mcp'||path==='/api/runtime'||path.startsWith('/api/runs')){
   const profile=await db.prepare('SELECT * FROM profiles WHERE user_id=?').bind(actor.id).first();if(!profile)return response({error:'Complete account setup first.'},403);
   const parsed=raw?.length?JSON.parse(new TextDecoder().decode(raw)):null;
   if(path==='/api/connections')return response(await connectionRoute(req.method,parsed,db,actor));
   if(path==='/api/mcp'){if(req.method!=='POST')return response({error:'Use POST.'},405);return response(await mcpCall(parsed,db,actor));}
   const result=await runtimeRoute(path,req.method,raw?.length?JSON.parse(new TextDecoder().decode(raw)):null,db,actor);
   return result?response(result):response({error:'Not found.'},404);
  }
  if(path==='/api/export'){
   const res=await api.fetch(new Request('https://akilii.internal'+path+url.search,{headers:h}),{DB:db,actor},{waitUntil:EdgeRuntime.waitUntil});
   if(!res.ok)return response(await res.json(),res.status);
   const data=await res.json();data.agent=await db.transaction(async tx=>({runs:await tx`select * from runs where user_id=${actor.id}`,actions:await tx`select * from actions where user_id=${actor.id}`,events:await tx`select * from run_events where user_id=${actor.id}`,connections:await tx`select * from connections where user_id=${actor.id}`}));return response(data);
  }
  const result=await api.fetch(new Request('https://akilii.internal'+path+url.search,{method:req.method,headers:h,body:raw,signal:req.signal}),{DB:db,actor,OPENAI_API_KEY:Deno.env.get('OPENAI_API_KEY')},{waitUntil:EdgeRuntime.waitUntil});
  const outHeaders=new Headers(result.headers);for(const [k,v]of Object.entries(headers))if(k!=='Content-Type')outHeaders.set(k,v);
  return new Response(result.body,{status:result.status,headers:outHeaders});
 }catch(e){if(e instanceof SyntaxError)return response({error:'Invalid JSON request.'},400);console.error('akilii_request_failed',e.code||e.name);return response({error:e.status?e.message:'The backend could not complete this request. Please try again.'},e.status||500);}
});

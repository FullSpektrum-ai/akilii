import {runtimeRoute} from './runtime.js';
const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export async function connectionRoute(method,b,db,actor){
 if(method==='GET')return db.transaction(async tx=>({connections:await tx`select server_key,status,scopes from connections where user_id=${actor.id}`}));
 if(method!=='POST'||b?.server_key!=='akilii-work'||typeof b.enabled!=='boolean')fail(400,'Choose a supported integration.');
 return db.transaction(async tx=>{
  await tx`insert into connections(id,user_id,server_key,scopes,status,created_at) values(${crypto.randomUUID()},${actor.id},'akilii-work','["work.read","work.propose"]'::jsonb,${b.enabled?'connected':'revoked'},${Date.now()}) on conflict(user_id,server_key) do update set status=excluded.status`;
  return {ok:true};
 });
}
// Internal JSON-RPC tool transport. It is not exposed as a third-party OAuth MCP server.
// The Edge boundary verifies identity; connection choice is checked on every tool call.
export async function mcpCall(b,db,actor){
 const error=(code,message)=>({jsonrpc:'2.0',id:b?.id??null,error:{code,message}});
 if(!b||b.jsonrpc!=='2.0'||typeof b.method!=='string')return error(-32600,'Invalid request');
 const result=data=>({jsonrpc:'2.0',id:b.id??null,result:data});
 if(b.method==='initialize')return result({protocolVersion:'2025-03-26',capabilities:{tools:{}},serverInfo:{name:'akilii-work',version:'0.1.0'}});
 if(b.method==='ping')return result({});
 const enabled=await db.transaction(async tx=>!!(await tx`select id from connections where user_id=${actor.id} and server_key='akilii-work' and status='connected'`).length);
 if(!enabled)return error(-32001,'Enable the akilii Work integration first.');
 if(b.method==='tools/list')return result({tools:[{name:'work_list',description:'Read your saved Work plans.',inputSchema:{type:'object',properties:{},additionalProperties:false}},{name:'work_propose_version',description:'Propose a revised saved plan. User approval in akilii is required before any plan changes.',inputSchema:{type:'object',properties:{work_id:{type:'string'},work_version:{type:'integer',minimum:1},body:{type:'string',maxLength:14000},request_key:{type:'string'}},required:['work_id','work_version','body','request_key'],additionalProperties:false}}]});
 if(b.method!=='tools/call')return error(-32601,'Method not found');
 try{
  let data;
  if(b.params?.name==='work_list')data=await db.transaction(tx=>tx`select id,title,body,version from work_items where user_id=${actor.id} order by updated_at desc limit 50`);
  else if(b.params?.name==='work_propose_version')data=await runtimeRoute('/api/runs','POST',b.params.arguments,db,actor);
  else return error(-32602,'Unknown tool');
  return result({content:[{type:'text',text:JSON.stringify(data)}]});
 }catch(e){return result({isError:true,content:[{type:'text',text:e.status?e.message:'The tool could not complete.'}]});}
}

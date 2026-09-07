import {runtimeCapabilities} from './runtime-capabilities.js';
export {runtimeCapabilities};

const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const validRequestKey=value=>typeof value==='string'&&/^[a-zA-Z0-9-]{10,80}$/.test(value);
const boundedText=(value,max)=>typeof value==='string'&&!!value.trim()&&value.length<=max;

export function validateProposal(b){
 if(!b||!boundedText(b.body,14000)||!validRequestKey(b.request_key))fail(400,'A valid proposal and request identifier are required.');
 if(b.runtime&&b.runtime!=='direct')fail(503,'FlowState is not connected yet.');
 if(b.operation==='create'){
  if(!boundedText(b.title,120))fail(400,'Give the proposed Work item a title.');
  return {operation:'create',title:b.title.trim(),body:b.body.trim(),request_key:b.request_key};
 }
 if(typeof b.work_id!=='string'||!b.work_id||!Number.isInteger(b.work_version)||b.work_version<1)fail(400,'A valid Work version, proposal and request identifier are required.');
 return {operation:'update',work_id:b.work_id,work_version:b.work_version,body:b.body.trim(),request_key:b.request_key};
}

export async function runtimeRoute(path,method,b,db,actor){
 if(path==='/api/runtime'&&method==='GET')return {capabilities:runtimeCapabilities};
 if(path==='/api/runs'&&method==='GET')return db.transaction(async tx=>({runs:await tx`select * from runs where user_id=${actor.id} order by created_at desc limit 50`}));
 if(path==='/api/runs'&&method==='POST'){
  const p=validateProposal(b);return db.transaction(async tx=>{
   await tx`select pg_advisory_xact_lock(hashtextextended(${actor.id+':'+p.request_key},0))`;
   const existing=await tx`select * from runs where user_id=${actor.id} and request_key=${p.request_key}`;
   if(existing.length){
    const [action]=await tx`select id from actions where run_id=${existing[0].id} and user_id=${actor.id} order by expires_at desc limit 1`;
    return {run:existing[0],action_id:action?.id,replayed:true};
   }
   let workId=p.work_id,workVersion=p.work_version,tool='work.save_version',args={body:p.body};
   if(p.operation==='create'){
    workId=crypto.randomUUID();workVersion=0;tool='work.create';args={title:p.title,body:p.body};
   }else{
    const [work]=await tx`select * from work_items where id=${p.work_id} and user_id=${actor.id} for update`;
    if(!work)fail(404,'Work item not found.');
    if(Number(work.version)!==p.work_version)fail(409,'The Work item changed. Review the current version.');
   }
   const id=crypto.randomUUID(),action=crypto.randomUUID(),at=Date.now();
   const [run]=await tx`insert into runs(id,user_id,work_id,runtime,status,request_key,created_at,updated_at) values(${id},${actor.id},${workId},'direct','awaiting_approval',${p.request_key},${at},${at}) returning *`;
   await tx`insert into actions(id,user_id,run_id,tool,arguments,status,work_version,expires_at) values(${action},${actor.id},${id},${tool},${JSON.stringify(args)}::jsonb,'proposed',${workVersion},${at+900000})`;
   await tx`insert into run_events(user_id,run_id,event_type,payload,created_at) values(${actor.id},${id},'action_proposed',${JSON.stringify({action_id:action,tool})}::jsonb,${at})`;
   return {run,action_id:action};
  });
 }
 const match=path.match(/^\/api\/runs\/([a-zA-Z0-9-]+)(?:\/(approve|cancel))?$/);
 if(!match)return null;
 return db.transaction(async tx=>{
  const [run]=await tx`select * from runs where id=${match[1]} and user_id=${actor.id} for update`;
  if(!run)fail(404,'Run not found.');
  if(method==='GET'&&!match[2])return {run,actions:await tx`select * from actions where run_id=${run.id} and user_id=${actor.id}`,events:await tx`select * from run_events where run_id=${run.id} and user_id=${actor.id} order by id`};
  if(method!=='POST')fail(405,'Method not allowed.');
  if(match[2]==='cancel'){
   if(['succeeded','failed','cancelled'].includes(run.status))return {run};
   const at=Date.now();
   await tx`update actions set status='rejected' where run_id=${run.id} and user_id=${actor.id} and status='proposed'`;
   await tx`update runs set status='cancelled',updated_at=${at} where id=${run.id} and user_id=${actor.id}`;
   await tx`insert into run_events(user_id,run_id,event_type,created_at) values(${actor.id},${run.id},'cancelled',${at})`;
   return {ok:true};
  }
  if(match[2]!=='approve'||typeof b?.action_id!=='string')fail(400,'Select the exact action to approve.');
  const [action]=await tx`select * from actions where id=${b.action_id} and run_id=${run.id} and user_id=${actor.id} for update`;
  if(!action)fail(404,'Action not found.');
  if(action.status==='executed')return {receipt:action.receipt,replayed:true};
  if(run.status!=='awaiting_approval'||action.status!=='proposed'||Number(action.expires_at)<Date.now())fail(409,'This approval is no longer valid.');
  if(!['work.create','work.save_version'].includes(action.tool))fail(403,'Tool not permitted.');
  const at=Date.now();
  await tx`update actions set status='approved' where id=${action.id} and user_id=${actor.id} and status='proposed'`;
  await tx`insert into run_events(user_id,run_id,event_type,payload,created_at) values(${actor.id},${run.id},'action_approved',${JSON.stringify({action_id:action.id,tool:action.tool})}::jsonb,${at})`;
  let receipt;
  if(action.tool==='work.create'){
   const existing=await tx`select id from work_items where id=${run.work_id} and user_id=${actor.id} for update`;
   if(existing.length)fail(409,'This Work item already exists. Review the run before retrying.');
   const title=typeof action.arguments?.title==='string'?action.arguments.title.trim():'';
   const body=typeof action.arguments?.body==='string'?action.arguments.body.trim():'';
   if(!title||!body)fail(409,'The approved Work proposal is incomplete.');
   await tx`insert into work_items(id,user_id,title,body,version,created_at,updated_at) values(${run.work_id},${actor.id},${title},${body},1,${at},${at})`;
   receipt={tool:action.tool,work_id:run.work_id,title,version:1,executed_at:at};
  }else{
   const [work]=await tx`select * from work_items where id=${run.work_id} and user_id=${actor.id} for update`;
   if(!work||Number(work.version)!==Number(action.work_version))fail(409,'The Work item changed. Create a new proposal.');
   const body=typeof action.arguments?.body==='string'?action.arguments.body.trim():'';
   if(!body)fail(409,'The approved Work proposal is incomplete.');
   const version=Number(work.version)+1;
   await tx`insert into work_versions(id,user_id,work_id,body,version,created_at) values(${crypto.randomUUID()},${actor.id},${work.id},${work.body},${work.version},${at})`;
   await tx`update work_items set body=${body},version=${version},updated_at=${at} where id=${work.id} and user_id=${actor.id}`;
   receipt={tool:action.tool,work_id:work.id,title:work.title,version,executed_at:at};
  }
  await tx`update actions set status='executed',receipt=${JSON.stringify(receipt)}::jsonb where id=${action.id} and user_id=${actor.id}`;
  await tx`update runs set status='succeeded',updated_at=${at} where id=${run.id} and user_id=${actor.id}`;
  await tx`insert into run_events(user_id,run_id,event_type,payload,created_at) values(${actor.id},${run.id},'succeeded',${JSON.stringify(receipt)}::jsonb,${at})`;
  return {receipt};
 });
}

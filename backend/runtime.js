export const runtimeCapabilities={direct:{available:true,tools:['work.save_version']},flowstate:{available:false,reason:'Awaiting authenticated, isolated FlowState service deployment'},mcp:{available:false,reason:'No approved MCP service connected'}};
export function validateProposal(b){
 if(!b||typeof b.work_id!=='string'||!Number.isInteger(b.work_version)||b.work_version<1||typeof b.body!=='string'||!b.body.trim()||b.body.length>14000||typeof b.request_key!=='string'||!/^[a-zA-Z0-9-]{10,80}$/.test(b.request_key))throw Object.assign(new Error('A valid Work version, proposal and request identifier are required.'),{status:400});
 if(b.runtime&&b.runtime!=='direct')throw Object.assign(new Error('FlowState is not connected yet.'),{status:503});
 return {work_id:b.work_id,work_version:b.work_version,body:b.body.trim(),request_key:b.request_key};
}
export async function runtimeRoute(path,method,b,db,actor){
 if(path==='/api/runtime'&&method==='GET')return {capabilities:runtimeCapabilities};
 if(path==='/api/runs'&&method==='GET')return db.transaction(async tx=>({runs:await tx`select * from runs where user_id=${actor.id} order by created_at desc limit 50`}));
 if(path==='/api/runs'&&method==='POST'){
  const p=validateProposal(b);return db.transaction(async tx=>{
   await tx`select pg_advisory_xact_lock(hashtextextended(${actor.id+':'+p.request_key},0))`;
   const existing=await tx`select * from runs where user_id=${actor.id} and request_key=${p.request_key}`;
   if(existing.length)return {run:existing[0],replayed:true};
   const work=await tx`select * from work_items where id=${p.work_id} and user_id=${actor.id} for update`;
   if(!work.length)throw Object.assign(new Error('Work item not found.'),{status:404});
   if(Number(work[0].version)!==p.work_version)throw Object.assign(new Error('The Work item changed. Review the current version.'),{status:409});
   const id=crypto.randomUUID(),action=crypto.randomUUID(),at=Date.now();
   const [run]=await tx`insert into runs(id,user_id,work_id,runtime,status,request_key,created_at,updated_at) values(${id},${actor.id},${p.work_id},'direct','awaiting_approval',${p.request_key},${at},${at}) returning *`;
   await tx`insert into actions(id,user_id,run_id,tool,arguments,status,work_version,expires_at) values(${action},${actor.id},${id},'work.save_version',${JSON.stringify({body:p.body})}::jsonb,'proposed',${p.work_version},${at+900000})`;
   await tx`insert into run_events(user_id,run_id,event_type,payload,created_at) values(${actor.id},${id},'action_proposed',${JSON.stringify({action_id:action,tool:'work.save_version'})}::jsonb,${at})`;
   return {run,action_id:action};
  });
 }
 const match=path.match(/^\/api\/runs\/([a-zA-Z0-9-]+)(?:\/(approve|cancel))?$/);
 if(!match)return null;
 return db.transaction(async tx=>{
  const [run]=await tx`select * from runs where id=${match[1]} and user_id=${actor.id} for update`;
  if(!run)throw Object.assign(new Error('Run not found.'),{status:404});
  if(method==='GET'&&!match[2])return {run,actions:await tx`select * from actions where run_id=${run.id} and user_id=${actor.id}`,events:await tx`select * from run_events where run_id=${run.id} and user_id=${actor.id} order by id`};
  if(method!=='POST')throw Object.assign(new Error('Method not allowed.'),{status:405});
  if(match[2]==='cancel'){
   if(['succeeded','failed','cancelled'].includes(run.status))return {run};
   await tx`update actions set status='rejected' where run_id=${run.id} and user_id=${actor.id} and status='proposed'`;
   await tx`update runs set status='cancelled',updated_at=${Date.now()} where id=${run.id} and user_id=${actor.id}`;
   await tx`insert into run_events(user_id,run_id,event_type,created_at) values(${actor.id},${run.id},'cancelled',${Date.now()})`;return {ok:true};
  }
  if(match[2]!=='approve'||typeof b?.action_id!=='string')throw Object.assign(new Error('Select the exact action to approve.'),{status:400});
  const [action]=await tx`select * from actions where id=${b.action_id} and run_id=${run.id} and user_id=${actor.id} for update`;
  if(!action)throw Object.assign(new Error('Action not found.'),{status:404});
  if(action.status==='executed')return {receipt:action.receipt,replayed:true};
  if(run.status!=='awaiting_approval'||action.status!=='proposed'||Number(action.expires_at)<Date.now())throw Object.assign(new Error('This approval is no longer valid.'),{status:409});
  if(action.tool!=='work.save_version')throw Object.assign(new Error('Tool not permitted.'),{status:403});
  const [work]=await tx`select * from work_items where id=${run.work_id} and user_id=${actor.id} for update`;
  if(!work||Number(work.version)!==Number(action.work_version))throw Object.assign(new Error('The Work item changed. Create a new proposal.'),{status:409});
  const version=Number(work.version)+1,at=Date.now();
  await tx`insert into work_versions(id,user_id,work_id,body,version,created_at) values(${crypto.randomUUID()},${actor.id},${work.id},${work.body},${work.version},${at})`;
  await tx`update work_items set body=${action.arguments.body},version=${version},updated_at=${at} where id=${work.id} and user_id=${actor.id}`;
  const receipt={tool:action.tool,work_id:work.id,version,executed_at:at};
  await tx`update actions set status='executed',receipt=${JSON.stringify(receipt)}::jsonb where id=${action.id} and user_id=${actor.id}`;
  await tx`update runs set status='succeeded',updated_at=${at} where id=${run.id} and user_id=${actor.id}`;
  await tx`insert into run_events(user_id,run_id,event_type,payload,created_at) values(${actor.id},${run.id},'succeeded',${JSON.stringify(receipt)}::jsonb,${at})`;
  return {receipt};
 });
}

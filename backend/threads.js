const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const clean=(value,max)=>typeof value==='string'?value.trim().slice(0,max):'';
const validId=value=>value==null||typeof value==='string'&&value.length>0&&value.length<=120;
const validRequestKey=value=>typeof value==='string'&&/^[a-zA-Z0-9-]{10,80}$/.test(value);
const statuses=new Set(['active','held','ready','closed']);
const outcomeRatings=new Set(['helpful','partial','unhelpful']);

export function validateThreadCreate(body){
 const title=clean(body?.title,120),objective=clean(body?.objective,2000),last_confirmed=clean(body?.last_confirmed,4000),last_decision=clean(body?.last_decision,4000),next_move=clean(body?.next_move,2000);
 if(!title||!validRequestKey(body?.request_key))fail(400,'A Thread title and request identifier are required.');
 if(!validId(body?.conversation_id)||!validId(body?.project_id)||!validId(body?.work_id))fail(400,'A linked item identifier is invalid.');
 if(body?.status!==undefined&&!['active','held'].includes(body.status))fail(400,'A new Thread can start active or held.');
 const open_questions=(Array.isArray(body?.open_questions)?body.open_questions:[]).slice(0,12).map(value=>clean(value,1000)).filter(Boolean);
 return {title,objective,status:body?.status||'active',conversation_id:body?.conversation_id||null,project_id:body?.project_id||null,work_id:body?.work_id||null,last_confirmed,last_decision,next_move,open_questions,request_key:body.request_key};
}

export function validateThreadUpdate(body,current){
 if(!Number.isInteger(body?.version)||body.version!==Number(current.version))fail(409,'This Thread changed. Reopen it before updating.');
 const next={};
 if(body.status!==undefined){if(!statuses.has(body.status))fail(400,'Choose a valid Thread state.');next.status=body.status;}
 for(const [key,max] of [['title',120],['objective',2000],['last_confirmed',4000],['last_decision',4000],['next_move',2000]])if(body[key]!==undefined)next[key]=clean(body[key],max);
 if(body.open_questions!==undefined){if(!Array.isArray(body.open_questions))fail(400,'Open questions must be a list.');next.open_questions=body.open_questions.slice(0,12).map(value=>clean(value,1000)).filter(Boolean);}
 if(!Object.keys(next).length)fail(400,'Choose a Thread change to save.');
 return next;
}

export function validateThreadClose(body,current){
 if(!validRequestKey(body?.request_key))fail(400,'A valid outcome request identifier is required.');
 if(!outcomeRatings.has(body?.rating))fail(400,'Choose whether this was helpful, partly helpful or unhelpful.');
 if(!Number.isInteger(body?.version)||body.version!==Number(current.version))fail(409,'This Thread changed. Reopen it before closing.');
 return {rating:body.rating,note:clean(body.note,2000),request_key:body.request_key};
}

async function assertOwnedLink(tx,table,id,actor){
 if(!id)return;
 if(!['conversations','projects','work_items'].includes(table))fail(500,'Invalid Thread link configuration.');
 const rows=await tx.unsafe(`select id from ${table} where id=$1 and user_id=$2`,[id,actor.id]);
 if(!rows.length)fail(404,'A linked item could not be found.');
}

export async function threadRoute(path,method,body,db,actor){
 if(path==='/api/threads'&&method==='GET')return db.transaction(async tx=>({threads:await tx`select * from threads where user_id=${actor.id} order by case status when 'active' then 0 when 'held' then 1 when 'ready' then 2 else 3 end,updated_at desc limit 50`}));
 if(path==='/api/threads'&&method==='POST'){
  const input=validateThreadCreate(body);return db.transaction(async tx=>{
   await tx`select pg_advisory_xact_lock(hashtextextended(${actor.id+':thread:'+input.request_key},0))`;
   const existing=await tx`select * from threads where user_id=${actor.id} and request_key=${input.request_key}`;
   if(existing.length)return {thread:existing[0],replayed:true};
   await assertOwnedLink(tx,'conversations',input.conversation_id,actor);await assertOwnedLink(tx,'projects',input.project_id,actor);await assertOwnedLink(tx,'work_items',input.work_id,actor);
   const id=crypto.randomUUID(),at=Date.now();
   const [thread]=await tx`insert into threads(id,user_id,title,objective,status,conversation_id,project_id,work_id,last_confirmed,last_decision,next_move,open_questions,request_key,version,created_at,updated_at) values(${id},${actor.id},${input.title},${input.objective},${input.status},${input.conversation_id},${input.project_id},${input.work_id},${input.last_confirmed},${input.last_decision},${input.next_move},${JSON.stringify(input.open_questions)}::jsonb,${input.request_key},1,${at},${at}) returning *`;
   return {thread};
  });
 }
 const match=path.match(/^\/api\/threads\/([a-zA-Z0-9-]+)(?:\/(close))?$/);if(!match)return null;
 return db.transaction(async tx=>{
  const [current]=await tx`select * from threads where id=${match[1]} and user_id=${actor.id} for update`;
  if(!current)fail(404,'Thread not found.');
  if(method==='GET'&&!match[2])return {thread:current};
  if(method!=='POST')fail(405,'Method not allowed.');
  if(match[2]==='close'){
   if(!validRequestKey(body?.request_key))fail(400,'A valid outcome request identifier is required.');
   await tx`select pg_advisory_xact_lock(hashtextextended(${actor.id+':outcome:'+body.request_key},0))`;
   const existing=await tx`select * from outcomes where user_id=${actor.id} and request_key=${body.request_key}`;
   if(existing.length){const [thread]=await tx`select * from threads where id=${current.id} and user_id=${actor.id}`;return {thread:thread||current,outcome:existing[0],replayed:true};}
   if(current.status==='closed')fail(409,'This Thread is already closed.');
   const close=validateThreadClose(body,current),at=Date.now(),outcomeId=crypto.randomUUID();
   const [outcome]=await tx`insert into outcomes(id,user_id,thread_id,work_id,project_id,rating,note,request_key,created_at) values(${outcomeId},${actor.id},${current.id},${current.work_id},${current.project_id},${close.rating},${close.note},${close.request_key},${at}) returning *`;
   const [thread]=await tx`update threads set status='closed',closed_at=${at},version=version+1,updated_at=${at} where id=${current.id} and user_id=${actor.id} and version=${current.version} returning *`;
   if(!thread)fail(409,'This Thread changed. Reopen it before closing.');
   return {thread,outcome};
  }
  const changes=validateThreadUpdate(body,current),at=Date.now(),closedAt=changes.status==='closed'?at:changes.status&&changes.status!=='closed'?null:current.closed_at;
  const [thread]=await tx`update threads set title=${changes.title??current.title},objective=${changes.objective??current.objective},status=${changes.status??current.status},last_confirmed=${changes.last_confirmed??current.last_confirmed},last_decision=${changes.last_decision??current.last_decision},next_move=${changes.next_move??current.next_move},open_questions=${JSON.stringify(changes.open_questions??current.open_questions)}::jsonb,closed_at=${closedAt},version=version+1,updated_at=${at} where id=${current.id} and user_id=${actor.id} and version=${current.version} returning *`;
  if(!thread)fail(409,'This Thread changed. Reopen it before updating.');
  return {thread};
 });
}

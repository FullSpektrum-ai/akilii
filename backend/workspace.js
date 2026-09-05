const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const str=(s,max)=>typeof s==='string'?s.trim().slice(0,max):'';
export function validateProject(b){const title=str(b?.title,120),objective=str(b?.objective,2000);if(!title)fail(400,'Give the project a name.');const tasks=(Array.isArray(b.tasks)?b.tasks:[]).slice(0,30).map(t=>({id:crypto.randomUUID(),title:str(t.title||t.label,300),done:false})).filter(t=>t.title);return {title,objective,tasks};}
export async function workspaceRoute(path,method,b,db,actor){return db.transaction(async tx=>{
 if(path==='/api/avatar'&&method==='POST'){
  if(typeof b?.avatar!=='string'||b.avatar.length>40000||(b.avatar&&!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(b.avatar)))fail(400,'Choose a smaller JPEG profile picture.');
  await tx`insert into workspace_settings(user_id,avatar,updated_at) values(${actor.id},${b.avatar},${Date.now()}) on conflict(user_id) do update set avatar=excluded.avatar,updated_at=excluded.updated_at`;return {ok:true};
 }
 if(path==='/api/workspace'){
  if(method==='GET')return {settings:(await tx`select role,objective,presentation,needs,avatar from workspace_settings where user_id=${actor.id}`)[0]||{role:'',objective:'',presentation:'balanced',needs:''},projects:await tx`select * from projects where user_id=${actor.id} order by updated_at desc limit 100`};
  if(method!=='POST'||!['balanced','one-step','overview'].includes(b?.presentation))fail(400,'Choose a workspace presentation.');
  await tx`insert into workspace_settings(user_id,role,objective,presentation,needs,updated_at) values(${actor.id},${str(b.role,100)},${str(b.objective,2000)},${b.presentation},${str(b.needs,2000)},${Date.now()}) on conflict(user_id) do update set role=excluded.role,objective=excluded.objective,presentation=excluded.presentation,needs=excluded.needs,updated_at=excluded.updated_at`;
  return {ok:true};
 }
 if(path==='/api/projects'&&method==='POST'){
  const p=validateProject(b),at=Date.now();const [{count}]=await tx`select count(*) from projects where user_id=${actor.id}`;if(Number(count)>=100)fail(400,'Archive or remove a project before adding another.');
  const [project]=await tx`insert into projects(id,user_id,title,objective,tasks,status,version,created_at,updated_at) values(${crypto.randomUUID()},${actor.id},${p.title},${p.objective},${tx.json(p.tasks)},'active',1,${at},${at}) returning *`;return {project};
 }
 const match=path.match(/^\/api\/projects\/([a-zA-Z0-9-]+)$/);if(!match)fail(404,'Project not found.');
 const [p]=await tx`select * from projects where id=${match[1]} and user_id=${actor.id} for update`;if(!p)fail(404,'Project not found.');
 if(method==='DELETE'){await tx`delete from projects where id=${p.id} and user_id=${actor.id}`;return {ok:true};}
 if(method!=='POST'||b?.version!==Number(p.version))fail(409,'This project changed. Reopen it before editing.');
 if(b.task_id){const task=p.tasks.find(t=>t.id===b.task_id);if(!task||typeof b.done!=='boolean')fail(400,'Choose an existing task.');task.done=b.done;}
 else {if(typeof b.title==='string')p.title=str(b.title,120)||p.title;if(typeof b.objective==='string')p.objective=str(b.objective,2000);if(b.add_task){if(p.tasks.length>=30)fail(400,'This project has reached its 30-task limit.');p.tasks.push({id:crypto.randomUUID(),title:str(b.add_task,300),done:false});}if(b.status){if(!['active','paused','complete'].includes(b.status))fail(400,'Invalid project status.');p.status=b.status;}}
 const [project]=await tx`update projects set title=${p.title},objective=${p.objective},tasks=${tx.json(p.tasks)},status=${p.status},version=version+1,updated_at=${Date.now()} where id=${p.id} and user_id=${actor.id} returning *`;return {project};
});}

const defaults={role:'',objective:'',presentation:'balanced',needs:'',avatar:''};
function workspaceSettings(sql){
 sql.exec('CREATE TABLE IF NOT EXISTS desktop_workspace_settings (id INTEGER PRIMARY KEY CHECK(id=1), value TEXT NOT NULL)');
 const read=()=>({...defaults,...JSON.parse(sql.prepare('SELECT value FROM desktop_workspace_settings WHERE id=1').get()?.value||'{}')});
 const save=value=>sql.prepare('INSERT INTO desktop_workspace_settings(id,value) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').run(JSON.stringify(value));
 return {read,clear:()=>sql.prepare('DELETE FROM desktop_workspace_settings').run(),handle(path,method,b){
 const settings=read();
 if(path==='/api/workspace'&&method==='GET')return {settings,projects:[]};
 if(path==='/api/avatar'&&method==='POST'){
 if(typeof b?.avatar!=='string'||b.avatar.length>40000||(b.avatar&&!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(b.avatar)))throw Object.assign(Error('Choose a smaller JPEG profile picture.'),{status:400});
 save({...settings,avatar:b.avatar});return {ok:true};
 }
 if(path==='/api/workspace'&&method==='POST'){
 if(!['balanced','one-step','overview'].includes(b?.presentation))throw Object.assign(Error('Choose a workspace presentation.'),{status:400});
 const clean=(v,n)=>typeof v==='string'?v.trim().slice(0,n):'';
 save({...settings,role:clean(b.role,100),objective:clean(b.objective,2000),needs:clean(b.needs,2000),presentation:b.presentation});return {ok:true};
 }
 return null;
 }};
}
module.exports={workspaceSettings};

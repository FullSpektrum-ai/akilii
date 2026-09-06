const fs=require('node:fs');const path=require('node:path');const {randomUUID}=require('node:crypto');
class Workspace{
 constructor(dir){fs.mkdirSync(dir,{recursive:true,mode:0o700});this.file=path.join(dir,'workspace.json');this.data=fs.existsSync(this.file)?JSON.parse(fs.readFileSync(this.file,'utf8')):{conversations:[]};}
 save(){fs.writeFileSync(this.file+'.tmp',JSON.stringify(this.data),{mode:0o600});fs.renameSync(this.file+'.tmp',this.file);}
 list(){return this.data.conversations;}
 create(){const c={id:randomUUID(),title:'New conversation',messages:[]};this.data.conversations.unshift(c);this.save();return c;}
 get(id){const c=this.list().find(c=>c.id===id);if(!c)throw Error('Conversation not found');return c;}
 remove(id){this.get(id);this.data.conversations=this.list().filter(c=>c.id!==id);this.save();}
}
const base='http://127.0.0.1:11434';
async function models(){const r=await fetch(base+'/api/tags',{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Ollama is unavailable');return (await r.json()).models.map(m=>m.name);}
async function chat(model,messages,signal,onText,configuration={}){const r=await fetch(base+'/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages,stream:true,...configuration}),signal});if(!r.ok)throw Error('Local model request failed');let pending='';const decoder=new TextDecoder();let done=false;function line(s){if(!s.trim())return;const j=JSON.parse(s);if(j.error)throw Error('Local model reported an error');if(j.message?.content)onText(j.message.content);if(j.done)done=true;}
 for await(const chunk of r.body){pending+=decoder.decode(chunk,{stream:true});if(pending.length>1048576)throw Error('Model response exceeded limits');let i;while((i=pending.indexOf('\n'))>=0){line(pending.slice(0,i));pending=pending.slice(i+1);}}pending+=decoder.decode();line(pending);if(!done)throw Error('Model stream interrupted');}
module.exports={Workspace,models,chat};

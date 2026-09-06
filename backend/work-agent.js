// Bounded read-only tool selection. Tool arguments never become SQL or commands.
export async function workAgent({choose,enabled,list,signal,event}){
 if(!await enabled())throw Object.assign(Error('Enable akilii Work in Integrations before using Work tools.'),{status:403});
 signal?.throwIfAborted();event('Choosing whether saved Work is needed');
 const raw=await choose();signal?.throwIfAborted();let decision;
 try{decision=JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g,''));}catch{throw Object.assign(Error('The model could not choose a valid Work action. Try again or turn Work tools off.'),{status:502});}
 if(decision.tool==='none'){event('No Work lookup needed');return null;}
 if(decision.tool!=='work_list')throw Object.assign(Error('The requested tool is not permitted.'),{status:403});
 if(!await enabled())throw Object.assign(Error('Work access was disconnected.'),{status:403});
 signal?.throwIfAborted();event('Reading saved Work plans');const plans=await list();signal?.throwIfAborted();event('Work lookup complete');
 return plans.slice(0,5).map(p=>({id:p.id,title:String(p.title).slice(0,120),body:String(p.body).slice(0,1600),version:p.version}));
}
export async function collectDecision(response){if(!response.ok)throw Object.assign(Error('The tool-selection request failed.'),{status:502});const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',text='',complete=false;try{while(true){const {done,value}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});if(buffer.length>100000)throw Error('Oversized provider event');const lines=buffer.split('\n');buffer=lines.pop();for(const line of lines){if(!line.startsWith('data:'))continue;let e;try{e=JSON.parse(line.slice(5));}catch{continue;}if(e.type==='response.output_text.delta')text+=e.delta;if(text.length>4000)throw Error('Oversized tool choice');if(e.type==='response.completed')complete=true;}}if(!complete)throw Error('Incomplete tool choice');return text;}finally{await reader.cancel().catch(()=>{});}}

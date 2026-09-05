// Protocol adapter for baphled/FlowState feature/dockerise at 40e022bd.
// Deliberately not registered for user traffic until tenancy, auth, tool scope,
// cancellation and deployment acceptance pass. Never points at a user's laptop.
export class FlowStateAdapter {
 constructor({baseUrl,agentId,headers={},fetcher=fetch}){const url=new URL(baseUrl);if(url.protocol!=='https:'&&!(url.protocol==='http:'&&['127.0.0.1','localhost'].includes(url.hostname)))throw new Error('FlowState needs HTTPS.');this.base=url.origin;this.agentId=agentId;this.headers=headers;this.fetcher=fetcher;}
 async health(signal){const r=await this.fetcher(this.base+'/health',{headers:this.headers,signal});if(!r.ok)throw new Error('FlowState health check failed.');const data=await r.json();return data.status==='ok';}
 async *stream(message,{signal}={}){
  if(!this.agentId||typeof message!=='string'||message.length>32000)throw new Error('A configured agent and bounded message are required.');
  const r=await this.fetcher(this.base+'/api/chat',{method:'POST',headers:{...this.headers,'Content-Type':'application/json'},body:JSON.stringify({agent_id:this.agentId,message}),signal});
  if(!r.ok||!r.headers.get('content-type')?.includes('text/event-stream'))throw new Error('FlowState did not accept the streaming request.');
  const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='',completed=false;
  try{for(;;){const {value,done}=await reader.read();if(done)break;buffer+=decoder.decode(value,{stream:true});if(buffer.length>1048576)throw new Error('FlowState event exceeded the preview limit.');const lines=buffer.split('\n');buffer=lines.pop();for(const line of lines){if(!line.startsWith('data:'))continue;const raw=line.slice(5).trim();if(raw==='[DONE]'){completed=true;yield {type:'done'};return;}let event;try{event=JSON.parse(raw)}catch{continue;}if(event.error||event.type==='error')throw new Error('FlowState reported an error.');if(event.content&&!event.type)yield {type:'delta',text:event.content};else if(event.type)yield {type:'runtime_event',event};}}if(!completed)throw new Error('FlowState ended without completion.');}finally{await reader.cancel().catch(()=>{});}
 }
}

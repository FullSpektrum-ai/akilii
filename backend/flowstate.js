// Protocol adapter for baphled/FlowState feature/dockerise at 40e022bd.
// Stream abort stops transport only: upstream execution cancellation is unverified.
// This adapter is not registered for production user traffic.
export class FlowStateAdapter {
 constructor({baseUrl,agentId,headers={},fetcher=fetch,timeoutMs=30000,maxStreamBytes=1048576}){
  const url=new URL(baseUrl);
  const local=['127.0.0.1','localhost','[::1]'].includes(url.hostname);
  if(url.protocol!=='https:'&&!(url.protocol==='http:'&&local))throw new Error('FlowState needs HTTPS.');
  if(url.username||url.password||url.search||url.hash||url.pathname!=='/')throw new Error('FlowState needs an origin without credentials, path, query or fragment.');
  if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>300000)throw new Error('Invalid FlowState timeout.');
  if(!Number.isInteger(maxStreamBytes)||maxStreamBytes<1||maxStreamBytes>1048576)throw new Error('Invalid FlowState stream limit.');
  this.base=url.origin;this.agentId=agentId;this.headers=headers;this.fetcher=fetcher;
  this.timeoutMs=timeoutMs;this.maxStreamBytes=maxStreamBytes;
 }
 signal(signal){return signal?AbortSignal.any([signal,AbortSignal.timeout(this.timeoutMs)]):AbortSignal.timeout(this.timeoutMs);}
 async health(signal){
  const r=await this.fetcher(this.base+'/health',{headers:this.headers,signal:this.signal(signal),redirect:'error'});
  if(!r.ok)throw new Error('FlowState health check failed.');
  const data=await r.json();return data.status==='ok';
 }
 async *stream(message,{signal}={}){
  if(typeof this.agentId!=='string'||!this.agentId.trim()||typeof message!=='string'||!message.trim()||message.length>32000)throw new Error('A configured agent and bounded message are required.');
  const requestSignal=this.signal(signal);requestSignal.throwIfAborted();
  const r=await this.fetcher(this.base+'/api/chat',{method:'POST',redirect:'error',headers:{...this.headers,'Content-Type':'application/json'},body:JSON.stringify({agent_id:this.agentId,message}),signal:requestSignal});
  if(!r.ok||!r.headers.get('content-type')?.includes('text/event-stream')||!r.body)throw new Error('FlowState did not accept the streaming request.');
  const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='',size=0,data=[];
  const abort=()=>{reader.cancel().catch(()=>{});};requestSignal.addEventListener('abort',abort,{once:true});
  const decodeEvent=()=>{
   if(!data.length)return null;
   const raw=data.join('\n');data=[];
   if(raw==='[DONE]')return {type:'done'};
   let event;try{event=JSON.parse(raw);}catch{throw new Error('FlowState emitted invalid event data.');}
   if(!event||typeof event!=='object'||Array.isArray(event))throw new Error('FlowState emitted invalid event data.');
   if(event.error||event.type==='error'||event.type==='tool_error')throw new Error('FlowState reported an error.');
   if(typeof event.content==='string'&&!event.type)return {type:'delta',text:event.content};
   if(event.type)return {type:'runtime_event',event};
   return null;
  };
  try{
   for(;;){
    requestSignal.throwIfAborted();const {value,done}=await reader.read();requestSignal.throwIfAborted();
    if(done)break;
    size+=value.byteLength;if(size>this.maxStreamBytes)throw new Error('FlowState stream exceeded the preview limit.');
    buffer+=decoder.decode(value,{stream:true});
    let boundary;
    while((boundary=buffer.indexOf('\n'))!==-1){
     const line=buffer.slice(0,boundary).replace(/\r$/,'');buffer=buffer.slice(boundary+1);
     if(line===''){
      const event=decodeEvent();if(event){yield event;if(event.type==='done')return;}
     }else if(line.startsWith('data:'))data.push(line.slice(5).replace(/^ /,''));
    }
   }
   throw new Error('FlowState ended without completion.');
  }finally{requestSignal.removeEventListener('abort',abort);await reader.cancel().catch(()=>{});reader.releaseLock();}
 }
}

// Downloads stay on loopback; renderer input never selects a host or executable.
function modelDownloads(fetcher=fetch){
 let state={status:'idle'},controller;
 return {
  status:()=>({...state}),
  cancel(){controller?.abort();},
  start(model){
   if(typeof model!=='string'||! /^[a-z0-9][a-z0-9._/-]*(?::[a-z0-9._-]+)?$/i.test(model)||model.length>120||model.includes('..'))throw Error('Enter an Ollama model name, for example model:tag.');
   if(state.status==='downloading')throw Error('A download is already running.');
   controller=new AbortController();const signal=controller.signal;state={status:'downloading',model,completed:0,total:0};
   (async()=>{try{
    const r=await fetcher('http://127.0.0.1:11434/api/pull',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,stream:true}),signal});
    if(!r.ok||!r.body)throw Error('Ollama could not start this download. Check the model name and runtime.');
    let buffer='',success=false;const decoder=new TextDecoder();
    const event=line=>{if(!line.trim())return;const e=JSON.parse(line);if(e.error)throw Error(e.error);state={...state,detail:e.status,completed:e.completed||0,total:e.total||0};if(e.status==='success')success=true;};
    for await(const chunk of r.body){buffer+=decoder.decode(chunk,{stream:true});if(buffer.length>1048576)throw Error('Invalid download response.');const lines=buffer.split('\n');buffer=lines.pop();for(const line of lines)event(line);}
    event(buffer);if(!success)throw Error('Download interrupted. Retry to resume available partial files.');state={...state,status:'complete'};
   }catch(e){state={...state,status:signal.aborted?'cancelled':'error',detail:signal.aborted?'Download cancelled.':e.message};}})();
   return {...state};
  }
 };
}
module.exports={modelDownloads};

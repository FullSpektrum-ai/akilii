import {voiceConfig} from './voice-config.js';
const samples=new Map();
export async function voicePreview(b,db,actor,key,fetcher=fetch){
 const voice=voiceConfig(b);const speed=[0.85,1,1.1].includes(b.speed)?b.speed:1;const cacheKey=voice+':'+speed;
 if(!key)throw Object.assign(new Error('Voice samples are unavailable.'),{status:503});
 if(samples.has(cacheKey))return samples.get(cacheKey);
 const day=new Date().toISOString().slice(0,10);
 for(const [scope,cap] of [[actor.id,30],['global',60]]){const r=await db.prepare('INSERT INTO usage (key,count) VALUES (?,1) ON CONFLICT(key) DO UPDATE SET count=count+1 WHERE count<?').bind(scope+':voice-preview:'+day,cap).run();if(!r.meta.changes)throw Object.assign(new Error('Voice sample allowance reached. Please try again tomorrow.'),{status:429});}
 const r=await fetcher('https://api.openai.com/v1/audio/speech',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model:'gpt-4o-mini-tts',voice,speed,input:'Hello, I’m akilii. We can take this one step at a time. What would you like to make possible today?',response_format:'mp3'}),signal:AbortSignal.timeout(25000)});
 if(!r.ok)throw Object.assign(new Error('This voice sample could not load. Please try again.'),{status:502});
 const bytes=new Uint8Array(await r.arrayBuffer());if(bytes.length>1048576)throw new Error('Voice sample exceeded its limit.');
 let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));
 const result={audio:btoa(binary),mime:'audio/mpeg',voice,speed};samples.set(cacheKey,result);return result;
}

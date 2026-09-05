const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const encode=bytes=>btoa(String.fromCharCode(...bytes));
const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export async function seal(token,key){const iv=crypto.getRandomValues(new Uint8Array(12));const k=await crypto.subtle.importKey('raw',decode(key),'AES-GCM',false,['encrypt']);const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv},k,new TextEncoder().encode(token));return encode(iv)+'.'+encode(new Uint8Array(encrypted));}
export async function unseal(value,key){const [iv,data]=value.split('.');const k=await crypto.subtle.importKey('raw',decode(key),'AES-GCM',false,['decrypt']);return new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:decode(iv)},k,decode(data)));}
export function draftMime(b){if(!b||typeof b.to!=='string'||!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(b.to)||b.to.length>254||typeof b.subject!=='string'||/[\r\n]/.test(b.subject)||b.subject.length>180||typeof b.body!=='string'||!b.body.trim()||b.body.length>10000)fail(400,'Review a valid recipient, subject and email body.');const subject='=?UTF-8?B?'+encode(new TextEncoder().encode(b.subject))+'?=';const mime='To: '+b.to+'\r\nSubject: '+subject+'\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n'+encode(new TextEncoder().encode(b.body));return encode(new TextEncoder().encode(mime)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');}
export async function emailRoute(path,method,b,sql,actor,key,fetcher=fetch){
 if(path==='/api/email/status'&&method==='GET'){const [t]=await sql`select expires_at from akilii.email_tokens where user_id=${actor.id}`;return {available:!!key,connected:!!key&&!!t&&Number(t.expires_at)>Date.now(),expires_at:t?.expires_at||null};}
 if(path==='/api/email/disconnect'&&method==='POST'){await sql`delete from akilii.email_tokens where user_id=${actor.id}`;return {ok:true};}
 if(!key)fail(503,'Gmail connection is not configured yet.');
 if(path==='/api/email/connect'&&method==='POST'){
  if(typeof b?.access_token!=='string'||b.access_token.length>8192)fail(400,'Google did not return a valid connection.');
  const r=await fetcher('https://www.googleapis.com/oauth2/v3/userinfo',{headers:{Authorization:'Bearer '+b.access_token},signal:AbortSignal.timeout(10000)});if(!r.ok)fail(401,'Reconnect your Google account.');const identity=await r.json();if(identity.email_verified!==true||identity.email?.toLowerCase()!==actor.email.toLowerCase())fail(403,'Connect the same Google account you use for akilii.');
  const check=await fetcher('https://oauth2.googleapis.com/tokeninfo?access_token='+encodeURIComponent(b.access_token),{signal:AbortSignal.timeout(10000)});if(!check.ok)fail(401,'Google connection expired.');const info=await check.json();if(!String(info.scope).split(' ').includes('https://www.googleapis.com/auth/gmail.compose'))fail(403,'Gmail draft permission was not granted.');
  if(info.aud!=='806933132523-l7aj1994qbhp2kla9recnkbp3010lhl5.apps.googleusercontent.com')fail(403,'This token was not issued for akilii.');
  const lifetime=Math.min(3600,Number(info.expires_in)||0);if(lifetime<60)fail(401,'Google connection is expiring. Please reconnect.');const expiry=Date.now()+lifetime*1000;
  await sql`insert into akilii.email_tokens(user_id,ciphertext,expires_at) values(${actor.id},${await seal(b.access_token,key)},${expiry}) on conflict(user_id) do update set ciphertext=excluded.ciphertext,expires_at=excluded.expires_at`;return {connected:true,expires_at:expiry};
 }
 if(path!=='/api/email/draft'||method!=='POST')fail(404,'Email action not found.');
 const raw=draftMime(b);if(typeof b.request_key!=='string'||!/^[a-zA-Z0-9-]{10,80}$/.test(b.request_key))fail(400,'A request identifier is required.');
 const [token]=await sql`select ciphertext,expires_at from akilii.email_tokens where user_id=${actor.id}`;if(!token||Number(token.expires_at)<=Date.now())fail(401,'Reconnect Gmail to create a draft.');
 const [receipt]=await sql`insert into akilii.email_receipts(id,user_id,request_key,status,created_at) values(${crypto.randomUUID()},${actor.id},${b.request_key},'pending',${Date.now()}) on conflict(user_id,request_key) do nothing returning id`;
 if(!receipt){const [old]=await sql`select status,provider_draft_id from akilii.email_receipts where user_id=${actor.id} and request_key=${b.request_key}`;if(old?.status==='created')return {created:true,draft_id:old.provider_draft_id,replayed:true};fail(409,'This attempt is already recorded. Check Gmail Drafts before trying again.');}
 try{
  const r=await fetcher('https://gmail.googleapis.com/gmail/v1/users/me/drafts',{method:'POST',headers:{Authorization:'Bearer '+await unseal(token.ciphertext,key),'Content-Type':'application/json'},body:JSON.stringify({message:{raw}}),signal:AbortSignal.timeout(15000)});
  if(!r.ok){await sql`update akilii.email_receipts set status='failed' where id=${receipt.id} and user_id=${actor.id}`;fail(r.status===401?401:502,r.status===401?'Reconnect Gmail to create a draft.':'Gmail could not create the draft. Check that Gmail API access is enabled.');}
  const result=await r.json();if(!result.id)throw new Error('Missing receipt');await sql`update akilii.email_receipts set status='created',provider_draft_id=${result.id} where id=${receipt.id} and user_id=${actor.id}`;return {created:true,draft_id:result.id};
 }catch(e){if(!e.status){await sql`update akilii.email_receipts set status='uncertain' where id=${receipt.id} and user_id=${actor.id}`;fail(502,'Gmail did not confirm the result. Check Drafts before retrying to avoid duplicates.');}throw e;}
}

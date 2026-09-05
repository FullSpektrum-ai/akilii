import {createClient} from '@supabase/supabase-js';
const url='https://xmesqilkgeaoqrxbooqe.supabase.co';
const key='sb_publishable_wdcht-0QIvLwbBIj7StxIQ_UTV2qCfc';
let pendingGoogleToken=null;
const storage={getItem:k=>sessionStorage.getItem(k),removeItem:k=>sessionStorage.removeItem(k),setItem(k,v){try{const data=JSON.parse(v);if(data.provider_token)pendingGoogleToken=data.provider_token;delete data.provider_token;delete data.provider_refresh_token;v=JSON.stringify(data);}catch{}sessionStorage.setItem(k,v);}};
const client=createClient(url,key,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,storage,storageKey:'akilii-v01-auth'}});
const ready=client.auth.getSession().then(async({data,error})=>{
 const params=new URLSearchParams(location.search);if(params.has('code')||params.has('error'))history.replaceState(null,'',location.pathname);
 if(pendingGoogleToken&&Number(sessionStorage.getItem('akilii-gmail-intent'))>Date.now()-600000&&data.session){const token=pendingGoogleToken;pendingGoogleToken=null;sessionStorage.removeItem('akilii-gmail-intent');try{const r=await fetch(url+'/functions/v1/akilii-api/api/email/connect',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+data.session.access_token,'Content-Type':'application/json'},body:JSON.stringify({access_token:token})});const result=await r.json();window.akiliiEmailNotice=r.ok?'Gmail connected for this session.':result.error;}catch{window.akiliiEmailNotice='Gmail connection could not be completed.';}}
 pendingGoogleToken=null;
 if(error)console.warn('Sign-in could not be completed.');
});
async function signIn(){const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}});if(error)throw error;}
async function signOut(){const {error}=await client.auth.signOut();if(error)throw error;location.reload();}
async function apiFetch(path,options={}){
 await ready;const {data:{session}}=await client.auth.getSession();
 if(!session)return new Response(JSON.stringify({error:'Please sign in with Google.'}),{status:401,headers:{'Content-Type':'application/json'}});
 const headers=new Headers(options.headers);headers.set('apikey',key);headers.set('Authorization','Bearer '+session.access_token);
 return fetch(url+'/functions/v1/akilii-api'+path,{...options,headers});
}
async function connectGmail(){sessionStorage.setItem('akilii-gmail-intent',String(Date.now()));const {error}=await client.auth.signInWithOAuth({provider:'google',options:{scopes:'https://www.googleapis.com/auth/gmail.compose',redirectTo:location.origin+location.pathname,queryParams:{prompt:'consent select_account'}}});if(error)throw error;}
window.akiliiAuth={connectGmail,ready,signIn,signOut,apiFetch,provider:'Google'};
document.addEventListener('click',e=>{const link=e.target.closest('a[href*="signout-with-chatgpt"]');if(link){e.preventDefault();signOut().catch(()=>alert('Sign out failed. Please try again.'));}});

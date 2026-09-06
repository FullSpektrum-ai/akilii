import authOptions from '../auth-options.json';
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
async function signIn(provider='google'){if(!['google','azure'].includes(provider))throw Error('Choose a supported sign-in option.');const {error}=await client.auth.signInWithOAuth({provider,options:{...(provider==='azure'?{scopes:'email'}:{}),redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}});if(error)throw error;}
async function signOut(){const {error}=await client.auth.signOut();if(error)throw error;location.reload();}
async function apiFetch(path,options={}){
 await ready;const {data:{session}}=await client.auth.getSession();
 if(!session)return new Response(JSON.stringify({error:'Please sign in.'}),{status:401,headers:{'Content-Type':'application/json'}});
 const headers=new Headers(options.headers);headers.set('apikey',key);headers.set('Authorization','Bearer '+session.access_token);
 return fetch(url+'/functions/v1/akilii-api'+path,{...options,headers});
}
async function connectGmail(){sessionStorage.setItem('akilii-gmail-intent',String(Date.now()));const {error}=await client.auth.signInWithOAuth({provider:'google',options:{scopes:'https://www.googleapis.com/auth/gmail.compose',redirectTo:location.origin+location.pathname,queryParams:{prompt:'consent select_account'}}});if(error)throw error;}
async function options(){const r=await fetch(url+'/auth/v1/settings',{headers:{apikey:key},signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error('Sign-in unavailable.');const data=await r.json();return {google:data.external?.google===true,azure:data.external?.azure===true,email:authOptions.emailOtpReady&&data.external?.email===true};}
async function sendCode(email){if(!authOptions.emailOtpReady)throw Error('Email sign-in is awaiting email-service setup.');const {error}=await client.auth.signInWithOtp({email,options:{shouldCreateUser:true}});if(error)throw Error('The code could not be sent. Check the address or wait a minute before retrying.');}
async function verifyCode(email,token){const {error}=await client.auth.verifyOtp({email,token,type:'email'});if(error)throw Error('That code is invalid or expired. Please try again or request a new code.');}
window.akiliiAuth={options,sendCode,verifyCode,connectGmail,ready,signIn,signOut,apiFetch,provider:'Google'};
document.addEventListener('click',e=>{const link=e.target.closest('a[href*="signout-with-chatgpt"]');if(link){e.preventDefault();signOut().catch(()=>alert('Sign out failed. Please try again.'));}});

import {createClient} from '@supabase/supabase-js';
const url='https://xmesqilkgeaoqrxbooqe.supabase.co';
const key='sb_publishable_wdcht-0QIvLwbBIj7StxIQ_UTV2qCfc';
const storage={getItem:k=>sessionStorage.getItem(k),removeItem:k=>sessionStorage.removeItem(k),setItem(k,v){try{const data=JSON.parse(v);delete data.provider_token;delete data.provider_refresh_token;v=JSON.stringify(data);}catch{}sessionStorage.setItem(k,v);}};
const client=createClient(url,key,{auth:{flowType:'pkce',detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,storage,storageKey:'akilii-v01-auth'}});
const ready=client.auth.getSession().then(({error})=>{
 const params=new URLSearchParams(location.search);if(params.has('code')||params.has('error'))history.replaceState(null,'',location.pathname);
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
window.akiliiAuth={ready,signIn,signOut,apiFetch,provider:'Google'};
document.addEventListener('click',e=>{const link=e.target.closest('a[href*="signout-with-chatgpt"]');if(link){e.preventDefault();signOut().catch(()=>alert('Sign out failed. Please try again.'));}});

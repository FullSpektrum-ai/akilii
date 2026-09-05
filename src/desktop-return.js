const parameters=new URLSearchParams(location.search),nonce=parameters.get('desktop_callback'),code=parameters.get('code');
if(nonce&&/^[a-f0-9]{48}$/.test(nonce)&&code&&code.length<=2048){
 const target='akilii://auth?state='+encodeURIComponent(nonce)+'&code='+encodeURIComponent(code);
 history.replaceState(null,'',location.pathname);
 const link=document.getElementById('handoff-link');link.href=target;link.hidden=false;
 document.getElementById('handoff-status').textContent='Continue in the akilii desktop app. If it does not open automatically, use the link below.';
 location.assign(target);
}else document.getElementById('handoff-status').textContent='This desktop sign-in link is incomplete or expired. Start sign-in again from akilii.';

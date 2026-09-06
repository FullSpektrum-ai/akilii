// Shared phone shell: reuse the canonical brand asset and existing controls.
const phoneLayout=matchMedia('(max-width:760px)');
const phoneNav=$('mobile-nav'),phoneSidebar=document.querySelector('.sidebar');
phoneNav.replaceChildren(document.querySelector('.brand-area .brand-symbol').cloneNode(true));
phoneNav.setAttribute('aria-controls','phone-navigation');phoneSidebar.id='phone-navigation';
const navScrim=document.createElement('button');navScrim.className='mobile-scrim';navScrim.setAttribute('aria-label','Close navigation');navScrim.tabIndex=-1;$('application').append(navScrim);
navScrim.onclick=()=>{$('application').classList.remove('mobile-open');syncPhoneDrawer();phoneNav.focus();};
const contextChoices=document.createElement('div');contextChoices.className='mobile-context-choices';
const contextTitle=document.createElement('span');contextTitle.className='section-label';contextTitle.textContent='CONTEXT & WORK TOOLS';contextChoices.append(contextTitle);$('plus-menu').append(contextChoices);
const composerChoices=[...document.querySelectorAll('.composer-controls .context-check')];
function syncPhoneLayout(){
 if(phoneLayout.matches){for(const choice of composerChoices)contextChoices.append(choice);}
 else{for(const choice of composerChoices)$('mic').before(choice);$('application').classList.remove('mobile-open');}
 syncPhoneDrawer();
}
function syncPhoneDrawer(){const open=phoneLayout.matches&&$('application').classList.contains('mobile-open');phoneNav.setAttribute('aria-expanded',String(open));document.querySelector('.workspace').inert=open;phoneSidebar.inert=phoneLayout.matches&&!open;$('collapse').setAttribute('aria-label',open?'Close navigation':$('application').classList.contains('collapsed')?'Expand sidebar':'Collapse sidebar');}
new MutationObserver(syncPhoneDrawer).observe($('application'),{attributes:true,attributeFilter:['class']});
phoneLayout.addEventListener('change',syncPhoneLayout);syncPhoneLayout();
phoneNav.addEventListener('click',()=>{if($('application').classList.contains('mobile-open'))$('collapse').focus();});
$('collapse').addEventListener('click',()=>{if(phoneLayout.matches){syncPhoneDrawer();phoneNav.focus();}});
phoneSidebar.addEventListener('keydown',e=>{if(!phoneLayout.matches||!$('application').classList.contains('mobile-open'))return;if(e.key==='Escape'){$('application').classList.remove('mobile-open');syncPhoneDrawer();phoneNav.focus();}if(e.key==='Tab'){const list=[...phoneSidebar.querySelectorAll('button,a,input')].filter(el=>!el.disabled&&el.getClientRects().length);const first=list[0],last=list.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});

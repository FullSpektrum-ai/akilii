/* V0.1 product convergence layer.
 *
 * This file deliberately adapts the existing shared application rather than
 * creating a second UI/runtime. Page 07/08 Figma authority: Home / Chat / Work,
 * Shape, explicit persistence, truthful receipts and Thread continuity.
 */

let phase7EnteringApp=false;
const phase7ThreadState={available:null,items:[]};
const phase7EntryAction=$('entry-action');
phase7EntryAction?.addEventListener('click',event=>{if(event.target.closest('#enter-space'))phase7EnteringApp=true;},true);
$('setup-form')?.addEventListener('submit',()=>{phase7EnteringApp=true;},true);

function phase7CanonicaliseShell(){
 const chat=document.querySelector('[data-view="chat"]');
 if(chat){chat.setAttribute('aria-label','Chat');const label=chat.querySelector('.nav-label');if(label)label.textContent='Chat';}
 document.querySelectorAll('.sidebar nav [data-view="projects"],.sidebar nav [data-view="email"]').forEach(node=>node.remove());
 const development=document.querySelector('.sidebar .development');
 if(development?.parentElement)development.parentElement.remove();
 if($('page-title')?.textContent==='Support')$('page-title').textContent='Chat';
}
phase7CanonicaliseShell();

async function phase7LoadThreads(){
 if(!S.data?.profile)return;
 try{const result=await api('threads');phase7ThreadState.available=true;phase7ThreadState.items=result.threads||[];}
 catch(error){if([404,503].includes(error.status)){phase7ThreadState.available=false;phase7ThreadState.items=[];}else throw error;}
}
function phase7StoreThread(thread){const index=phase7ThreadState.items.findIndex(item=>item.id===thread.id);if(index>=0)phase7ThreadState.items[index]=thread;else phase7ThreadState.items.unshift(thread);}
function phase7ResumableThread(){return phase7ThreadState.items.find(item=>['held','ready'].includes(item.status))||phase7ThreadState.items.find(item=>item.status==='active')||null;}

const phase7BaseLoadWorkspace=loadWorkspace;
loadWorkspace=async function(){await phase7BaseLoadWorkspace();await phase7LoadThreads();if(S.view==='home')homeView();};

const phase7BaseView=view;
view=function(name){
 if(name==='chat'&&phase7EnteringApp){phase7EnteringApp=false;name='home';}
 phase7BaseView(name);
 const productView=name==='projects'?'work':name;
 document.querySelectorAll('[data-view]').forEach(button=>button.classList.toggle('active',button.dataset.view===productView));
 if(name==='chat'){$('page-title').textContent='Chat';$('page-subtitle').textContent='Think it through, understand it, decide what comes next.';}
 if(name==='projects'){$('page-title').textContent='Work';$('page-subtitle').textContent='What you have deliberately kept and are moving forward.';}
};

homeView=function(){
 const d=S.data;if(!d?.profile)return;
 const thread=phase7ResumableThread(),active=(X.projects||[]).filter(project=>project.status==='active');
 const project=active[0],saved=d.work?.[0];
 let continuation='';
 if(thread)continuation=`<section class="content-card"><span class="eyebrow">${thread.status==='held'?'HELD THREAD':'THREAD'} · RETURN WITHOUT RECONSTRUCTION</span><h3>${esc(thread.title)}</h3><p>${esc(thread.last_confirmed||thread.objective||'Your working state is still here.')}</p>${thread.next_move?`<p><strong>Next:</strong> ${esc(thread.next_move)}</p>`:''}<button id="phase7-resume-thread">Resume here →</button></section>`;
 else if(project)continuation=`<section class="content-card"><span class="eyebrow">PICK SOMETHING BACK UP</span><h3>${esc(project.title)}</h3><p>${esc(project.objective||'Continue from the state you deliberately saved.')}</p><button id="phase7-resume-project">Open in Work →</button></section>`;
 else if(saved)continuation=`<section class="content-card"><span class="eyebrow">PICK SOMETHING BACK UP</span><h3>${esc(saved.title)}</h3><p>${esc(saved.body.slice(0,180))}${saved.body.length>180?'…':''}</p><button id="phase7-resume-work">Open in Work →</button></section>`;
 $('content-view').innerHTML=`<div class="home-hero"><span class="eyebrow">HOME · WHAT MATTERS NOW?</span><h1>What would help you move?</h1><p>You do not need to organise everything before asking for help. Bring the messy version and akilii can help make the next move visible.</p></div><div class="dashboard-grid"><button class="next-step-card" data-phase7-prompt="I know what I need to do. Help me make the first move small enough to start."><span class="eyebrow">START</span><h3>Help me start.</h3><p>Make the first legitimate move smaller.</p><span>Open Chat →</span></button><button class="next-step-card" data-phase7-prompt="Help me work out what is actually going on here. Ask one useful question if you need to."><span class="eyebrow">UNDERSTAND</span><h3>Help me work this out.</h3><p>Untangle what matters without turning it into another backlog.</p><span>Open Chat →</span></button><button class="next-step-card" id="phase7-open-work"><span class="eyebrow">WORK</span><h3>Show me what I have kept.</h3><p>Return to deliberate plans, projects and useful outputs.</p><span>Open Work →</span></button></div>${continuation?`<div class="workspace-section-heading"><h2>Continue without starting over.</h2></div>${continuation}`:''}`;
 document.querySelectorAll('[data-phase7-prompt]').forEach(button=>button.onclick=()=>{resetChat();$('message-input').value=button.dataset.phase7Prompt;$('message-input').focus();});
 $('phase7-open-work').onclick=()=>view('work');
 if($('phase7-resume-thread'))$('phase7-resume-thread').onclick=safely(()=>phase7ResumeThread(thread.id));
 if($('phase7-resume-project'))$('phase7-resume-project').onclick=()=>openProject(project.id);
 if($('phase7-resume-work'))$('phase7-resume-work').onclick=()=>workEditor(saved);
 window.akiliiSupport?.surface('home');
};

workView=function(){
 const work=S.data?.work||[],projects=X.projects||[],threads=phase7ThreadState.items.filter(thread=>thread.status!=='closed');
 const threadCards=threads.map(thread=>`<article class="content-card"><span class="eyebrow">THREAD · ${esc(thread.status.toUpperCase())}</span><h3>${esc(thread.title)}</h3><p>${esc(thread.last_confirmed||thread.objective||'Your working state is saved.')}</p>${thread.next_move?`<small>Next · ${esc(thread.next_move)}</small><br>`:''}<button data-phase7-resume-thread="${esc(thread.id)}">Resume →</button></article>`).join('');
 const projectCards=projects.map(project=>{const remaining=project.tasks.filter(task=>!task.done).length;return `<article class="content-card"><span class="eyebrow">${esc(project.status.toUpperCase())} · STRUCTURED WORK</span><h3>${esc(project.title)}</h3><p>${esc(project.objective)}</p><small>${remaining} ${remaining===1?'step':'steps'} remaining</small><br><button data-phase7-project="${esc(project.id)}">Open →</button>${phase7ThreadState.available===true?`<button data-phase7-hold-project="${esc(project.id)}">Keep my place</button>`:''}</article>`;}).join('');
 const artefacts=work.map(item=>`<article class="content-card"><span class="eyebrow">SAVED ARTEFACT · VERSION ${item.version}</span><h3>${esc(item.title)}</h3><p>${esc(item.body.slice(0,180))}${item.body.length>180?'…':''}</p><button data-edit-work="${esc(item.id)}">Open & edit →</button>${phase7ThreadState.available===true?`<button data-phase7-hold-work="${esc(item.id)}">Keep my place</button>`:''}</article>`).join('');
 $('content-view').innerHTML=`<span class="eyebrow">WORK · DELIBERATE PERSISTENCE</span><h1>Your Work.</h1><p>Only things you deliberately keep belong here. Projects are structured Work; they are not a separate product destination.</p><div class="dialog-actions"><button id="phase7-new-work" class="primary">Create a plan</button>${window.akiliiAuth?'<button id="phase7-new-project">Create structured Work</button>':''}</div>${threadCards?`<div class="workspace-section-heading"><h2>Threads</h2></div><div class="cards">${threadCards}</div>`:''}<div class="workspace-section-heading"><h2>Structured Work</h2></div><div class="cards">${projectCards||'<div class="content-card"><h3>No structured Work yet.</h3><p>Turn a useful plan into a project when you want persistent steps and completion state.</p></div>'}</div><div class="workspace-section-heading"><h2>Saved artefacts</h2></div><div class="cards">${artefacts||'<div class="content-card"><h3>Nothing saved yet.</h3><p>A useful response can be proposed for Work, reviewed, and saved only after you approve it.</p></div>'}</div>`;
 $('phase7-new-work').onclick=()=>workEditor();
 if($('phase7-new-project'))$('phase7-new-project').onclick=()=>projectEditor();
 document.querySelectorAll('[data-phase7-resume-thread]').forEach(button=>button.onclick=safely(()=>phase7ResumeThread(button.dataset.phase7ResumeThread)));
 document.querySelectorAll('[data-phase7-project]').forEach(button=>button.onclick=()=>openProject(button.dataset.phase7Project));
 document.querySelectorAll('[data-edit-work]').forEach(button=>button.onclick=()=>workEditor(work.find(item=>item.id===button.dataset.editWork)));
 document.querySelectorAll('[data-phase7-hold-project]').forEach(button=>button.onclick=()=>{const project=projects.find(item=>item.id===button.dataset.phase7HoldProject);phase7OfferThread({title:project.title,objective:project.objective,project_id:project.id,last_confirmed:'You were working on “'+project.title+'”.',next_move:project.tasks.find(task=>!task.done)?.title||'Review what remains and choose the next useful move.'});});
 document.querySelectorAll('[data-phase7-hold-work]').forEach(button=>button.onclick=()=>{const item=work.find(value=>value.id===button.dataset.phase7HoldWork);phase7OfferThread({title:item.title,objective:item.title,work_id:item.id,last_confirmed:'You saved “'+item.title+'” to Work.',next_move:phase7NextMove(item.body)});});
};

const phase7BaseOpenProject=openProject;
openProject=function(id){
 phase7BaseOpenProject(id);const project=X.projects.find(item=>item.id===id),toolbar=document.querySelector('.project-toolbar');
 if(!project||!toolbar||phase7ThreadState.available!==true)return;
 const keep=document.createElement('button');keep.type='button';keep.textContent='Keep my place';keep.onclick=()=>phase7OfferThread({title:project.title,objective:project.objective,project_id:project.id,last_confirmed:'You were working on “'+project.title+'”.',next_move:project.tasks.find(task=>!task.done)?.title||'Review what remains and choose the next useful move.'});toolbar.append(keep);
};

const phase7BaseEnhance=enhanceGenerativeCard;
enhanceGenerativeCard=function(card,object){
 phase7BaseEnhance(card,object);
 const toolbar=card.querySelector('.genui-toolbar');if(!toolbar)return;
 toolbar.setAttribute('aria-label','Shape response');
 const labels={one:'One next move',overview:'Short plan',plain:'Full picture'};
 toolbar.querySelectorAll('[data-gen-view]').forEach(button=>{button.textContent=labels[button.dataset.genView]||button.textContent;});
};

function phase7ProposalTitle(text){
 const line=String(text||'').split(/\n+/).map(value=>value.trim()).find(Boolean)||'Useful next step';
 return line.replace(/^#+\s*/,'').slice(0,120);
}
function phase7NextMove(body){
 const lines=String(body||'').split(/\n+/).map(value=>value.replace(/^[-*#\d.\s]+/,'').trim()).filter(Boolean);
 return (lines[1]||lines[0]||'Open the saved Work and choose the next useful move.').slice(0,2000);
}

async function phase7RuntimeReady(){
 try{const state=await api('runtime');return state?.capabilities?.direct?.available===true;}
 catch(error){if([404,503].includes(error.status))return false;throw error;}
}

async function phase7OfferThread(seed){
 if(phase7ThreadState.available!==true)return toast('Thread continuity is not available in this mode yet. Your existing Work is unchanged.');
 const existing=phase7ThreadState.items.find(thread=>thread.status!=='closed'&&((seed.work_id&&thread.work_id===seed.work_id)||(seed.project_id&&thread.project_id===seed.project_id)));
 const title=existing?.title||seed.title||'My current Thread',last=existing?.last_confirmed||seed.last_confirmed||'',next=existing?.next_move||seed.next_move||'';
 dialog('Keep your place',`<form id="phase7-thread-form"><p>Save only the working state you want to return to. This does not save a diagnosis, attention state or full transcript.</p><label>Thread title<input id="phase7-thread-title" maxlength="120" required value="${esc(title)}"></label><label>Where I was<textarea id="phase7-thread-last" maxlength="4000">${esc(last)}</textarea></label><label>Next useful move<textarea id="phase7-thread-next" maxlength="2000">${esc(next)}</textarea></label><p><small>Holding a Thread is neutral. It does not make this overdue or mark you as inactive.</small></p><button class="primary">Hold this Thread</button><p class="error" role="alert"></p></form>`);
 bindForm('phase7-thread-form',async()=>{
  let thread;
  if(existing){const result=await api('threads/'+existing.id,'POST',{version:Number(existing.version),status:'held',title:$('phase7-thread-title').value,last_confirmed:$('phase7-thread-last').value,next_move:$('phase7-thread-next').value});thread=result.thread;}
  else{const result=await api('threads','POST',{request_key:crypto.randomUUID(),status:'held',title:$('phase7-thread-title').value,objective:seed.objective||'',conversation_id:S.cid||null,project_id:seed.project_id||null,work_id:seed.work_id||null,last_confirmed:$('phase7-thread-last').value,last_decision:seed.last_decision||'',next_move:$('phase7-thread-next').value,open_questions:seed.open_questions||[]});thread=result.thread;}
  phase7StoreThread(thread);$('dialog').close();toast('Thread held. You can return from Home without reconstructing it.');if(S.view==='home')homeView();
 });
}

async function phase7ResumeThread(id){
 if(phase7ThreadState.available!==true)return toast('Thread continuity is not available in this mode yet.');
 let {thread}=await api('threads/'+id);
 if(['held','ready'].includes(thread.status)){const result=await api('threads/'+id,'POST',{version:Number(thread.version),status:'active'});thread=result.thread;}
 phase7StoreThread(thread);view('work');
 $('content-view').innerHTML=`<span class="eyebrow">THREAD · EXACT RESUME POINT</span><h1>${esc(thread.title)}</h1><p>${esc(thread.objective||'Continue from the working state you chose to keep.')}</p><div class="cards"><section class="content-card"><span class="eyebrow">YOU WERE HERE</span><h3>Last confirmed state</h3><p>${esc(thread.last_confirmed||'No additional summary was saved.')}</p></section>${thread.last_decision?`<section class="content-card"><span class="eyebrow">LAST DECISION</span><h3>What you had decided</h3><p>${esc(thread.last_decision)}</p></section>`:''}<section class="content-card"><span class="eyebrow">NEXT</span><h3>Next useful move</h3><p>${esc(thread.next_move||'Choose the next useful move from the linked Work.')}</p></section></div><div class="dialog-actions"><button id="phase7-thread-chat" class="primary">Continue in Chat</button>${thread.project_id?'<button id="phase7-thread-project">Open linked Work</button>':''}${thread.work_id?'<button id="phase7-thread-work">Open saved artefact</button>':''}<button id="phase7-thread-hold">Hold here again</button></div>`;
 $('phase7-thread-chat').onclick=safely(async()=>{if(thread.conversation_id){try{await openChat(thread.conversation_id);}catch{resetChat();}}else resetChat();if(thread.next_move)$('message-input').value='Continue from here: '+thread.next_move;$('message-input').focus();});
 if($('phase7-thread-project'))$('phase7-thread-project').onclick=()=>openProject(thread.project_id);
 if($('phase7-thread-work'))$('phase7-thread-work').onclick=()=>{const item=S.data.work.find(value=>value.id===thread.work_id);if(item)workEditor(item);else toast('The linked Work item is no longer available.');};
 $('phase7-thread-hold').onclick=()=>phase7OfferThread(thread);
}

async function phase7ProposeWork(title,body){
 title=phase7ProposalTitle(title);body=String(body||'').trim();
 if(!body)return toast('There is nothing to save yet.');
 if(!(await phase7RuntimeReady()))return toast('Reviewed saving to Work is not available in this mode yet. You can still copy the response or create Work manually.');
 const prepared=await api('runs','POST',{operation:'create',title,body,request_key:crypto.randomUUID(),runtime:'direct'});
 const run=prepared.run,actionId=prepared.action_id;
 dialog('Proposed action',`<div class="context-card"><span class="eyebrow">SAVE TO WORK · REVIEW BEFORE PERSISTENCE</span><h3>${esc(title)}</h3><p>${esc(body.slice(0,500))}${body.length>500?'…':''}</p></div><p><strong>Nothing has been saved to Work yet.</strong> Approving this action will create one private Work item. You can edit it afterwards.</p><div class="dialog-actions"><button id="phase7-approve-work" class="primary">Approve & save to Work</button><button id="phase7-cancel-work">Not now</button></div><p id="phase7-proposal-status" role="status"></p>`);
 $('phase7-approve-work').onclick=safely(async()=>{const button=$('phase7-approve-work');button.disabled=true;button.textContent='Saving…';$('phase7-proposal-status').textContent='Saving the action you approved…';const result=await api('runs/'+run.id+'/approve','POST',{action_id:actionId});await refresh();const receipt=result.receipt||{};dialog('Saved to Work',`<div class="context-card"><span class="eyebrow">ACTION RECEIPT</span><h3>${esc(receipt.title||title)}</h3><p>Saved to Work${receipt.version?' · version '+receipt.version:''}.</p></div><p>This receipt confirms the persistent change that actually happened. No additional personal context was saved.</p><div class="dialog-actions"><button id="phase7-open-saved-work" class="primary">Open Work</button>${phase7ThreadState.available===true?'<button id="phase7-keep-place">Keep my place for later</button>':''}<button id="phase7-close-receipt">Done</button></div>`);$('phase7-open-saved-work').onclick=()=>{$('dialog').close();view('work');};if($('phase7-keep-place'))$('phase7-keep-place').onclick=()=>phase7OfferThread({title:receipt.title||title,objective:title,work_id:receipt.work_id,last_confirmed:'You saved “'+(receipt.title||title)+'” to Work.',next_move:phase7NextMove(body)});$('phase7-close-receipt').onclick=()=>$('dialog').close();});
 $('phase7-cancel-work').onclick=safely(async()=>{await api('runs/'+run.id+'/cancel','POST',{});$('dialog').close();toast('Nothing was saved to Work.');});
}

const phase7BaseActions=actions;
actions=function(el,message){
 phase7BaseActions(el,message);
 const bar=el.querySelector(':scope > .message-actions');if(!bar)return;
 const save=[...bar.querySelectorAll('button')].find(button=>button.textContent==='Save to Work');if(!save)return;
 const body=plainAnswer(message.content);save.textContent='Review save to Work';save.onclick=safely(()=>phase7ProposeWork(phase7ProposalTitle(body),body));
};

const phase7BaseRenderAnswer=renderAnswer;
renderAnswer=function(target,content){
 phase7BaseRenderAnswer(target,content);
 const rich=richAnswer(content);if(!rich)return;
 const cards=[...target.querySelectorAll('.response-object')];
 cards.forEach((card,index)=>{
  const object=rich.objects[index];if(!object)return;
  const body=plainAnswer(JSON.stringify({message:'',objects:[object]}));
  [...card.querySelectorAll('.object-actions button')].filter(button=>button.textContent==='Save this to Work').forEach(button=>{button.textContent='Review save to Work';button.onclick=safely(()=>phase7ProposeWork(object.title,body));});
  const edited=card.querySelector('.genui-draft');
  [...card.querySelectorAll('.object-actions button')].filter(button=>button.textContent==='Save edited draft to Work').forEach(button=>{button.textContent='Review save to Work';button.onclick=safely(()=>phase7ProposeWork(object.title,edited?.value||object.draft));});
 });
};

phase7CanonicaliseShell();

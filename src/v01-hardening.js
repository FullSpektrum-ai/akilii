/* Phase 7 tracer hardening.
 *
 * Loaded after v01-tracer.js and v01-finish.js. This keeps the first
 * convergence pass small while tightening recovery semantics that matter to
 * the V0.1 acceptance contract: value-first entry, canonical navigation copy,
 * retry-safe approved persistence and idempotent Thread outcome closure.
 */

function phase7HardenCanonicalLabels(){
 const recent=document.querySelector('.recent-section .section-label');
 if(recent)recent.textContent='Recent';
}
phase7HardenCanonicalLabels();

function phase7SimplifyFirstRunSetup(){
 const onboarding=document.getElementById('onboarding');
 if(!onboarding)return;
 const heading=onboarding.querySelector('h1'),intro=heading?.nextElementSibling;
 if(heading)heading.textContent='Your space, your choices.';
 if(intro?.tagName==='P')intro.textContent='Choose what we should call you and review how this preview uses your data. You can bring the rest straight into Chat when you are ready.';
 for(const id of ['setup-focus','setup-style']){
  const field=$(id),label=field?.closest('label');
  if(field)field.value='';
  if(label)label.hidden=true;
 }
 const submit=onboarding.querySelector('#setup-form button[type="submit"]');
 if(submit)submit.textContent='Enter my akilii space →';
 const form=$('setup-form');
 if(form&&!form.querySelector('.phase7-first-run-note')){
  const note=document.createElement('p');note.className='phase7-first-run-note';
  note.innerHTML='<small>No profile questionnaire is required. Start with the messy version; optional working preferences can be added or changed later.</small>';
  const privacyNote=form.querySelector('.privacy-note');
  if(privacyNote)form.insertBefore(note,privacyNote);else form.prepend(note);
 }
}
phase7SimplifyFirstRunSetup();

function phase7FastStart(){
 dialog('Start anywhere',`<form id="phase7-fast-start"><p>Bring the version you have now. You do not need to explain how your brain works or complete a profile before akilii can help.</p><label>What would you like help moving forward?<textarea id="phase7-fast-message" maxlength="5000" required placeholder="A thought, task, decision, mess, question…"></textarea></label><label>What should I call you? <span class="eyebrow">OPTIONAL</span><input id="phase7-fast-name" maxlength="80" placeholder="You can set this later"></label><div class="privacy-note"><strong>Your choice, from the start.</strong><p>Your account and chats are stored for this preview. Your starting point is also kept as temporary context for seven days so later conversations can meet you where you are; you can remove it at any time. Your message is sent to the selected AI provider to generate a response. This is not a clinical assessment or emergency service.</p><button type="button" class="text-link" id="phase7-fast-privacy">Read how your data is used</button></div><label class="check"><input id="phase7-fast-consent" type="checkbox" required><span>I agree to this preview processing the information I choose to share, including any sensitive details I voluntarily provide.</span></label><div class="dialog-actions"><button class="primary" type="submit">Start with this →</button><button id="phase7-fast-discovery" type="button">Set up working preferences first</button></div><p><small>Working preferences are optional, reversible and can be added later in Settings. akilii will not infer a diagnosis or archetype from this message.</small></p><p class="error" role="alert"></p></form>`);
 $('phase7-fast-privacy').onclick=()=>dialog('Your data & choices',privacy);
 $('phase7-fast-discovery').onclick=()=>{phase7EnteringApp=false;startDiscovery(false);};
 bindForm('phase7-fast-start',async()=>{
  const message=$('phase7-fast-message').value.trim();if(!message)throw new Error('Write what you would like help with first.');
  const name=$('phase7-fast-name').value.trim()||'You';
  S.data=await api('profile','POST',{name,focus:'',style:'',consent:S.data.policy});
  await api('context','POST',{itemType:'goal',tier:'dynamic',content:message,sourceRef:'onboarding:starting-point',expiresAt:Date.now()+7*86400000});
  S.data=await api('bootstrap');
  try{await api('workspace','POST',{role:'',objective:'',needs:'',presentation:'balanced'});}catch(error){if(error.status!==404)throw error;}
  phase7EnteringApp=false;$('dialog').close();showApp();await loadWorkspace();resetChat();$('message-input').value=message;await send();
 });
}

document.addEventListener('click',event=>{
 const enter=event.target.closest?.('#enter-space');
 if(!enter||S.data?.profile)return;
 event.preventDefault();event.stopPropagation();phase7EnteringApp=false;phase7FastStart();
},true);

phase7ProposeWork=async function(title,body){
 title=phase7ProposalTitle(title);body=String(body||'').trim();
 if(!body)return toast('There is nothing to save yet.');
 if(!(await phase7RuntimeReady()))return toast('Reviewed saving to Work is not available in this mode yet. You can still copy the response or create Work manually.');
 const prepared=await api('runs','POST',{operation:'create',title,body,request_key:crypto.randomUUID(),runtime:'direct'});
 const run=prepared.run,actionId=prepared.action_id;
 dialog('Proposed action',`<div class="context-card"><span class="eyebrow">SAVE TO WORK · REVIEW BEFORE PERSISTENCE</span><h3>${esc(title)}</h3><p>${esc(body.slice(0,500))}${body.length>500?'…':''}</p></div><p><strong>Nothing has been saved to Work yet.</strong> Approving this action will create one private Work item. You can edit it afterwards.</p><div class="dialog-actions"><button id="phase7-approve-work" class="primary">Approve & save to Work</button><button id="phase7-cancel-work">Not now</button></div><p id="phase7-proposal-status" role="status"></p>`);
 $('phase7-approve-work').onclick=safely(async()=>{
  const button=$('phase7-approve-work'),cancel=$('phase7-cancel-work'),status=$('phase7-proposal-status');
  button.disabled=true;cancel.disabled=true;button.textContent='Saving…';status.textContent='Saving the action you approved…';
  try{
   const result=await api('runs/'+run.id+'/approve','POST',{action_id:actionId});
   await refresh();
   const receipt=result.receipt||{};
   dialog('Saved to Work',`<div class="context-card"><span class="eyebrow">ACTION RECEIPT</span><h3>${esc(receipt.title||title)}</h3><p>Saved to Work${receipt.version?' · version '+receipt.version:''}.</p></div><p>This receipt confirms the persistent change that actually happened. No additional personal context was saved.</p><div class="dialog-actions"><button id="phase7-open-saved-work" class="primary">Open Work</button>${phase7ThreadState.available===true?'<button id="phase7-keep-place">Keep my place for later</button>':''}<button id="phase7-close-receipt">Done</button></div>`);
   $('phase7-open-saved-work').onclick=()=>{$('dialog').close();view('work');};
   if($('phase7-keep-place'))$('phase7-keep-place').onclick=()=>phase7OfferThread({title:receipt.title||title,objective:title,work_id:receipt.work_id,last_confirmed:'You saved “'+(receipt.title||title)+'” to Work.',next_move:phase7NextMove(body)});
   $('phase7-close-receipt').onclick=()=>$('dialog').close();
  }catch(error){
   if(document.body.contains(button)){
    button.disabled=false;
    button.textContent='Retry approved save';
    cancel.disabled=true;
    cancel.title='Reconcile the approved save before cancelling.';
    status.textContent='Save not confirmed. Retry the approved save to reconcile what happened; the same approval cannot create a duplicate.';
   }
   throw error;
  }
 });
 $('phase7-cancel-work').onclick=safely(async()=>{
  const result=await api('runs/'+run.id+'/cancel','POST',{});
  if(result?.run?.status==='succeeded'){
   const reconciled=await api('runs/'+run.id);
   const receipt=reconciled.actions?.find(action=>action.status==='executed')?.receipt;
   dialog('Saved to Work',`<div class="context-card"><span class="eyebrow">ACTION RECEIPT · RECONCILED</span><h3>${esc(receipt?.title||title)}</h3><p>The approved action had already completed${receipt?.version?' · version '+receipt.version:''}.</p></div><p>akilii did not cancel a completed change or tell you it was unsaved. Open Work to inspect the saved result.</p><div class="dialog-actions"><button id="phase7-reconciled-work" class="primary">Open Work</button><button id="phase7-reconciled-done">Done</button></div>`);
   $('phase7-reconciled-work').onclick=()=>{$('dialog').close();view('work');};$('phase7-reconciled-done').onclick=()=>$('dialog').close();return;
  }
  $('dialog').close();toast('Nothing was saved to Work.');
 });
};

function phase7OutcomeRequestKey(thread){
 const id=String(thread?.id||'thread').replace(/[^a-zA-Z0-9-]/g,'').slice(0,55)||'thread';
 return ('outcome-'+id+'-'+String(Number(thread?.version)||0)).slice(0,80);
}

phase7OutcomeDialog=function(thread,state){
 const requestKey=phase7OutcomeRequestKey(thread);
 const linked=state.project?`<p><small>Linked Work: ${esc(state.project.title)}. Its task and project state will not be changed by this reflection.</small></p>`:'<p><small>No structured Work completion is being inferred.</small></p>';
 dialog('Finish this Thread',`<form id="phase7-outcome-form"><p>Before closing the loop, how useful was the support in helping you make progress?</p><fieldset class="outcome-options"><legend class="sr-only">Outcome</legend><label class="check"><input type="radio" name="phase7-outcome" value="helpful" required> Helpful</label><label class="check"><input type="radio" name="phase7-outcome" value="partial"> Partly helpful</label><label class="check"><input type="radio" name="phase7-outcome" value="unhelpful"> Unhelpful</label></fieldset><label>Anything worth noting? <span class="eyebrow">OPTIONAL</span><textarea id="phase7-outcome-note" maxlength="2000" placeholder="What helped, what did not, or what you changed…"></textarea></label>${linked}<p><strong>This closes the Thread and records this episode outcome together.</strong> It does not create a memory or change your support profile.</p><button class="primary">Close Thread</button><p class="error" role="alert"></p></form>`);
 bindForm('phase7-outcome-form',async()=>{
  const selected=document.querySelector('input[name="phase7-outcome"]:checked');if(!selected)throw new Error('Choose how useful this support was.');
  const result=await api('threads/'+thread.id+'/close','POST',{version:Number(thread.version),rating:selected.value,note:$('phase7-outcome-note').value,request_key:requestKey});
  phase7StoreThread(result.thread);
  const label={helpful:'Helpful',partial:'Partly helpful',unhelpful:'Unhelpful'}[result.outcome.rating]||result.outcome.rating;
  dialog('Thread closed',`<div class="context-card"><span class="eyebrow">COMPLETION RECEIPT</span><h3>${esc(result.thread.title)}</h3><p>Thread closed · outcome: ${esc(label)}.</p></div><p>The outcome is linked to this episode. Linked Work remains exactly as it was, and no lasting personal context was created from this feedback.</p><div class="dialog-actions"><button id="phase7-finish-home" class="primary">Back to Home</button><button id="phase7-finish-done">Done</button></div>`);
  window.akiliiSupport?.outcome();
  $('phase7-finish-home').onclick=()=>{$('dialog').close();view('home');};$('phase7-finish-done').onclick=()=>$('dialog').close();
 });
};

/* Phase 7 Slice E — Finish + Outcome.
 * Completion is derived from observable Work state only. Closing a Thread never
 * fabricates task completion and never promotes outcome feedback into memory.
 */

const phase7ResumeWithoutFinish=phase7ResumeThread;
phase7ResumeThread=async function(id){
 await phase7ResumeWithoutFinish(id);
 if(phase7ThreadState.available!==true)return;
 try{const result=await api('threads/'+id);phase7StoreThread(result.thread);phase7RenderFinishLine(result.thread);}
 catch(error){toast(error.message);}
};

function phase7FinishState(thread){
 const project=thread.project_id?X.projects.find(item=>item.id===thread.project_id):null;
 if(!project)return {project:null,canFinish:true,kind:'user-confirmed',remaining:[]};
 const remaining=project.tasks.filter(task=>!task.done);
 const allChecked=remaining.length===0,markedComplete=project.status==='complete';
 return {project,remaining,allChecked,markedComplete,canFinish:allChecked&&markedComplete,kind:'structured'};
}

function phase7RenderFinishLine(thread){
 if(thread.status==='closed')return;
 const target=$('content-view');if(!target)return;
 target.querySelector('#phase7-finish-line')?.remove();
 const state=phase7FinishState(thread),section=document.createElement('section');section.id='phase7-finish-line';section.className='content-card';
 let body='',action='Finish and reflect';
 if(state.kind==='user-confirmed'){
  body='<p>No structured task count is linked to this Thread, so akilii will not invent one. You decide when this episode is complete.</p>';
 }else if(state.remaining.length){
  const sample=state.remaining.slice(0,3).map(task=>'<li>'+esc(task.title)+'</li>').join('');
  body=`<p><strong>${state.remaining.length} ${state.remaining.length===1?'step remains':'steps remain'} in linked Work.</strong> This comes from the saved task state, not an estimate.</p><ul>${sample}</ul>${state.remaining.length>3?`<p><small>${state.remaining.length-3} more remain in Work.</small></p>`:''}${state.markedComplete?'<p><strong>State conflict:</strong> the project is marked complete while tasks remain unchecked. Resolve that before finishing this Thread.</p>':''}`;
  action='Open remaining Work';
 }else if(!state.markedComplete){
  body='<p>All current linked steps are checked, but the project is still marked active or paused. Open Work and explicitly mark it complete before finishing this Thread.</p>';
  action='Open linked Work';
 }else{
  body='<p><strong>Finish line reached.</strong> Every current linked step is checked and the project is explicitly marked complete.</p>';
 }
 section.innerHTML=`<span class="eyebrow">FINISH LINE · REAL STATE ONLY</span><h3>${state.canFinish?'Ready to close this loop.':'What is left before this is genuinely done?'}</h3>${body}<div class="dialog-actions"><button id="phase7-finish-primary" class="${state.canFinish?'primary':''}">${action}</button></div>`;
 target.append(section);
 const button=$('phase7-finish-primary');
 if(state.canFinish)button.onclick=()=>phase7OutcomeDialog(thread,state);
 else if(state.project)button.onclick=()=>openProject(state.project.id);
}

function phase7OutcomeDialog(thread,state){
 const requestKey=crypto.randomUUID();
 const linked=state.project?`<p><small>Linked Work: ${esc(state.project.title)}. Its task and project state will not be changed by this reflection.</small></p>`:'<p><small>No structured Work completion is being inferred.</small></p>';
 dialog('Finish this Thread',`<form id="phase7-outcome-form"><p>Before closing the loop, how useful was the support in helping you make progress?</p><fieldset class="outcome-options"><legend class="sr-only">Outcome</legend><label class="check"><input type="radio" name="phase7-outcome" value="helpful" required> Helpful</label><label class="check"><input type="radio" name="phase7-outcome" value="partial"> Partly helpful</label><label class="check"><input type="radio" name="phase7-outcome" value="unhelpful"> Unhelpful</label></fieldset><label>Anything worth noting? <span class="eyebrow">OPTIONAL</span><textarea id="phase7-outcome-note" maxlength="2000" placeholder="What helped, what did not, or what you changed…"></textarea></label>${linked}<p><strong>This closes the Thread and records this episode outcome together.</strong> It does not create a memory or change your support profile.</p><button class="primary">Close Thread</button><p class="error" role="alert"></p></form>`);
 bindForm('phase7-outcome-form',async()=>{
  const selected=document.querySelector('input[name="phase7-outcome"]:checked');if(!selected)throw new Error('Choose how useful this support was.');
  const result=await api('threads/'+thread.id+'/close','POST',{version:Number(thread.version),rating:selected.value,note:$('phase7-outcome-note').value,request_key:requestKey});
  phase7StoreThread(result.thread);
  const label={helpful:'Helpful',partial:'Partly helpful',unhelpful:'Unhelpful'}[result.outcome.rating]||result.outcome.rating;
  dialog('Thread closed',`<div class="context-card"><span class="eyebrow">COMPLETION RECEIPT</span><h3>${esc(result.thread.title)}</h3><p>Thread closed · outcome: ${esc(label)}.</p></div><p>The outcome is linked to this episode. Linked Work remains exactly as it was, and no lasting personal context was created from this feedback.</p><div class="dialog-actions"><button id="phase7-finish-home" class="primary">Back to Home</button><button id="phase7-finish-done">Done</button></div>`);
  $('phase7-finish-home').onclick=()=>{$('dialog').close();view('home');};$('phase7-finish-done').onclick=()=>$('dialog').close();
 });
}

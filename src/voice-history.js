// Final transcripts stay in memory until acknowledged; never store microphone audio.
const pendingVoice=new Set();let voiceEverSaved=false;
function voiceSaveStatus(){const el=$('voice-save');if(el)el.textContent=[...pendingVoice].some(v=>v.dirty||v.saving)?'Transcript not yet saved. Keep this page open; retry below.':voiceEverSaved?'Transcript saved in your previous chats.':'Your transcript will appear in previous chats once you speak.';}
async function flushVoice(v){if(!v.session_id||v.saving||!v.dirty)return;v.saving=true;v.dirty=false;try{const turns=[...v.turns.values()].filter(t=>t.content).map(t=>({...t}));for(let i=0;i<turns.length;i+=3)await api('voice/transcript','POST',{session_id:v.session_id,turns:turns.slice(i,i+3)});voiceEverSaved=true;await refresh();if(!voiceSession&&S.cid===v.conversation_id)await openChat(v.conversation_id);}catch{v.dirty=true;toast('Voice transcript could not save. Keep this page open and retry from voice mode.');}finally{v.saving=false;if(!v.dirty)pendingVoice.delete(v);voiceSaveStatus();}}
function captureVoice(v,d){
 const id=d.item_id||d.item?.id;if(!id||!(/input_audio_buffer\.(speech_started|committed)|conversation\.item\.(created|added|truncated|input_audio_transcription.completed)|response\.(output_item.added|output_audio_transcript.done|audio_transcript.done)/.test(d.type)))return;
 if(!v.turns.has(id)){if(v.turns.size>=80)return;v.turns.set(id,{id,role:d.item?.role||(/input_audio/.test(d.type)?'user':'assistant'),content:'',order:v.turns.size});}
 const t=v.turns.get(id);
 if(d.type==='conversation.item.input_audio_transcription.completed'){t.role='user';t.content=d.transcript||'';}
 if(!t.interrupted&&['response.output_audio_transcript.done','response.audio_transcript.done'].includes(d.type)){t.role='assistant';t.content=d.transcript||'';}
 if(d.type==='conversation.item.truncated'){t.interrupted=true;t.content='[Voice response interrupted; generated transcript omitted.]';}
 t.content=t.content.slice(0,10000);if(t.content){v.dirty=true;pendingVoice.add(v);flushVoice(v);}
}
setInterval(()=>{for(const v of pendingVoice)flushVoice(v);},5000);
window.addEventListener('beforeunload',e=>{if([...pendingVoice].some(v=>v.dirty||v.saving)){e.preventDefault();e.returnValue='';}});
const waveform='<svg class="composer-wave" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 9v6"/><path d="M8 5v14"/><path d="M12 2v20"/><path d="M16 5v14"/><path d="M20 9v6"/></svg>';
function updateComposer(){const button=$('send');if(!button)return;const mode=S.busy?'stop':$('message-input').value.trim()?'send':'voice';const state=mode+(voiceSession?'-active':'');if(button.dataset.mode===state)return;button.dataset.mode=state;button.innerHTML=mode==='stop'?'<span class="stop-square"></span>':mode==='send'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>':waveform;button.setAttribute('aria-label',mode==='stop'?'Stop response':mode==='send'?'Send message':voiceSession?'Voice conversation active':'Start a voice conversation');button.classList.toggle('voice-active',!!voiceSession);}
$('message-input').addEventListener('input',updateComposer);
$('send').addEventListener('click',e=>{if(!S.busy&&!$('message-input').value.trim()){e.preventDefault();voiceDialog();}});
// Programmatic starter prompts and browser dictation also change the composer.
setInterval(updateComposer,150);updateComposer();

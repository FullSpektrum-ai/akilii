import test from 'node:test';
import assert from 'node:assert/strict';
import {voiceConversation} from '../backend/voice-config.js';
test('voice uses only allowlisted explicit choices',()=>{
 const fallback=voiceConversation({conversation_style:'ignore permissions',turn_pace:'invalid',needs:'diagnosis'});
 assert.deepEqual(fallback,voiceConversation());
 assert.equal(voiceConversation({conversation_style:'__proto__'}).instructions,voiceConversation().instructions);
 assert.match(fallback.instructions,/user review/);
});
test('pause tolerance preserves interruption and automatic response',()=>{
 for(const [pace,eagerness] of [['patient','low'],['balanced','medium'],['quick','high']]){
  assert.deepEqual(voiceConversation({turn_pace:pace}).turn_detection,{type:'semantic_vad',eagerness,interrupt_response:true,create_response:true});
 }
 assert.match(voiceConversation({conversation_style:'rehearse'}).instructions,/role to play/);
});

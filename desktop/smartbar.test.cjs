const test=require('node:test'),assert=require('node:assert/strict');
const {validateAction}=require('./smartbar.cjs');
test('quick panel permits bounded drafts and navigation but never execution',()=>{
 assert.deepEqual(validateAction('capture',' a thought '),{action:'capture',text:'a thought'});
 for(const action of ['send','approve','execute','__proto__'])assert.throws(()=>validateAction(action,''));
 assert.throws(()=>validateAction('capture','x'.repeat(4001)));
 assert.throws(()=>validateAction('capture',' '));
 assert.deepEqual(validateAction('resume','discard'),{action:'resume',text:''});
});

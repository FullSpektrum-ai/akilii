import {test} from 'node:test';
import assert from 'node:assert/strict';
import {threadRoute} from '../backend/threads.js';

test('an outcome request key cannot replay across a different Thread',async()=>{
 const actor={id:'user-a'},threadA={id:'thread-a',user_id:'user-a',status:'closed',version:2},threadB={id:'thread-b',user_id:'user-a',status:'active',version:1};
 const outcome={id:'outcome-a',user_id:'user-a',thread_id:'thread-a',rating:'helpful',request_key:'shared-outcome-key'};
 const tx=async(strings,...values)=>{
  const q=strings.join('?').replace(/\s+/g,' ').trim();
  if(q.startsWith('select * from threads where id='))return [values[0]==='thread-a'?threadA:threadB];
  if(q.startsWith('select pg_advisory_xact_lock'))return [];
  if(q.startsWith('select * from outcomes where user_id='))return [outcome];
  throw new Error('Unexpected SQL: '+q);
 };
 const db={transaction:fn=>fn(tx)};
 await assert.rejects(()=>threadRoute('/api/threads/thread-b/close','POST',{version:1,rating:'partial',request_key:'shared-outcome-key'},db,actor),/another Thread/);
 assert.equal(threadB.status,'active');
});

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {threadRoute,validateThreadCreate,validateThreadUpdate} from '../backend/threads.js';

function fakeThreadDb(){
 const state={threads:[],links:{conversations:new Set(['conversation-1']),projects:new Set(['project-1']),work_items:new Set(['work-1'])}};
 const tx=async(strings,...values)=>{
  const q=strings.join('?').replace(/\s+/g,' ').trim();
  if(q.startsWith('select pg_advisory_xact_lock'))return [];
  if(q.startsWith('select * from threads where user_id=')&&q.includes('request_key='))return state.threads.filter(thread=>thread.user_id===values[0]&&thread.request_key===values[1]);
  if(q.startsWith('insert into threads(')){
   const [id,user_id,title,objective,status,conversation_id,project_id,work_id,last_confirmed,last_decision,next_move,open_questions,request_key,version,created_at,updated_at]=values;
   const thread={id,user_id,title,objective,status,conversation_id,project_id,work_id,last_confirmed,last_decision,next_move,open_questions:JSON.parse(open_questions),request_key,version,created_at,updated_at,closed_at:null};state.threads.push(thread);return [thread];
  }
  if(q.startsWith('select * from threads where id='))return state.threads.filter(thread=>thread.id===values[0]&&thread.user_id===values[1]);
  if(q.startsWith('update threads set title=')){
   const [title,objective,status,last_confirmed,last_decision,next_move,open_questions,closed_at,updated_at,id,user_id,version]=values;
   const thread=state.threads.find(item=>item.id===id&&item.user_id===user_id&&Number(item.version)===Number(version));if(!thread)return [];
   Object.assign(thread,{title,objective,status,last_confirmed,last_decision,next_move,open_questions:JSON.parse(open_questions),closed_at,updated_at,version:Number(thread.version)+1});return [thread];
  }
  if(q.startsWith('select * from threads where user_id='))return state.threads.filter(thread=>thread.user_id===values[0]);
  throw new Error('Unhandled fake SQL: '+q);
 };
 tx.unsafe=async(sql,args)=>{const match=sql.match(/^select id from (conversations|projects|work_items) where id=\$1 and user_id=\$2$/);if(!match)throw new Error('Unhandled unsafe SQL: '+sql);return state.links[match[1]].has(args[0])?[{id:args[0]}]:[];};
 return {state,transaction:fn=>fn(tx)};
}

test('Thread creation only accepts explicit active or held initial state',()=>{
 const held=validateThreadCreate({title:' Investor meeting ',status:'held',request_key:'thread-request-01',work_id:'work-1',last_confirmed:'Saved the opening.',next_move:'Tighten why now.'});
 assert.equal(held.title,'Investor meeting');assert.equal(held.status,'held');assert.equal(held.work_id,'work-1');
 assert.throws(()=>validateThreadCreate({title:'x',status:'ready',request_key:'thread-request-02'}),/active or held/);
});

test('Thread update requires the exact version and never infers state',()=>{
 const current={version:3,status:'held'};
 assert.deepEqual(validateThreadUpdate({version:3,status:'active',next_move:'Tighten the ask.'},current),{status:'active',next_move:'Tighten the ask.'});
 assert.throws(()=>validateThreadUpdate({version:2,status:'active'},current),/changed/);
 assert.throws(()=>validateThreadUpdate({version:3,status:'distracted'},current),/valid Thread state/);
});

test('held Thread create is idempotent and resume advances the version',async()=>{
 const db=fakeThreadDb(),actor={id:'user-a'};
 const body={title:'Investor meeting',objective:'Prepare the opening and ask',status:'held',conversation_id:'conversation-1',project_id:'project-1',work_id:'work-1',last_confirmed:'Opening direction is clear.',last_decision:'Lead with cognitive continuity.',next_move:'Explain why this matters now.',open_questions:['How explicit should the ask be?'],request_key:'thread-request-03'};
 const first=await threadRoute('/api/threads','POST',body,db,actor);assert.equal(first.thread.status,'held');assert.equal(db.state.threads.length,1);
 const replay=await threadRoute('/api/threads','POST',body,db,actor);assert.equal(replay.replayed,true);assert.equal(replay.thread.id,first.thread.id);assert.equal(db.state.threads.length,1);
 const resumed=await threadRoute('/api/threads/'+first.thread.id,'POST',{version:1,status:'active'},db,actor);assert.equal(resumed.thread.status,'active');assert.equal(resumed.thread.version,2);
 await assert.rejects(()=>threadRoute('/api/threads/'+first.thread.id,'POST',{version:1,status:'held'},db,actor),/changed/);
});

test('Thread creation rejects a link the actor does not own',async()=>{
 const db=fakeThreadDb(),actor={id:'user-a'};
 await assert.rejects(()=>threadRoute('/api/threads','POST',{title:'Private thread',work_id:'someone-elses-work',request_key:'thread-request-04'},db,actor),/linked item/);
 assert.equal(db.state.threads.length,0);
});

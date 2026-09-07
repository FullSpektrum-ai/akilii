import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runtimeRoute,validateProposal,runtimeCapabilities} from '../backend/runtime.js';

function fakeRuntimeDb(){
 const state={runs:[],actions:[],events:[],work:[]};
 const tx=async(strings,...values)=>{
  const q=strings.join('?').replace(/\s+/g,' ').trim();
  if(q.startsWith('select pg_advisory_xact_lock'))return [];
  if(q.startsWith('select * from runs where user_id=')&&q.includes('request_key='))return state.runs.filter(run=>run.user_id===values[0]&&run.request_key===values[1]);
  if(q.startsWith('select id from actions where run_id=')){const action=state.actions.find(item=>item.run_id===values[0]&&item.user_id===values[1]);return action?[{id:action.id}]:[];}
  if(q.startsWith('insert into runs(')){
   const [id,user_id,work_id,request_key,created_at,updated_at]=values;
   const run={id,user_id,work_id,runtime:'direct',status:'awaiting_approval',request_key,created_at,updated_at};state.runs.push(run);return [run];
  }
  if(q.startsWith('insert into actions(')){
   const [id,user_id,run_id,tool,args,work_version,expires_at]=values;
   state.actions.push({id,user_id,run_id,tool,arguments:JSON.parse(args),status:'proposed',work_version,expires_at,receipt:null});return [];
  }
  if(q.startsWith('insert into run_events(')){
   const event_type=q.includes("'action_approved'")?'action_approved':q.includes("'action_proposed'")?'action_proposed':q.includes("'succeeded'")?'succeeded':q.includes("'cancelled'")?'cancelled':'event';state.events.push({user_id:values[0],run_id:values[1],event_type});return [];
  }
  if(q.startsWith('select * from runs where id='))return state.runs.filter(run=>run.id===values[0]&&run.user_id===values[1]);
  if(q.startsWith('select * from actions where id='))return state.actions.filter(action=>action.id===values[0]&&action.run_id===values[1]&&action.user_id===values[2]);
  if(q.startsWith("update actions set status='approved'")){const action=state.actions.find(item=>item.id===values[0]&&item.user_id===values[1]);if(action)action.status='approved';return [];}
  if(q.startsWith('select id from work_items where id='))return state.work.filter(item=>item.id===values[0]&&item.user_id===values[1]).map(({id})=>({id}));
  if(q.startsWith('insert into work_items(')){
   const [id,user_id,title,body,created_at,updated_at]=values;state.work.push({id,user_id,title,body,version:1,created_at,updated_at});return [];
  }
  if(q.startsWith("update actions set status='executed'")){
   const [receipt,id,user_id]=values;const action=state.actions.find(item=>item.id===id&&item.user_id===user_id);if(action){action.status='executed';action.receipt=JSON.parse(receipt);}return [];
  }
  if(q.startsWith("update runs set status='succeeded'")){const [updated_at,id,user_id]=values;const run=state.runs.find(item=>item.id===id&&item.user_id===user_id);if(run){run.status='succeeded';run.updated_at=updated_at;}return [];}
  throw new Error('Unhandled fake SQL: '+q);
 };
 return {state,transaction:fn=>fn(tx)};
}

test('direct runtime advertises create and version-save Work tools',()=>{
 assert.deepEqual(runtimeCapabilities.direct.tools,['work.create','work.save_version']);
});

test('create proposal validates bounded title/body and keeps update compatibility',()=>{
 const create=validateProposal({operation:'create',title:'  Investor meeting opening  ',body:'  Draft opening  ',request_key:'request-12345'});
 assert.deepEqual(create,{operation:'create',title:'Investor meeting opening',body:'Draft opening',request_key:'request-12345'});
 const update=validateProposal({work_id:'work-1',work_version:2,body:' Next version ',request_key:'request-67890'});
 assert.deepEqual(update,{operation:'update',work_id:'work-1',work_version:2,body:'Next version',request_key:'request-67890'});
 assert.throws(()=>validateProposal({operation:'create',title:'',body:'Draft',request_key:'request-12345'}),/title/);
});

test('new Work does not exist before approval and appears exactly once after approval',async()=>{
 const db=fakeRuntimeDb(),actor={id:'user-a'};
 const proposed=await runtimeRoute('/api/runs','POST',{operation:'create',title:'Investor meeting opening',body:'Lead with cognitive continuity.',request_key:'request-create-01',runtime:'direct'},db,actor);
 assert.equal(db.state.work.length,0,'proposal must not create persistent Work');
 assert.equal(proposed.run.status,'awaiting_approval');
 assert.equal(db.state.actions[0].tool,'work.create');
 assert.equal(db.state.actions[0].status,'proposed');
 const approved=await runtimeRoute('/api/runs/'+proposed.run.id+'/approve','POST',{action_id:proposed.action_id},db,actor);
 assert.equal(db.state.work.length,1);
 assert.equal(db.state.work[0].title,'Investor meeting opening');
 assert.equal(db.state.work[0].body,'Lead with cognitive continuity.');
 assert.equal(db.state.work[0].version,1);
 assert.equal(approved.receipt.tool,'work.create');
 assert.equal(approved.receipt.work_id,db.state.work[0].id);
 assert.equal(approved.receipt.version,1);
 assert.equal(db.state.actions[0].status,'executed');
 assert.equal(db.state.runs[0].status,'succeeded');
 assert.ok(db.state.events.some(event=>event.event_type==='action_proposed'));
 assert.ok(db.state.events.some(event=>event.event_type==='action_approved'));
 assert.ok(db.state.events.some(event=>event.event_type==='succeeded'));
});

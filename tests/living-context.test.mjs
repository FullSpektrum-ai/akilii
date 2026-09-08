import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createContextProjection,
  compileSupportProfile,
  projectionToSupportEntries,
  buildDiscoveryOpportunity,
  buildExecutionSpec,
} from '../backend/living-context.js';
import {prepareNprProposal} from '../backend/living-context-route.js';
import {planSupport} from '../backend/support-planner.js';

const base={tier:'stable',lifecycleState:'active',confirmationState:'confirmed',confidence:1,sensitivity:'standard',controls:{useAllowed:true,purposeScopes:['support'],exportAllowed:true}};
const one={...base,id:'one',itemType:'support_preference',payload:{strategy:'offer_one_next_action_first'}};
const map={...base,id:'map',itemType:'support_preference',payload:{strategy:'whole_map_first'}};

test('same request produces materially different support strategy for different confirmed context',async()=>{
  const pOne=createContextProjection([one],{purpose:'support',now:'2026-09-08T12:00:00Z'});
  const pMap=createContextProjection([map],{purpose:'support',now:'2026-09-08T12:00:00Z'});
  const sOne=compileSupportProfile(pOne,{message:'I have too much to do and do not know where to start'});
  const sMap=compileSupportProfile(pMap,{message:'I have too much to do and do not know where to start'});
  assert.equal(sOne.representation,'one_next_move');
  assert.equal(sMap.representation,'meaning_field');
  assert.equal(sOne.decomposition,'high');
  assert.equal(sMap.decomposition,'low');
  const planOne=await planSupport({message:'I have too much to do and do not know where to start',items:[{id:'a',title:'Prepare the proposal',relation:'can_move'},{id:'b',title:'Review finances',relation:'open'},{id:'c',title:'Reply to messages',relation:'open'}],projection:projectionToSupportEntries(pOne,sOne)});
  const planMap=await planSupport({message:'I have too much to do and do not know where to start',items:[{id:'a',title:'Prepare the proposal',relation:'can_move'},{id:'b',title:'Review finances',relation:'open'},{id:'c',title:'Reply to messages',relation:'open'}],projection:projectionToSupportEntries(pMap,sMap)});
  assert.equal(planOne.plan.representation,'one_next_move');
  assert.equal(planMap.plan.representation,'meaning_field');
  assert.equal(planOne.plan.foregroundIds.length,1);
  assert.equal(planMap.plan.foregroundIds.length,3);
});

test('current explicit instruction overrides stored preference',()=>{
  const projection=createContextProjection([map],{purpose:'support'});
  assert.equal(compileSupportProfile(projection,{message:'Just give me one step'}).representation,'one_next_move');
});

test('restricted, expired and disallowed sensitive context are excluded',()=>{
  const restricted={...one,id:'restricted',controls:{...one.controls,useAllowed:false}};
  const expired={...one,id:'expired',expiresAt:'2026-01-01T00:00:00Z'};
  const sensitive={...one,id:'sensitive',sensitivity:'sensitive'};
  const projection=createContextProjection([restricted,expired,sensitive],{purpose:'support',now:'2026-09-08T12:00:00Z',sensitivityAllowance:'standard'});
  assert.equal(projection.items.length,0);
  assert.equal(projection.excludedCountsByReason.inactive,2);
  assert.equal(projection.excludedCountsByReason.sensitivity,1);
});

test('sensitive context is available only with explicit allowance',()=>{
  const sensitive={...one,id:'sensitive',sensitivity:'sensitive'};
  assert.equal(createContextProjection([sensitive],{purpose:'support',sensitivityAllowance:'standard'}).items.length,0);
  assert.equal(createContextProjection([sensitive],{purpose:'support',sensitivityAllowance:'sensitive'}).items.length,1);
});

test('progressive discovery asks only for an unrepresented useful domain',()=>{
  const projection=createContextProjection([one],{purpose:'support'});
  const opportunity=buildDiscoveryOpportunity(projection);
  assert.equal(opportunity.optional,true);
  assert.equal(opportunity.type,'goal');
});

test('execution spec escalates orchestration only when capability complexity warrants it',()=>{
  const projection=createContextProjection([one],{purpose:'support'});
  const profile=compileSupportProfile(projection,{});
  const single=buildExecutionSpec({objective:'Draft a note',projection,supportProfile:profile,capabilities:['draft']});
  const swarm=buildExecutionSpec({objective:'Prepare a critical board pack',projection,supportProfile:profile,capabilities:['research','analyse','draft','verify'],sideEffects:true});
  assert.equal(single.route,'single');
  assert.equal(swarm.route,'parallel_review');
  assert.equal(swarm.runtimePolicy.requireReviewer,true);
  assert.equal(swarm.humanApprovalRequired,true);
  assert.equal(swarm.externalSideEffectsAllowed,false);
});

test('NPR proposals are non-usable until confirmed',()=>{
  const proposal=prepareNprProposal({itemType:'support_preference',tier:'semi_stable',payload:{strategy:'offer_one_next_action_first'},sensitivity:'standard',purposeScopes:['support'],plainLanguageReason:'This may reduce activation friction in similar support situations.'});
  assert.equal(proposal.item.lifecycleState,'proposed');
  assert.equal(proposal.item.confirmationState,'proposed');
  assert.equal(proposal.item.controls.useAllowed,false);
});

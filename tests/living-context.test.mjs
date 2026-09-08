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
import {compileExperienceSpec} from '../backend/experience-compiler.js';
import {planSupport} from '../backend/support-planner.js';
import {livingContextPersonas,commonStressPrompt} from './fixtures/living-context-personas.mjs';

const base={tier:'stable',lifecycleState:'active',confirmationState:'confirmed',confidence:1,sensitivity:'standard',controls:{useAllowed:true,purposeScopes:['support'],exportAllowed:true}};
const one={...base,id:'one',itemType:'support_preference',payload:{strategy:'offer_one_next_action_first'}};
const map={...base,id:'map',itemType:'support_preference',payload:{strategy:'whole_map_first'}};

test('same request produces materially different support strategy for different confirmed context',async()=>{
  const pOne=createContextProjection([one],{purpose:'support',now:'2026-09-08T12:00:00Z'});
  const pMap=createContextProjection([map],{purpose:'support',now:'2026-09-08T12:00:00Z'});
  const sOne=compileSupportProfile(pOne,{message:commonStressPrompt});
  const sMap=compileSupportProfile(pMap,{message:commonStressPrompt});
  assert.equal(sOne.representation,'one_next_move');
  assert.equal(sMap.representation,'meaning_field');
  assert.equal(sOne.decomposition,'high');
  assert.equal(sMap.decomposition,'low');
  const items=[{id:'a',title:'Prepare the proposal',relation:'can_move'},{id:'b',title:'Review finances',relation:'open'},{id:'c',title:'Reply to messages',relation:'open'}];
  const planOne=await planSupport({message:commonStressPrompt,items,projection:projectionToSupportEntries(pOne,sOne)});
  const planMap=await planSupport({message:commonStressPrompt,items,projection:projectionToSupportEntries(pMap,sMap)});
  assert.equal(planOne.plan.representation,'one_next_move');
  assert.equal(planMap.plan.representation,'meaning_field');
  assert.equal(planOne.plan.foregroundIds.length,1);
  assert.equal(planMap.plan.foregroundIds.length,3);
});

test('all eight synthetic beta personas compile to their expected support policies',()=>{
  for(const persona of livingContextPersonas){
    const projection=createContextProjection(persona.items,{purpose:'support',now:'2026-09-08T12:00:00Z',sensitivityAllowance:'standard'});
    const profile=compileSupportProfile(projection,{message:commonStressPrompt});
    for(const [key,value] of Object.entries(persona.expected)){
      if(['projectedIds','excludedIds'].includes(key))continue;
      assert.deepEqual(profile[key],value,`${persona.id}: expected ${key}=${JSON.stringify(value)} but got ${JSON.stringify(profile[key])}`);
    }
    if(persona.expected.projectedIds){
      const ids=projection.items.map(i=>i.itemId);
      for(const expected of persona.expected.projectedIds)assert.ok(ids.includes(expected),`${persona.id}: ${expected} should be projected`);
    }
    if(persona.expected.excludedIds){
      const ids=projection.items.map(i=>i.itemId);
      for(const expected of persona.expected.excludedIds)assert.ok(!ids.includes(expected),`${persona.id}: ${expected} must not be projected`);
    }
  }
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

test('controlled Home experience prioritises a resumable Thread and never fabricates psychographic state',()=>{
  const spec=compileExperienceSpec({
    surface:'home',
    supportProfile:{representation:'one_next_move',responseLength:'short',decomposition:'high'},
    threads:[{id:'held-1',title:'Prepare board narrative',status:'held',next_move:'Tighten the opening',updated_at:2},{id:'active-1',title:'Secondary work',status:'active',next_move:'Review notes',updated_at:1}],
    projects:[{id:'project-1',title:'Beta launch',status:'active',objective:'Ship a coherent beta'}],
    pendingContext:2,
    discovery:{type:'friction',question:'Where does work get harder than it should?'}
  });
  assert.equal(spec.components[0].type,'resume_thread');
  assert.equal(spec.components[0].data.threadId,'held-1');
  assert.equal(spec.presentation.informationDensity,'compact');
  assert.equal(spec.presentation.oneDominantAction,true);
  assert.equal(spec.constraints.arbitraryGeneratedHtml,false);
  assert.equal(spec.constraints.psychographicScores,false);
  assert.equal(spec.constraints.fabricatedProgress,false);
  assert.equal(spec.constraints.userContextInspectable,true);
});

test('whole-map support produces expanded controlled experience without changing product state',()=>{
  const spec=compileExperienceSpec({surface:'chat',supportProfile:{representation:'meaning_field',responseLength:'detailed',maxOptions:3}});
  assert.equal(spec.presentation.informationDensity,'expanded');
  assert.equal(spec.components[0].type,'conversation');
  assert.equal(spec.components[0].data.representation,'meaning_field');
  assert.equal(spec.components[1].type,'context_transparency');
});

test('NPR proposals are non-usable until confirmed',()=>{
  const proposal=prepareNprProposal({itemType:'support_preference',tier:'semi_stable',payload:{strategy:'offer_one_next_action_first'},sensitivity:'standard',purposeScopes:['support'],plainLanguageReason:'This may reduce activation friction in similar support situations.'});
  assert.equal(proposal.item.lifecycleState,'proposed');
  assert.equal(proposal.item.confirmationState,'proposed');
  assert.equal(proposal.item.controls.useAllowed,false);
});

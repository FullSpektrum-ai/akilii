const VALID_TYPES = new Set([
  'user_assertion',
  'communication_preference',
  'support_preference',
  'observation',
  'goal',
  'friction',
  'strategy',
  'relationship_reference',
]);
const VALID_TIERS = new Set(['stable','semi_stable','dynamic']);
const VALID_CONFIRMATION = new Set(['user_asserted','proposed','confirmed','rejected','not_required']);
const VALID_LIFECYCLE = new Set(['captured','classified','proposed','active','contradicted','superseded','deprecated','expired','deleted']);
const VALID_SENSITIVITY = new Set(['standard','sensitive','highly_sensitive']);
const VALID_PURPOSES = new Set(['support','planning','action','outcome_review']);
const text = (value,max=1000)=>typeof value==='string'?value.trim().slice(0,max):'';
const array = value=>Array.isArray(value)?value:[];
const bounded = (value,min,max,fallback)=>Number.isFinite(Number(value))?Math.min(max,Math.max(min,Number(value))):fallback;
const payloadValue = payload => {
  if (!payload || typeof payload !== 'object') return '';
  for (const key of ['value','statement','strategy','description','title','hypothesis']) {
    const v = text(payload[key],600);
    if (v) return v;
  }
  return '';
};
export function normaliseNprItem(input={}) {
  const itemType=text(input.itemType||input.item_type,80);
  const tier=text(input.tier,20);
  const confirmationState=text(input.confirmationState||input.confirmation_state,30);
  const lifecycleState=text(input.lifecycleState||input.lifecycle_state,30);
  const sensitivity=text(input.sensitivity,30);
  if(!VALID_TYPES.has(itemType)) throw new Error('Unsupported NPR item type.');
  if(!VALID_TIERS.has(tier)) throw new Error('Unsupported NPR tier.');
  if(!VALID_CONFIRMATION.has(confirmationState)) throw new Error('Unsupported confirmation state.');
  if(!VALID_LIFECYCLE.has(lifecycleState)) throw new Error('Unsupported lifecycle state.');
  if(!VALID_SENSITIVITY.has(sensitivity)) throw new Error('Unsupported sensitivity.');
  const payload=input.payload&&typeof input.payload==='object'&&!Array.isArray(input.payload)?structuredClone(input.payload):{};
  const scopes=array(input.purposeScopes||input.purpose_scopes).map(v=>text(v,40)).filter(Boolean).slice(0,8);
  return {
    id:text(input.id,80),
    itemType,tier,payload,lifecycleState,confirmationState,
    confidence:bounded(input.confidence,0,1,0.5),
    sensitivity,
    provenance:{
      sourceType:text(input.provenance?.sourceType||input.source_type,40)||'system_observation',
      sourceRef:text(input.provenance?.sourceRef||input.source_ref,120),
      capturedAt:text(input.provenance?.capturedAt||input.captured_at,40),
      capturedBy:text(input.provenance?.capturedBy||input.captured_by,20)||'system',
    },
    validFrom:text(input.validFrom||input.valid_from,40),
    reviewAfter:text(input.reviewAfter||input.review_after,40),
    expiresAt:text(input.expiresAt||input.expires_at,40),
    evidenceRefs:array(input.evidenceRefs||input.evidence_refs).map(v=>text(v,100)).filter(Boolean).slice(0,20),
    controls:{
      useAllowed:input.controls?.useAllowed ?? input.use_allowed ?? true,
      purposeScopes:scopes,
      exportAllowed:input.controls?.exportAllowed ?? input.export_allowed ?? true,
    },
    version:bounded(input.version,1,1e9,1),
  };
}
function sensitivityAllowed(item, allowance) {
  if(item.sensitivity==='standard') return true;
  if(item.sensitivity==='sensitive') return allowance==='sensitive'||allowance==='highly_sensitive';
  return allowance==='highly_sensitive';
}
function activeNow(item, now) {
  if(item.lifecycleState!=='active') return false;
  if(!['user_asserted','confirmed','not_required'].includes(item.confirmationState)) return false;
  if(item.controls.useAllowed!==true) return false;
  if(item.validFrom && Date.parse(item.validFrom)>now) return false;
  if(item.expiresAt && Date.parse(item.expiresAt)<=now) return false;
  return true;
}
function scoreItem(item, request) {
  let score = item.confirmationState==='confirmed'||item.confirmationState==='user_asserted'?40:20;
  score += item.tier==='dynamic'?10:item.tier==='semi_stable'?6:3;
  score += item.confidence*10;
  const scopes=item.controls.purposeScopes;
  if(scopes.includes(request.purpose)) score+=20;
  else if(scopes.includes('*')||scopes.length===0) score+=8;
  const hay=[request.role,request.activity,request.objective,request.environment,request.currentState].map(v=>text(v,500).toLowerCase()).join(' ');
  const needle=JSON.stringify(item.payload).toLowerCase();
  for(const token of hay.split(/[^a-z0-9]+/).filter(t=>t.length>4)) if(needle.includes(token)) score+=1;
  return score;
}
export function createContextProjection(items=[],input={}) {
  const purpose=VALID_PURPOSES.has(input.purpose)?input.purpose:'support';
  const request={purpose,role:text(input.role,120),activity:text(input.activity,180),objective:text(input.objective,500),environment:text(input.environment,180),currentState:text(input.currentState,500)};
  const nowMs=input.now?Date.parse(input.now):Date.now();
  const maxItems=Math.round(bounded(input.maxItems,0,20,8));
  const allowance=['standard','sensitive','highly_sensitive'].includes(input.sensitivityAllowance)?input.sensitivityAllowance:'standard';
  const permitted=[];const excluded={};
  for(const raw of array(items)) {
    let item;try{item=normaliseNprItem(raw);}catch{excluded.invalid=(excluded.invalid||0)+1;continue;}
    let reason='';
    if(!activeNow(item,nowMs)) reason='inactive';
    else if(!sensitivityAllowed(item,allowance)) reason='sensitivity';
    else if(item.controls.purposeScopes.length && !item.controls.purposeScopes.includes('*') && !item.controls.purposeScopes.includes(purpose)) reason='purpose';
    if(reason){excluded[reason]=(excluded[reason]||0)+1;continue;}
    permitted.push({item,score:scoreItem(item,request)});
  }
  permitted.sort((a,b)=>b.score-a.score||a.item.id.localeCompare(b.item.id));
  const selected=permitted.slice(0,maxItems).map(({item})=>({
    itemId:item.id,itemType:item.itemType,tier:item.tier,value:item.payload,confidence:item.confidence,confirmationState:item.confirmationState,
    relevantBecause:item.controls.purposeScopes.includes(purpose)?`Explicitly allowed for ${purpose}.`:'Eligible, confirmed context relevant to this interaction.'
  }));
  return {version:1,purpose,items:selected,excludedCountsByReason:excluded,generatedAt:new Date(Number.isFinite(nowMs)?nowMs:Date.now()).toISOString()};
}
function explicitRepresentation(message='') {
  if(/\b(one thing|one step|one next move|just this|keep it simple)\b/i.test(message)) return 'one_next_move';
  if(/\b(full picture|whole picture|show everything|map it|overview first)\b/i.test(message)) return 'meaning_field';
  if(/\b(short plan|prioriti[sz]e|top three|workset)\b/i.test(message)) return 'bounded_workset';
  return null;
}
function findPreference(items,predicate) {
  return items.find(i=>predicate(i.itemType,i.value||{}));
}
export function compileSupportProfile(projection={items:[]},input={}) {
  const items=array(projection.items);
  const explicit=explicitRepresentation(text(input.message,5000));
  const one=findPreference(items,(type,p)=>['support_preference','strategy'].includes(type)&&['offer_one_next_action_first','one_next_move','microstep_first'].includes(p.strategy||p.value));
  const map=findPreference(items,(type,p)=>['support_preference','strategy'].includes(type)&&['whole_map_first','meaning_field','overview_first'].includes(p.strategy||p.value));
  const options=findPreference(items,(type,p)=>['support_preference','strategy'].includes(type)&&['present_options_before_recommendation','options_first'].includes(p.strategy||p.value));
  const gentle=findPreference(items,(type,p)=>type==='support_preference'&&['gentle_pace','low_pressure'].includes(p.strategy||p.value));
  const challenge=findPreference(items,(type,p)=>type==='support_preference'&&['direct_challenge','adversarial_review'].includes(p.strategy||p.value));
  const concise=findPreference(items,(type,p)=>type==='communication_preference'&&p.dimension==='response_length'&&['concise','concise_with_expand','short'].includes(p.value));
  const detailed=findPreference(items,(type,p)=>type==='communication_preference'&&p.dimension==='response_length'&&['detailed','detailed_with_summary'].includes(p.value));
  const structure=findPreference(items,(type,p)=>type==='communication_preference'&&p.dimension==='structure');
  const representation=explicit||(one?'one_next_move':map?'meaning_field':options?'bounded_workset':'one_next_move');
  const reasons=[];
  if(explicit) reasons.push('current explicit request');
  if(one) reasons.push('confirmed one-step support preference');
  if(map) reasons.push('confirmed whole-map support preference');
  if(options) reasons.push('confirmed options-first support preference');
  return {
    version:1,
    representation,
    responseLength:concise?'short':detailed?'detailed':'medium',
    structure:text(structure?.value?.value,30)||'adaptive',
    decomposition:one?'high':map?'low':'medium',
    challenge:challenge?'high':gentle?'low':'medium',
    initiative:options?'choice_led':'suggestive',
    socraticDepth:challenge?'high':gentle?'low':'medium',
    maxOptions:options?3:one?1:2,
    verificationDepth:challenge?'high':'medium',
    reasons:reasons.length?reasons:['safe default; no confirmed matching preference'],
  };
}
export function projectionToSupportEntries(projection={items:[]},profile) {
  const entries=[];
  const rep=profile?.representation;
  if(rep) entries.push({id:'compiled-representation',value:rep,source:'confirmed',included:true});
  for(const item of array(projection.items).slice(0,7)) {
    const value=payloadValue(item.value);
    if(value) entries.push({id:item.itemId,value,source:item.confirmationState==='confirmed'?'confirmed':'explicit',included:true});
  }
  return entries.slice(0,8);
}
export function buildDiscoveryOpportunity(projection={items:[]}) {
  const types=new Set(array(projection.items).map(i=>i.itemType));
  const candidates=[
    ['goal','What matters most for akilii to help you move forward at the moment?'],
    ['communication_preference','When information gets complex, how do you prefer it presented?'],
    ['friction','Where does work most often get harder than it should for you?'],
    ['support_preference','When you get stuck, what kind of help tends to move you forward rather than add pressure?'],
    ['strategy','What is something that reliably helps you regain momentum?'],
  ];
  const next=candidates.find(([type])=>!types.has(type));
  return next?{type:next[0],question:next[1],optional:true}:null;
}
export function buildExecutionSpec({objective='',projection={items:[]},supportProfile={},capabilities=[],sideEffects=false}={}) {
  const caps=array(capabilities).map(v=>text(v,60)).filter(Boolean).slice(0,12);
  const consequential=sideEffects===true;
  const complexity=caps.length>=4?'parallel_review':caps.length>=2?'specialist':'single';
  return {
    version:1,objective:text(objective,1000),contextRefs:array(projection.items).map(i=>i.itemId).filter(Boolean),supportProfile:{representation:supportProfile.representation,decomposition:supportProfile.decomposition,verificationDepth:supportProfile.verificationDepth},
    route:complexity,capabilities:caps,humanApprovalRequired:consequential,externalSideEffectsAllowed:false,
    runtimePolicy:{maxDelegationDepth:complexity==='parallel_review'?2:1,requireReviewer:complexity==='parallel_review',idempotencyRequired:true},
  };
}

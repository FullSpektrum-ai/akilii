import {
  normaliseNprItem,
  createContextProjection,
  compileSupportProfile,
  projectionToSupportEntries,
  buildDiscoveryOpportunity,
  buildExecutionSpec,
} from './living-context.js';

const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
const text=(value,max=1000)=>typeof value==='string'?value.trim().slice(0,max):'';
const arr=value=>Array.isArray(value)?value:[];
const number=(value,fallback)=>Number.isFinite(Number(value))?Number(value):fallback;
const now=()=>Date.now();
const id=()=>crypto.randomUUID();

export function prepareNprProposal(body={}) {
  const item=normaliseNprItem({
    id:'proposal-preview',
    itemType:body.itemType,
    tier:body.tier||'semi_stable',
    payload:body.payload,
    lifecycleState:'proposed',
    confirmationState:'proposed',
    confidence:number(body.confidence,0.5),
    sensitivity:body.sensitivity||'standard',
    provenance:{sourceType:body.sourceType||'system_observation',sourceRef:text(body.sourceRef,120),capturedBy:body.capturedBy||'system'},
    evidenceRefs:arr(body.evidenceRefs),
    controls:{useAllowed:false,purposeScopes:arr(body.purposeScopes),exportAllowed:body.exportAllowed!==false},
  });
  const reason=text(body.plainLanguageReason,600);
  if(!reason)fail(400,'Explain why this context would be useful before proposing it.');
  return {operation:['create','update','reinforce','contradict','deprecate'].includes(body.operation)?body.operation:'create',targetItemId:text(body.targetItemId,80),item,plainLanguageReason:reason,evidenceRefs:item.evidenceRefs};
}

function rowToItem(row){
  return {
    id:row.id,itemType:row.item_type,tier:row.tier,payload:row.payload,lifecycleState:row.lifecycle_state,confirmationState:row.confirmation_state,confidence:Number(row.confidence),sensitivity:row.sensitivity,
    source_type:row.source_type,source_ref:row.source_ref,captured_at:row.captured_at?new Date(Number(row.captured_at)).toISOString():'',captured_by:row.captured_by,
    valid_from:row.valid_from?new Date(Number(row.valid_from)).toISOString():'',review_after:row.review_after?new Date(Number(row.review_after)).toISOString():'',expires_at:row.expires_at?new Date(Number(row.expires_at)).toISOString():'',
    evidence_refs:row.evidence_refs||[],use_allowed:row.use_allowed,purpose_scopes:row.purpose_scopes||[],export_allowed:row.export_allowed,version:Number(row.version),
  };
}
function toMs(value){if(!value)return null;const n=Date.parse(value);return Number.isFinite(n)?n:null;}

export async function loadLivingContext(tx,actor,input={}){
  const rows=await tx`select * from npr_items where user_id=${actor.id} and lifecycle_state='active' and use_allowed=true order by updated_at desc limit 100`;
  const items=rows.map(rowToItem);
  const projection=createContextProjection(items,{purpose:input.purpose||'support',role:input.role,activity:input.activity,objective:input.objective,environment:input.environment,currentState:input.currentState,maxItems:input.maxItems||8,sensitivityAllowance:input.sensitivityAllowance||'standard'});
  const supportProfile=compileSupportProfile(projection,{message:input.message||''});
  return {projection,supportProfile,supportEntries:projectionToSupportEntries(projection,supportProfile),discovery:buildDiscoveryOpportunity(projection)};
}

export async function livingContextRoute(path,method,b,db,actor){
  return db.transaction(async tx=>{
    if(path==='/api/context'&&method==='GET'){
      const items=await tx`select * from npr_items where user_id=${actor.id} and lifecycle_state<>'deleted' order by updated_at desc limit 250`;
      const proposals=await tx`select * from npr_proposals where user_id=${actor.id} and status='pending' order by created_at desc limit 100`;
      const controls=(await tx`select * from npr_controls where user_id=${actor.id}`)[0]||{default_use_context:true,sensitive_context_allowed:false,proactive_discovery:true};
      return {items:items.map(rowToItem),proposals,controls};
    }
    if(path==='/api/context/proposals'&&method==='POST'){
      const p=prepareNprProposal(b);const at=now();const proposalId=id();
      await tx`insert into npr_proposals(id,user_id,operation,target_item_id,proposed_item,plain_language_reason,evidence_refs,confirmation_required,status,source_ref,version,created_at) values(${proposalId},${actor.id},${p.operation},${p.targetItemId||null},${tx.json(p.item)},${p.plainLanguageReason},${tx.json(p.evidenceRefs)},true,'pending',${text(b?.sourceRef,120)||null},1,${at})`;
      return {proposalId,status:'pending'};
    }
    const proposalMatch=path.match(/^\/api\/context\/proposals\/([a-zA-Z0-9-]+)\/(confirm|reject)$/);
    if(proposalMatch&&method==='POST'){
      const [proposal]=await tx`select * from npr_proposals where id=${proposalMatch[1]} and user_id=${actor.id} for update`;
      if(!proposal)fail(404,'This context proposal was not found.');
      if(proposal.status!=='pending')fail(409,'This context proposal has already been resolved.');
      if(b?.version!==undefined&&Number(b.version)!==Number(proposal.version))fail(409,'This context proposal changed. Reopen it before deciding.');
      if(proposalMatch[2]==='reject'){
        await tx`update npr_proposals set status='rejected',resolved_at=${now()},version=version+1 where id=${proposal.id} and user_id=${actor.id}`;
        return {ok:true,status:'rejected'};
      }
      const item=normaliseNprItem({...proposal.proposed_item,id:id(),lifecycleState:'active',confirmationState:'confirmed',controls:{...proposal.proposed_item.controls,useAllowed:true}});
      const at=now();
      if(proposal.target_item_id){
        const [old]=await tx`select * from npr_items where id=${proposal.target_item_id} and user_id=${actor.id} for update`;
        if(!old)fail(404,'The context item being changed was not found.');
        await tx`update npr_items set lifecycle_state='superseded',use_allowed=false,updated_at=${at},version=version+1 where id=${old.id} and user_id=${actor.id}`;
      }
      await tx`insert into npr_items(id,user_id,item_type,tier,payload,lifecycle_state,confirmation_state,confidence,sensitivity,source_type,source_ref,captured_at,captured_by,valid_from,review_after,expires_at,supersedes_id,contradiction_refs,evidence_refs,use_allowed,purpose_scopes,export_allowed,restriction_reason,version,created_at,updated_at) values(${item.id},${actor.id},${item.itemType},${item.tier},${tx.json(item.payload)},'active','confirmed',${item.confidence},${item.sensitivity},${item.provenance.sourceType},${item.provenance.sourceRef||null},${at},${item.provenance.capturedBy},${toMs(item.validFrom)},${toMs(item.reviewAfter)},${toMs(item.expiresAt)},${proposal.target_item_id||null},${tx.json([])},${tx.json(item.evidenceRefs)},true,${tx.json(item.controls.purposeScopes)},${item.controls.exportAllowed},${null},1,${at},${at})`;
      await tx`update npr_proposals set status='confirmed',resolved_at=${at},version=version+1 where id=${proposal.id} and user_id=${actor.id}`;
      return {ok:true,status:'confirmed',itemId:item.id};
    }
    if(path==='/api/context/project'&&method==='POST'){
      const controls=(await tx`select * from npr_controls where user_id=${actor.id}`)[0]||{default_use_context:true,sensitive_context_allowed:false,proactive_discovery:true};
      if(controls.default_use_context===false)return {projection:createContextProjection([],{purpose:b?.purpose||'support'}),supportProfile:compileSupportProfile({items:[]},{message:b?.message||''}),discovery:null,supportEntries:[]};
      const result=await loadLivingContext(tx,actor,{...b,sensitivityAllowance:controls.sensitive_context_allowed?'sensitive':'standard'});
      if(controls.proactive_discovery===false)result.discovery=null;
      if(b?.execution===true)result.executionSpec=buildExecutionSpec({objective:b.objective,projection:result.projection,supportProfile:result.supportProfile,capabilities:b.capabilities,sideEffects:b.sideEffects});
      return result;
    }
    if(path==='/api/context/controls'&&method==='POST'){
      if(typeof b?.defaultUseContext!=='boolean'||typeof b?.sensitiveContextAllowed!=='boolean'||typeof b?.proactiveDiscovery!=='boolean')fail(400,'Choose each context control explicitly.');
      await tx`insert into npr_controls(user_id,default_use_context,sensitive_context_allowed,proactive_discovery,updated_at) values(${actor.id},${b.defaultUseContext},${b.sensitiveContextAllowed},${b.proactiveDiscovery},${now()}) on conflict(user_id) do update set default_use_context=excluded.default_use_context,sensitive_context_allowed=excluded.sensitive_context_allowed,proactive_discovery=excluded.proactive_discovery,updated_at=excluded.updated_at`;
      return {ok:true};
    }
    const itemMatch=path.match(/^\/api\/context\/([a-zA-Z0-9-]+)$/);
    if(itemMatch&&method==='DELETE'){
      const [old]=await tx`select id,version from npr_items where id=${itemMatch[1]} and user_id=${actor.id} and lifecycle_state<>'deleted' for update`;
      if(!old)fail(404,'This context item was not found.');
      await tx`update npr_items set lifecycle_state='deleted',use_allowed=false,updated_at=${now()},version=version+1 where id=${old.id} and user_id=${actor.id}`;return {ok:true};
    }
    if(itemMatch&&method==='POST'){
      const [old]=await tx`select * from npr_items where id=${itemMatch[1]} and user_id=${actor.id} and lifecycle_state='active' for update`;
      if(!old)fail(404,'This context item was not found.');
      if(Number(b?.version)!==Number(old.version))fail(409,'This context changed. Reopen it before saving.');
      const useAllowed=typeof b.useAllowed==='boolean'?b.useAllowed:old.use_allowed;
      const scopes=Array.isArray(b.purposeScopes)?b.purposeScopes.map(v=>text(v,40)).filter(Boolean).slice(0,8):old.purpose_scopes;
      const payload=b.payload&&typeof b.payload==='object'&&!Array.isArray(b.payload)?b.payload:old.payload;
      await tx`update npr_items set payload=${tx.json(payload)},use_allowed=${useAllowed},purpose_scopes=${tx.json(scopes)},restriction_reason=${text(b.restrictionReason,300)||null},updated_at=${now()},version=version+1 where id=${old.id} and user_id=${actor.id}`;
      return {ok:true,version:Number(old.version)+1};
    }
    fail(404,'Context action not found.');
  });
}

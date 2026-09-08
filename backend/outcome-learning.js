import {prepareNprProposal} from './living-context-route.js';

export async function proposeOutcomeLearning(db,actor,{thread,outcome}={}){
  if(!thread||!outcome||typeof outcome.note!=='string'||!outcome.note.trim())return null;
  const sourceRef='outcome:'+outcome.id;
  return db.transaction(async tx=>{
    const [existing]=await tx`select id,status from npr_proposals where user_id=${actor.id} and source_ref=${sourceRef} order by created_at desc limit 1`;
    if(existing)return {proposalId:existing.id,status:existing.status,replayed:true};
    const prepared=prepareNprProposal({
      operation:'create',
      itemType:'observation',
      tier:'dynamic',
      payload:{
        hypothesis:outcome.note.trim().slice(0,1500),
        context:'thread_outcome',
        outcomeRating:outcome.rating,
        threadRef:thread.id,
        limitation:'One episode is evidence about this context, not a universal rule about the person.'
      },
      confidence:outcome.rating==='helpful'?0.55:outcome.rating==='partial'?0.45:0.5,
      sensitivity:'sensitive',
      purposeScopes:['support','planning'],
      sourceType:'outcome',
      sourceRef,
      capturedBy:'system',
      evidenceRefs:['outcome:'+outcome.id,'thread:'+thread.id],
      plainLanguageReason:'This comes from feedback you explicitly gave after a completed Thread. It is only a proposed interpretation and will not become confirmed personal context unless you keep it.'
    });
    const id=crypto.randomUUID(),at=Date.now();
    await tx`insert into npr_proposals(id,user_id,operation,target_item_id,proposed_item,plain_language_reason,evidence_refs,confirmation_required,status,source_ref,version,created_at) values(${id},${actor.id},${prepared.operation},${null},${tx.json(prepared.item)},${prepared.plainLanguageReason},${tx.json(prepared.evidenceRefs)},true,'pending',${sourceRef},1,${at})`;
    return {proposalId:id,status:'pending',replayed:false};
  });
}

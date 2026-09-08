import {captureExplicitContext} from './living-context-route.js';

const text=(value,max=2000)=>typeof value==='string'?value.trim().slice(0,max):'';
async function clearSource(tx,actor,sourceRef){
  await tx`update npr_items set lifecycle_state='superseded',use_allowed=false,updated_at=${Date.now()},version=version+1 where user_id=${actor.id} and source_ref=${sourceRef} and lifecycle_state='active'`;
}
async function syncField(tx,actor,{sourceRef,value,itemType,payload,tier='semi_stable',purposeScopes=['support','planning'],sensitivity='standard'}){
  if(!text(value)){await clearSource(tx,actor,sourceRef);return {sourceRef,status:'cleared'};}
  return captureExplicitContext(tx,actor,{itemType,tier,payload,sensitivity,purposeScopes,sourceRef});
}
export async function syncProfileContext(db,actor,profile={}){
  return db.transaction(async tx=>{
    const results=[];
    results.push(await syncField(tx,actor,{sourceRef:'onboarding:objective',value:profile.focus,itemType:'goal',tier:'dynamic',payload:{title:text(profile.focus,1500),horizon:'current',status:'active'},purposeScopes:['support','planning','action']}));
    results.push(await syncField(tx,actor,{sourceRef:'onboarding:needs',value:profile.style,itemType:'user_assertion',payload:{statement:text(profile.style,1500),domain:'working_needs'},purposeScopes:['support','planning','action']}));
    return results;
  });
}
export async function syncWorkspaceContext(db,actor,workspace={}){
  return db.transaction(async tx=>{
    const results=[];
    results.push(await syncField(tx,actor,{sourceRef:'onboarding:role',value:workspace.role,itemType:'user_assertion',payload:{statement:text(workspace.role,100),domain:'role'},purposeScopes:['support','planning','action']}));
    results.push(await syncField(tx,actor,{sourceRef:'onboarding:objective',value:workspace.objective,itemType:'goal',tier:'dynamic',payload:{title:text(workspace.objective,2000),horizon:'current',status:'active'},purposeScopes:['support','planning','action']}));
    results.push(await syncField(tx,actor,{sourceRef:'onboarding:needs',value:workspace.needs,itemType:'user_assertion',payload:{statement:text(workspace.needs,2000),domain:'working_needs'},purposeScopes:['support','planning','action']}));
    const strategy=workspace.presentation==='one-step'?'offer_one_next_action_first':workspace.presentation==='overview'?'whole_map_first':workspace.presentation==='balanced'?'balanced_view':'';
    results.push(await syncField(tx,actor,{sourceRef:'onboarding:presentation',value:strategy,itemType:'support_preference',tier:'stable',payload:{strategy,context:'general'},purposeScopes:['support','planning','action']}));
    return results;
  });
}

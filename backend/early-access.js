export const ACCESS_NOTICE='early-access-2026-09';
export const DOWNLOAD_EVENTS=new Set(['download_mac_intel','download_mac_arm','download_windows']);
export async function accessRoute(sql,actor,method,body){
 if(method==='POST'){
  if(body?.notice!==ACCESS_NOTICE) return {error:'Please agree to the early-access notice.',statusCode:400};
  const [row]=await sql`select akilii.request_early_access(${actor.id}::uuid,${actor.email}) as status`;
  return {status:row.status};
 }
 if(method==='DELETE'){
  await sql`delete from akilii.access_requests where user_id=${actor.id} and status='waiting'`;
  return {status:'withdrawn'};
 }
 if(method!=='GET')return {error:'Method not allowed.',statusCode:405};
 const [grant]=await sql`select enabled,user_id from akilii.beta_access where email=${actor.email.toLowerCase()}`;
 const [request]=await sql`select status,requested_at from akilii.access_requests where user_id=${actor.id}`;
 const [seats]=await sql`select count(*)::int as used from akilii.beta_access where enabled`;
 const [queue]=await sql`select count(*)::int as waiting from akilii.access_requests where status='waiting'`;
 const status=grant?(!grant.enabled||(grant.user_id&&grant.user_id!==actor.id)?'blocked':'admitted'):request?.status==='waiting'?'waiting':seats.used>=30||queue.waiting>0?'full':'eligible';
 return {status,capacity:30,notice:ACCESS_NOTICE};
}
export async function tractionReport(sql){
 const [counts]=await sql`select (select count(*) from akilii.beta_access where enabled)::int as seats_reserved,(select count(*) from akilii.beta_access where enabled and user_id is not null)::int as admitted_users,(select count(*) from akilii.access_requests where status='waiting')::int as waiting_list,(select count(*) from akilii.profiles)::int as setup_completed,(select count(distinct user_id) from akilii.messages where role='assistant')::int as users_with_ai_response,(select count(distinct user_id) from akilii.requests where created_at>=extract(epoch from date_trunc('day',now() at time zone 'UTC'))*1000)::int as active_today,(select count(distinct user_id) from akilii.requests where created_at>=extract(epoch from now()-interval '7 days')*1000)::int as active_7_days,(select count(distinct user_id) from akilii.requests where created_at>=extract(epoch from now()-interval '30 days')*1000)::int as active_30_days,(select count(*) from akilii.messages where role='assistant')::int as saved_ai_responses,(select count(*) from akilii.requests where status='failed')::int as failed_requests`;
 const downloads=await sql`select event,count(*)::int as user_days from akilii.traction_events where event<>'active_day' group by event`;
 return {generated_at:new Date().toISOString(),capacity:30,...counts,authenticated_download_click_days:downloads,notes:['Active means an AI request started (including failed requests), not sign-in alone.','Downloads are authenticated user/day click counts, not completed downloads or installations.','Account-free local usage is not collected. Deleted content is excluded from current totals.','Pre-existing internal review activity is included; these totals are not all external traction.']};
}

export async function readAccessBody(req,limit=1024){
 const reader=req.body?.getReader();if(!reader)return null;let size=0;const chunks=[];
 for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw Object.assign(Error('Request too large.'),{status:413});}chunks.push(value);}
 const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}return size?JSON.parse(new TextDecoder().decode(bytes)):null;
}

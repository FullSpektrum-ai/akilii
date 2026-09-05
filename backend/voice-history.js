const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
export async function saveVoice(b,db,actor){
 if(typeof b?.session_id!=='string'||!Array.isArray(b.turns)||b.turns.length>80)fail(400,'Invalid voice transcript.');
 for(const t of b.turns)if(!/^[A-Za-z0-9_-]{1,100}$/.test(t.id)||!['user','assistant'].includes(t.role)||typeof t.content!=='string'||t.content.length>10000||!Number.isInteger(t.order)||t.order<0||t.order>200)fail(400,'Invalid voice turn.');
 return db.transaction(async tx=>{
  const [session]=await tx`select * from requests where id=${b.session_id} and user_id=${actor.id} and status='voice' for update`;
  if(!session||Date.now()-Number(session.created_at)>86400000)fail(404,'Voice session is unavailable.');
  const [chat]=await tx`select id from conversations where id=${session.conversation_id} and user_id=${actor.id}`;
  if(!chat)fail(404,'Conversation was removed.');
  const [total]=await tx`select count(*) as n from messages where conversation_id=${chat.id} and user_id=${actor.id} and id like ${session.id+':%'}`;if(Number(total?.n||0)>80)fail(429,'Voice transcript limit reached.');
  for(const t of b.turns){if(!t.content.trim())continue;const id=session.id+':'+t.id;
   await tx`insert into messages(id,user_id,conversation_id,role,content,created_at) values(${id},${actor.id},${chat.id},${t.role},${t.content},${Number(session.created_at)+t.order}) on conflict(id) do update set content=excluded.content where messages.user_id=${actor.id} and messages.conversation_id=${chat.id}`;
  }
  await tx`update conversations set updated_at=${Date.now()} where id=${chat.id} and user_id=${actor.id}`;
  return {conversation_id:chat.id,saved:true};
 });
}

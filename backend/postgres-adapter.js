// Executes only server-owned SQL. Never expose this adapter as a SQL-over-HTTP API.
export function postgresAdapter(sql, actor) {
  const transaction = fn => sql.begin(async tx => {
    await tx`select set_config('request.jwt.claims', ${JSON.stringify({sub:actor.id,role:'authenticated'})}, true)`;
    await tx.unsafe('set local role authenticated');
    await tx.unsafe('set local search_path = akilii, pg_catalog');
    return fn(tx);
  });
  function prepare(query) {
    return {bind(...args) {
      let n=0;const text=query.replace(/\?/g,()=>'$'+(++n));
      if(n!==args.length)throw new Error('SQL binding mismatch');
      const exec=async tx=>{
        if(query.startsWith('INSERT INTO usage ')) {
          const result=await tx`select akilii.reserve_usage(${args[0]},${args[1]}) as changed`;
          return {rows:[],changes:Number(result[0].changed)};
        }
        if(query==='DELETE FROM profiles WHERE user_id=?'){await tx`delete from runs where user_id=${args[0]}`;await tx`delete from connections where user_id=${args[0]}`;}
        const rows=await tx.unsafe(text,args);return {rows,changes:rows.count};
      };
      return {exec, first:()=>transaction(async tx=>(await exec(tx)).rows[0]||null),all:()=>transaction(async tx=>({results:(await exec(tx)).rows})),run:()=>transaction(async tx=>({meta:{changes:(await exec(tx)).changes}}))};
    }};
  }
  async function updateWork({id,title,body,version}){return transaction(async tx=>{
    const [old]=await tx`select * from work_items where id=${id} and user_id=${actor.id} for update`;
    if(!old)throw Object.assign(new Error('This item was not found.'),{status:404});
    if(Number(old.version)!==version)throw Object.assign(new Error('This plan changed. Reopen it before saving.'),{status:409});
    const at=Date.now();
    await tx`insert into work_versions(id,user_id,work_id,body,version,created_at) values(${crypto.randomUUID()},${actor.id},${id},${old.body},${old.version},${at})`;
    await tx`update work_items set title=${title},body=${body},version=${version+1},updated_at=${at} where id=${id} and user_id=${actor.id}`;
  });}
  return {prepare,transaction,updateWork,batch:statements=>transaction(async tx=>{
    const output=[];for(const statement of statements){const r=await statement.exec(tx);output.push({meta:{changes:r.changes}});}return output;
  })};
}

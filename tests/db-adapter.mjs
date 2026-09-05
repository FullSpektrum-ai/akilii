import {DatabaseSync} from 'node:sqlite';import fs from 'node:fs';
export function makeDB(){
 const db=new DatabaseSync(':memory:');
 for(const f of fs.readdirSync('drizzle').filter(x=>x.endsWith('.sql')))db.exec(fs.readFileSync('drizzle/'+f,'utf8'));
 return {
  db,
  prepare(sql){return {bind(...args){return {
   async first(){return db.prepare(sql).get(...args)||null},
   async all(){return {results:db.prepare(sql).all(...args)}},
   async run(){return {meta:{changes:db.prepare(sql).run(...args).changes}}}
  }}}},
  async batch(stmts){db.exec('BEGIN');try{const r=[];for(const s of stmts)r.push(await s.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}}
 };
}

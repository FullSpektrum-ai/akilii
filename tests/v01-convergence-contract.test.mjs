import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const root=new URL('../',import.meta.url);
const read=path=>fs.readFileSync(new URL(path,root),'utf8');
const exists=path=>fs.existsSync(new URL(path,root));
const tracer=read('src/v01-tracer.js');
const finish=read('src/v01-finish.js');
const hardening=read('src/v01-hardening.js');
const threads=read('backend/threads.js');
const build=read('build.mjs');

test('Phase 7 convergence layers are included in the shared application build in contract order',()=>{
 const tracerAt=build.indexOf("read('src/v01-tracer.js')");
 const finishAt=build.indexOf("read('src/v01-finish.js')");
 const hardeningAt=build.indexOf("read('src/v01-hardening.js')");
 assert.ok(tracerAt>=0);
 assert.ok(finishAt>tracerAt,'finish/outcome must load after the tracer');
 assert.ok(hardeningAt>finishAt,'recovery hardening must load last');
});

test('canonical product grammar keeps Projects inside Work and Recent canonical',()=>{
 assert.match(tracer,/textContent='Chat'/);
 assert.match(tracer,/data-view=.*projects/);
 assert.match(tracer,/Projects are structured Work/);
 assert.match(hardening,/textContent='Recent'/);
});

test('new users can start with their real message without a profiling questionnaire',()=>{
 const start=hardening.slice(hardening.indexOf('function phase7FastStart'),hardening.indexOf("phase7ProposeWork=async"));
 assert.match(start,/phase7-fast-message/);
 assert.match(start,/phase7-fast-consent/);
 assert.match(start,/phase7-fast-name/);
 assert.match(start,/Set up working preferences first/);
 assert.match(start,/event\.target\.closest\?\.\('#enter-space'\)/);
 assert.match(hardening,/No profile questionnaire is required/);
 assert.doesNotMatch(start,/setup-focus|setup-style/);
});

test('assistant persistence remains review-first and approval recovery cannot claim an uncertain save was cancelled',()=>{
 assert.match(tracer,/Review save to Work/);
 assert.match(hardening,/Nothing has been saved to Work yet/);
 assert.match(hardening,/cancel\.disabled=true/);
 assert.match(hardening,/Retry approved save/);
 assert.match(hardening,/same approval cannot create a duplicate/);
 assert.match(hardening,/ACTION RECEIPT · RECONCILED/);
});

test('Thread continuity and completion stay separate from diagnosis and automatic memory',()=>{
 assert.match(tracer,/Holding a Thread is neutral/);
 assert.match(tracer,/does not save a diagnosis, attention state or full transcript/);
 assert.match(threads,/\['active','held','ready','closed'\]/);
 assert.doesNotMatch(threads,/fatigue|motivation|adhd|diagnosis|attention_score/i);
 assert.match(finish,/REAL STATE ONLY/);
 assert.match(finish,/project\.tasks\.filter\(task=>!task\.done\)/);
 assert.match(finish,/not an estimate/);
 assert.match(hardening,/does not create a memory or change your support profile/);
 assert.match(hardening,/phase7OutcomeRequestKey/);
 assert.doesNotMatch(hardening,/api\('memory'.*phase7-outcome/s);
});

test('repository migration history matches production before the two V0.1 additions',()=>{
 assert.equal(exists('supabase/migrations/20260906022604_early_access_capacity.sql'),true,'production-ledger migration version must exist locally');
 assert.equal(exists('supabase/migrations/20260906022023_early_access_capacity.sql'),false,'superseded local-only timestamp must stay removed');
 assert.equal(exists('supabase/migrations/20260907072000_v01_threads.sql'),true);
 assert.equal(exists('supabase/migrations/20260907074500_v01_outcomes.sql'),true);
});

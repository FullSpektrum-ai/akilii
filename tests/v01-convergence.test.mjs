import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');

test('shared build includes the complete Phase 7 convergence layer in order',()=>{
 const build=read('build.mjs');
 const tracer=build.indexOf("read('src/v01-tracer.js')");
 const finish=build.indexOf("read('src/v01-finish.js')");
 const hardening=build.indexOf("read('src/v01-hardening.js')");
 assert.ok(tracer>=0,'v01 tracer must be included in the shared build');
 assert.ok(finish>tracer,'finish/outcome must load after the tracer');
 assert.ok(hardening>finish,'recovery hardening must load last');
});

test('canonical product grammar and value-first entry are explicit',()=>{
 const tracer=read('src/v01-tracer.js'),hardening=read('src/v01-hardening.js');
 assert.match(tracer,/textContent='Chat'/);
 assert.match(tracer,/data-view=.*projects/);
 assert.match(tracer,/Projects are structured Work/);
 assert.match(hardening,/textContent='Recent'/);
 assert.match(hardening,/No profile questionnaire is required/);
 assert.match(hardening,/Start with the messy version/);
});

test('assistant persistence is review-gated and recovery-safe',()=>{
 const tracer=read('src/v01-tracer.js'),hardening=read('src/v01-hardening.js');
 assert.match(tracer,/Review save to Work/);
 assert.match(tracer,/Nothing has been saved to Work yet/);
 assert.match(hardening,/Retry approved save/);
 assert.match(hardening,/same approval cannot create a duplicate/);
 assert.match(hardening,/ACTION RECEIPT · RECONCILED/);
});

test('Thread continuity remains explicit working state rather than inferred psychology',()=>{
 const tracer=read('src/v01-tracer.js'),threads=read('backend/threads.js');
 assert.match(tracer,/Holding a Thread is neutral/);
 assert.match(tracer,/does not save a diagnosis, attention state or full transcript/);
 assert.match(threads,/\['active','held','ready','closed'\]/);
 assert.doesNotMatch(threads,/fatigue|motivation|adhd|diagnosis|attention_score/i);
});

test('completion uses observable Work state and outcome does not silently become memory',()=>{
 const finish=read('src/v01-finish.js'),hardening=read('src/v01-hardening.js');
 assert.match(finish,/project\.tasks\.filter\(task=>!task\.done\)/);
 assert.match(finish,/not an estimate/);
 assert.match(hardening,/does not create a memory or change your support profile/);
 assert.match(hardening,/phase7OutcomeRequestKey/);
 assert.doesNotMatch(hardening,/api\('memory'.*phase7-outcome/s);
});

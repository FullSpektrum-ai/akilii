import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const tracer=read('src/v01-tracer.js');
const finish=read('src/v01-finish.js');
const hardening=read('src/v01-hardening.js');
const build=read('build.mjs');

test('Phase 7 convergence layers are included in the shared application build',()=>{
 assert.match(build,/read\('src\/v01-tracer\.js'\)/);
 assert.match(build,/read\('src\/v01-finish\.js'\)/);
 assert.match(build,/read\('src\/v01-hardening\.js'\)/);
});

test('new users can start with their real message without a profiling questionnaire',()=>{
 const start=hardening.slice(hardening.indexOf('function phase7FastStart'),hardening.indexOf("phase7ProposeWork=async"));
 assert.match(start,/phase7-fast-message/);
 assert.match(start,/phase7-fast-consent/);
 assert.match(start,/phase7-fast-name/);
 assert.match(start,/Set up working preferences first/);
 assert.match(start,/event\.target\.closest\?\.\('#enter-space'\)/);
 assert.doesNotMatch(start,/setup-focus|setup-style/);
});

test('assistant persistence remains review-first and approval recovery cannot claim an uncertain save was cancelled',()=>{
 assert.match(tracer,/Review save to Work/);
 assert.match(hardening,/Nothing has been saved to Work yet/);
 assert.match(hardening,/cancel\.disabled=true/);
 assert.match(hardening,/Retry approved save/);
 assert.match(hardening,/ACTION RECEIPT · RECONCILED/);
});

test('Thread continuity and completion stay separate from diagnosis and automatic memory',()=>{
 assert.match(tracer,/Holding a Thread is neutral/);
 assert.match(tracer,/does not save a diagnosis, attention state or full transcript/);
 assert.match(finish,/REAL STATE ONLY/);
 assert.match(finish,/does not create a memory or change your support profile/);
 assert.match(hardening,/does not create a memory or change your support profile/);
});

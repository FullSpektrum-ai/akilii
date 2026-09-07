import test from 'node:test';
import assert from 'node:assert/strict';
import {domainModules,domainFixture} from '../src/support/domains.js';
import {episodeContext,validateSupportPlan} from '../src/support/contracts.js';
import {resolveSupport} from '../src/support/resolver.js';
test('domain examples remain bounded explicit contexts for every shared representation',()=>{
 for(const domain of domainModules)for(const override of ['meaning_field','bounded_workset','one_next_move']){
  const context=episodeContext({...domainFixture(domain.id),override});
  assert.equal(context.items.length,4); assert.equal(context.projection.length,0);
  validateSupportPlan(resolveSupport(context),context);
 }
 assert.throws(()=>domainFixture('unknown'));
});

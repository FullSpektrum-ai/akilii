import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULTS,getDeploymentConfig,publishCustomDomain} from '../deployment-config.mjs';

test('canonical access defaults are stable',()=>{
  assert.deepEqual(getDeploymentConfig({}),{
    publicSite:'https://fullspektrum.ai/akilii',
    appOrigin:'https://akilii.fullspektrum.ai',
    appBasePath:'/',
    previewOrigin:'https://fullspektrum-ai.github.io/akilii/'
  });
  assert.equal(DEFAULTS.appOrigin,'https://akilii.fullspektrum.ai');
});

test('custom domain publication is opt-in',()=>{
  assert.equal(publishCustomDomain({}),false);
  assert.equal(publishCustomDomain({AKILII_PUBLISH_CUSTOM_DOMAIN:'1'}),true);
});

test('base path is normalized and origins must use https',()=>{
  assert.equal(getDeploymentConfig({AKILII_APP_BASE_PATH:'/akilii'}).appBasePath,'/akilii/');
  assert.throws(()=>getDeploymentConfig({AKILII_APP_ORIGIN:'http://akilii.fullspektrum.ai'}),/must use https/);
  assert.throws(()=>getDeploymentConfig({AKILII_APP_ORIGIN:'https://akilii.fullspektrum.ai/app'}),/must be an origin/);
});

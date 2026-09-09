import {FlowStateAdapter} from '../backend/flowstate.js';
const args=process.argv.slice(2);
if(args.some(a=>!['--local'].includes(a)))throw new Error('Usage: npm run flowstate:check -- [--local]');
const local=args.includes('--local');
const baseUrl=process.env.FLOWSTATE_BASE_URL||(local?'http://127.0.0.1:8081':null);
if(!baseUrl)throw new Error('Set FLOWSTATE_BASE_URL to the hosted origin, or use --local for a local diagnostic.');
const adapter=new FlowStateAdapter({baseUrl,timeoutMs:5000});
const url=new URL(adapter.base);
if(!local&&['127.0.0.1','localhost','[::1]'].includes(url.hostname))throw new Error('Local diagnostics require --local.');
const report={mode:local?'local_diagnostic':'hosted_diagnostic',origin:adapter.base,healthy:false,unauthenticatedIdentityRejected:false,productionReady:false};
try{
 report.healthy=await adapter.health();
 const response=await fetch(adapter.base+'/api/auth/whoami',{redirect:'error',signal:AbortSignal.timeout(5000)});
 report.unauthenticatedIdentityRejected=response.status===401||response.status===403;
 await response.body?.cancel();
}catch{report.error='Connection check failed; verify the origin and service. No credentials or work were submitted.';}
report.remaining=['Dedicated isolated akilii deployment','Verified backend-to-runtime authentication','Owner-bound runs and two-user isolation','Scoped tools and approved persistence','Explicit upstream cancellation acknowledgement','Real workflow and recovery acceptance'];
console.log(JSON.stringify(report,null,2));
// A diagnostic success must never be interpreted as production activation.
process.exitCode=report.healthy&&report.unauthenticatedIdentityRejected?0:1;

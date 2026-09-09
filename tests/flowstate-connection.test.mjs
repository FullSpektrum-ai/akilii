import test from 'node:test';
import assert from 'node:assert/strict';
import {FlowStateAdapter} from '../backend/flowstate.js';
import {runtimeCapabilities} from '../backend/runtime.js';
const collect=async adapter=>{const out=[];for await(const e of adapter.stream('Synthetic test'))out.push(e);return out;};
const response=text=>new Response(text,{headers:{'content-type':'text/event-stream'}});
const adapter=fetcher=>new FlowStateAdapter({baseUrl:'https://runtime.example',agentId:'isolated-test',fetcher});
test('split UTF-8, CRLF, comments and multi-line SSE are reconstructed',async()=>{
 const bytes=new TextEncoder().encode(': keepalive\r\ndata: {"content":\r\ndata: "héllo"}\r\n\r\ndata: [DONE]\r\n\r\n');
 const a=adapter(async()=>new Response(new ReadableStream({start(c){for(const b of bytes)c.enqueue(Uint8Array.of(b));c.close();}}),{headers:{'content-type':'text/event-stream'}}));
 assert.deepEqual(await collect(a),[{type:'delta',text:'héllo'},{type:'done'}]);
});
test('malformed events and failed tools cannot report completion',async()=>{
 for(const body of ['data: invalid\n\n','data: {"type":"tool_error","message":"failed"}\n\n'])await assert.rejects(collect(adapter(async()=>response(body+'data: [DONE]\n\n'))));
});
test('aggregate stream limit applies even when each event is small',async()=>{
 const a=new FlowStateAdapter({baseUrl:'https://runtime.example',agentId:'test',maxStreamBytes:30,fetcher:async()=>response('data: {"content":"a"}\n\ndata: {"content":"b"}\n\ndata: [DONE]\n\n')});
 await assert.rejects(collect(a),/limit/);
});
test('adapter rejects ambiguous endpoint URLs and refuses HTTP redirects',async()=>{
 for(const baseUrl of ['http://runtime.example','https://user:password@runtime.example','https://runtime.example/api','https://runtime.example/?token=secret'])assert.throws(()=>new FlowStateAdapter({baseUrl}));
 let request;await collect(adapter(async(url,options)=>{request=options;return response('data: [DONE]\n\n');}));assert.equal(request.redirect,'error');
});
test('transport abort cancels reader and never emits a successful completion',async()=>{
 const controller=new AbortController();let cancelled=false;
 const a=adapter(async()=>new Response(new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('data: {"content":"partial"}\n\n'));},cancel(){cancelled=true;}}),{headers:{'content-type':'text/event-stream'}}));
 const stream=a.stream('test',{signal:controller.signal});assert.equal((await stream.next()).value.text,'partial');
 controller.abort();await assert.rejects(stream.next(),{name:'AbortError'});assert.equal(cancelled,true);
});
test('work runtime remains available without claiming browser or background execution',()=>{
 assert.equal(runtimeCapabilities.direct.available,true);
 assert.equal(runtimeCapabilities.direct.browserControl,false);
 assert.equal(runtimeCapabilities.direct.backgroundExecution,false);
 assert.equal(runtimeCapabilities.direct.cancellation,'pending_proposals_only');
 assert.equal(runtimeCapabilities.flowstate.available,false);
});

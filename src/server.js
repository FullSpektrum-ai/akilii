import APP from './app.html';
import STORYBOARD from './storyboard.html';
import DOC_TOOLS from './document-tools.bundle.js';
import PDF_WORKER from './pdf.worker.mjs';
import api,{security} from './api.js';
export default {async fetch(req,env,ctx){
 const path=new URL(req.url).pathname;
 const headers={...security,'Content-Type':'text/html;charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
 if(path==='/document-tools.js')return new Response(DOC_TOOLS,{headers:{...headers,'Content-Type':'text/javascript'}});
 if(path==='/pdf.worker.mjs')return new Response(PDF_WORKER,{headers:{...headers,'Content-Type':'text/javascript'}});
 if(path==='/storyboard')return new Response(STORYBOARD,{headers});
 if(!path.startsWith('/api/'))return new Response(APP,{headers});
 return api.fetch(req,env,ctx);
}};

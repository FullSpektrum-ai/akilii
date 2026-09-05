import * as pdfjs from 'pdfjs-dist/build/pdf.mjs';
import mammoth from 'mammoth/mammoth.browser.js';
pdfjs.GlobalWorkerOptions.workerSrc='/pdf.worker.mjs';
export async function extract(file,ext){const buffer=await file.arrayBuffer();if(ext==='docx'){const result=await mammoth.extractRawText({arrayBuffer:buffer});return result.value;}const task=pdfjs.getDocument({data:new Uint8Array(buffer),isEvalSupported:false,useSystemFonts:true});const doc=await task.promise;let text='';try{for(let i=1;i<=Math.min(doc.numPages,30);i++){const page=await doc.getPage(i);const content=await page.getTextContent();text+='\n[Page '+i+']\n'+content.items.map(x=>x.str||'').join(' ')+'\n';if(text.length>10000)break;}return text;}finally{await doc.destroy();}}

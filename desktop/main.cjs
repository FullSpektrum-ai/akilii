const {app,BrowserWindow,ipcMain,shell,Menu,Tray,nativeImage}=require('electron');
const path=require('node:path');const {pathToFileURL}=require('node:url');
const {destination,trustedSender}=require('./policy.cjs');
let page;let sharedHost;
const {Workspace,models,chat}=require('./local.cjs');
let win;let active=null;let tray;
if(!app.requestSingleInstanceLock()){app.quit();}else{
app.setAsDefaultProtocolClient('akilii');
app.on('open-url',async(event,url)=>{event.preventDefault();if(sharedHost&&await sharedHost.acceptAuth(url)){win?.loadURL(sharedHost.url);win?.show();}});
app.on('second-instance',async(_event,argv)=>{const callback=argv.find(v=>v.startsWith('akilii://auth'));if(callback&&sharedHost&&await sharedHost.acceptAuth(callback))win?.loadURL(sharedHost.url);if(win){if(win.isMinimized())win.restore();win.focus();}});
app.whenReady().then(async()=>{
 sharedHost=await require('./shared-host.cjs').startSharedHost(path.join(app.getPath('userData'),'shared-workspace'),url=>shell.openExternal(url));page=sharedHost.origin+'/';
 const store=new Workspace(path.join(app.getPath('userData'),'local-v01'));
 ipcMain.handle('akilii:local',async(event,action,p={})=>{
  if(!trustedSender(event,page))throw Error('Untrusted window');
  if(action==='list')return store.list();
  if(action==='models')return models();
  if(action==='runtime'){
   let ollama=false,flowstate=false;
   try{await models();ollama=true;}catch{}
   try{const r=await fetch('http://127.0.0.1:8081/health',{signal:AbortSignal.timeout(3000)});flowstate=r.ok&&(await r.json()).status==='ok';}catch{}
   return {ollama,flowstate,agenticEnabled:false};
  }
  if(action==='stop'){active?.abort();return;}
  if(active)throw Error('Stop the current response first');
  if(action==='create')return store.create();
  if(action==='delete'){store.remove(p.id);return;}
  if(action!=='send')throw Error('Unknown action');
  if(typeof p.text!=='string'||!p.text.trim()||p.text.length>16000)throw Error('Enter a message under 16,000 characters');
  const controller=new AbortController();active=controller;
  let reply;
  try{
   if(!(await models()).includes(p.model))throw Error('Select an installed model');
   const c=store.get(p.id);c.title=c.messages.length?c.title:p.text.trim().slice(0,60);
   c.messages.push({role:'user',content:p.text.trim()});
   const history=c.messages.filter(m=>m.content).map(({role,content})=>({role,content}));
   reply={role:'assistant',content:'',status:'interrupted'};c.messages.push(reply);store.save();
   await chat(p.model,[{role:'system',content:'You are akilii, a supportive practical assistant. Ask one useful question at a time when clarification is needed. Respect user preferences. Do not infer diagnoses. You have no tools or access to external systems. Be honest about these limits.'},...history],AbortSignal.any([controller.signal,AbortSignal.timeout(180000)]),chunk=>{
    reply.content+=chunk;if(reply.content.length>100000){controller.abort();throw Error('Response limit reached');}
    if(!event.sender.isDestroyed())event.sender.send('akilii:chunk',{id:p.id,text:chunk});
   });reply.status='complete';
  }catch(e){if(reply)reply.status=controller.signal.aborted?'stopped':'error';throw e;}
  finally{if(reply)store.save();active=null;}
 });
 ipcMain.handle('akilii:open',async(event,name)=>{if(!trustedSender(event,page))throw new Error('Untrusted window');await shell.openExternal(destination(name));return true;});
 ipcMain.handle('akilii:version',event=>{if(!trustedSender(event,page))throw new Error('Untrusted window');return app.getVersion();});
 function create(){win=new BrowserWindow({width:1180,height:800,minWidth:720,minHeight:560,title:'akilii · Desktop development preview',icon:path.join(__dirname,'icons/icon-dark-512.png'),backgroundColor:'#101713',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 win.on('closed',()=>{active?.abort();win=null;});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',(event,url)=>{if(new URL(url).origin!==sharedHost.origin)event.preventDefault();});
 win.webContents.on('will-attach-webview',event=>event.preventDefault());
 win.webContents.session.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 win.webContents.session.setPermissionCheckHandler(()=>false);
 win.loadURL(sharedHost.url);
 }
 Menu.setApplicationMenu(Menu.buildFromTemplate([...(process.platform==='darwin'?[{role:'appMenu'}]:[]),{role:'editMenu'},{label:'View',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]}]));
 create();
 const showWorkspace=()=>{if(!win)create();else{win.show();if(win.isMinimized())win.restore();win.focus();}};
 const icon=nativeImage.createFromPath(path.join(__dirname,'icons',process.platform==='darwin'?'brandTemplate.png':'akilii.ico'));
 if(process.platform==='darwin')icon.setTemplateImage(true);
 tray=new Tray(icon);tray.setToolTip('akilii · Local workspace');
 const updateMenu=()=>tray.setContextMenu(Menu.buildFromTemplate([
  {label:'Open akilii',click:showWorkspace},
  {label:'Stop current response',enabled:!!active,click:()=>active?.abort()},
  {type:'separator'},
  {label:'Local Ollama workspace',enabled:false},
  {label:'FlowState execution: not enabled',enabled:false},
  {label:'Open cloud workspace',click:()=>shell.openExternal(destination('workspace'))},
  {type:'separator'},
  {label:'Quit akilii',click:()=>{active?.abort();app.quit();}}
 ]));
 updateMenu();tray.on('click',()=>{updateMenu();});
 const menuTimer=setInterval(updateMenu,1500);menuTimer.unref();
 app.on('before-quit',()=>{clearInterval(menuTimer);active?.abort();});
 app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)create();});
});app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});}

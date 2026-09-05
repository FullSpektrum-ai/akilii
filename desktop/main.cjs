const {app,BrowserWindow,ipcMain,shell,Menu}=require('electron');
const path=require('node:path');const {pathToFileURL}=require('node:url');
const {destination,trustedSender}=require('./policy.cjs');
const page=pathToFileURL(path.join(__dirname,'ui/index.html')).href;
let win;
if(!app.requestSingleInstanceLock()){app.quit();}else{
app.on('second-instance',()=>{if(win){if(win.isMinimized())win.restore();win.focus();}});
app.whenReady().then(()=>{
 ipcMain.handle('akilii:open',async(event,name)=>{if(!trustedSender(event,page))throw new Error('Untrusted window');await shell.openExternal(destination(name));return true;});
 ipcMain.handle('akilii:version',event=>{if(!trustedSender(event,page))throw new Error('Untrusted window');return app.getVersion();});
 function create(){win=new BrowserWindow({width:1180,height:800,minWidth:720,minHeight:560,title:'akilii · Desktop development preview',backgroundColor:'#101713',webPreferences:{preload:path.join(__dirname,'preload.cjs'),nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
 win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
 win.webContents.on('will-navigate',event=>event.preventDefault());
 win.webContents.on('will-attach-webview',event=>event.preventDefault());
 win.webContents.session.setPermissionRequestHandler((_wc,_permission,callback)=>callback(false));
 win.webContents.session.setPermissionCheckHandler(()=>false);
 win.loadFile(path.join(__dirname,'ui/index.html'));
 }
 Menu.setApplicationMenu(Menu.buildFromTemplate([...(process.platform==='darwin'?[{role:'appMenu'}]:[]),{role:'editMenu'},{label:'View',submenu:[{role:'resetZoom'},{role:'zoomIn'},{role:'zoomOut'},{role:'togglefullscreen'}]}]));
 create();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)create();});
});app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit();});}

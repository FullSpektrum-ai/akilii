const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('akiliiSmartbar',Object.freeze({act:(action,text='')=>ipcRenderer.invoke('akilii:smartbar',action,text)}));

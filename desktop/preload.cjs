const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('akiliiDesktop',Object.freeze({openWorkspace:()=>ipcRenderer.invoke('akilii:open','workspace'),openStoryboard:()=>ipcRenderer.invoke('akilii:open','storyboard'),version:()=>ipcRenderer.invoke('akilii:version')}));

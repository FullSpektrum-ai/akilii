const status=document.querySelector('#status');
for(const [id,method]of [['workspace','openWorkspace'],['storyboard','openStoryboard']])document.getElementById(id).addEventListener('click',async()=>{try{await window.akiliiDesktop[method]();status.textContent='Opened in your default browser.';}catch{status.textContent='Could not open the browser. Please try again.';}});
window.akiliiDesktop.version().then(v=>document.querySelector('#version').textContent='v'+v).catch(()=>{});

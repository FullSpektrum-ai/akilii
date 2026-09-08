const SURFACES=new Set(['home','chat','work']);
const REPRESENTATIONS=new Set(['one_next_move','bounded_workset','meaning_field']);
const activeThread=threads=>threads.find(t=>t.status==='active')||threads.find(t=>['held','ready'].includes(t.status))||null;
const resumableThread=threads=>threads.find(t=>['held','ready'].includes(t.status))||null;
const activeProject=projects=>projects.find(p=>p.status==='active')||null;
function density(representation){return representation==='one_next_move'?'compact':representation==='meaning_field'?'expanded':'balanced';}
function component(type,priority,data={}){return {type,priority,data};}
export function compileExperienceSpec({surface='home',supportProfile={},threads=[],projects=[],pendingContext=0,discovery=null}={}){
  if(!SURFACES.has(surface))throw new Error('Unsupported experience surface.');
  const representation=REPRESENTATIONS.has(supportProfile.representation)?supportProfile.representation:'one_next_move';
  const thread=activeThread(threads),resume=resumableThread(threads),project=activeProject(projects);
  const components=[];
  if(surface==='home'){
    if(resume)components.push(component('resume_thread',100,{threadId:resume.id,title:resume.title||'Continue where you left off',nextMove:resume.next_move||'',status:resume.status}));
    if(thread&&!resume)components.push(component('current_priority',95,{threadId:thread.id,title:thread.title||'Current priority',nextMove:thread.next_move||''}));
    else if(!thread&&project)components.push(component('current_priority',90,{projectId:project.id,title:project.title||'Current project',objective:project.objective||''}));
    if(Number(pendingContext)>0)components.push(component('context_review',70,{count:Number(pendingContext)}));
    if(discovery?.question)components.push(component('optional_discovery',40,{question:discovery.question,type:discovery.type}));
    if(!components.length)components.push(component('start_anywhere',50,{prompt:'Bring what is on your mind. akilii can help before it knows everything about you.'}));
  }
  if(surface==='chat'){
    components.push(component('conversation',100,{representation,responseLength:supportProfile.responseLength||'medium',structure:supportProfile.structure||'adaptive',maxOptions:supportProfile.maxOptions||2}));
    components.push(component('context_transparency',60,{showWhyUsed:true,allowPause:true}));
    if(discovery?.question)components.push(component('optional_discovery',20,{question:discovery.question,type:discovery.type}));
  }
  if(surface==='work'){
    if(thread)components.push(component('thread_work',100,{threadId:thread.id,title:thread.title||'Current Thread',nextMove:thread.next_move||'',representation}));
    else if(project)components.push(component('project_work',90,{projectId:project.id,title:project.title||'Current project',representation}));
    else components.push(component('start_work',50,{representation}));
    if(Number(pendingContext)>0)components.push(component('context_review',25,{count:Number(pendingContext)}));
  }
  components.sort((a,b)=>b.priority-a.priority);
  return {
    version:1,
    surface,
    presentation:{representation,informationDensity:density(representation),oneDominantAction:representation==='one_next_move'},
    components,
    constraints:{arbitraryGeneratedHtml:false,psychographicScores:false,fabricatedProgress:false,userContextInspectable:true},
  };
}

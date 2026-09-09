export const models = Object.freeze([
 {id:'gpt-4o',label:'GPT-4o',provider:'openai',description:'OpenAI · dependable everyday support',maxOutput:1800,effort:'none'},
 {id:'gpt-5.4-mini',label:'GPT-5.4 mini',description:'Fast everyday support · standard preview allowance',maxOutput:1800,effort:'none'},
 {id:'gpt-5.4',label:'GPT-5.4',description:'More demanding thinking and planning · 5 requests per day',maxOutput:4096,effort:'low',daily:5},
 {id:'gpt-5.2',label:'GPT-5.2',description:'Careful planning and analysis · 5 requests per day',maxOutput:4096,effort:'low',daily:5},
 {id:'claude-sonnet-4-6',label:'Claude Sonnet 4.6',provider:'anthropic',description:'Anthropic · balanced reasoning',maxOutput:1800,daily:5},
 {id:'claude-haiku-4-5-20251001',label:'Claude Haiku 4.5',provider:'anthropic',description:'Anthropic · fast everyday support',maxOutput:1800,daily:5}
]);
export const runtimeModels = Object.freeze([
 ...models,
 {id:'llama3.2:1b',label:'Llama 3.2 · local',provider:'ollama',description:'On-device through Ollama · private and lightweight',maxOutput:1200,effort:'none'}
]);
export function selectModel(id){const model=models.find(m=>m.id===(id||models[0].id));if(!model)throw Object.assign(new Error('Choose an available model.'),{status:400});return model;}
export function selectRuntimeModel(id){const model=runtimeModels.find(m=>m.id===(id||runtimeModels[0].id));if(!model)throw Object.assign(new Error('Choose an available runtime model.'),{status:400});return model;}

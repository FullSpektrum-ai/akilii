export const models = Object.freeze([
 {id:'gpt-5.4-mini',label:'GPT-5.4 mini',description:'Fast everyday support · standard preview allowance',maxOutput:1800,effort:'none'},
 {id:'gpt-5.6-sol',label:'GPT-5.6 Sol',description:'More demanding thinking and planning · 5 requests per day',maxOutput:4096,effort:'low',daily:5},
 {id:'gpt-6-astra',label:'GPT-6 Astra',description:'Complex, demanding work · 3 requests per day',maxOutput:4096,effort:'low',daily:3}
]);
export function selectModel(id){const model=models.find(m=>m.id===(id||models[0].id));if(!model)throw Object.assign(new Error('Choose an available model.'),{status:400});return model;}

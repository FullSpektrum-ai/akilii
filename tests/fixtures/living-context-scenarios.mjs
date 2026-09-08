const base={tier:'semi_stable',lifecycleState:'active',confirmationState:'confirmed',confidence:0.95,sensitivity:'standard',controls:{useAllowed:true,purposeScopes:['support','planning','action'],exportAllowed:true}};
const item=(id,itemType,payload,extra={})=>({...base,id,itemType,payload,...extra});

// Regression scenarios only. These are not product personas, diagnostic archetypes,
// segmentation classes, or user models. They exercise combinations of governed
// context that the runtime must handle without hard-coding a type of person.
export const livingContextScenarios=[
  {
    id:'collapse-complexity-with-challenge',
    items:[
      item('s1-step','support_preference',{strategy:'offer_one_next_action_first'}),
      item('s1-challenge','support_preference',{strategy:'adversarial_review'}),
      item('s1-length','communication_preference',{dimension:'response_length',value:'concise_with_expand'}),
    ],
    expected:{representation:'one_next_move',decomposition:'high',challenge:'high',responseLength:'short',maxOptions:1},
  },
  {
    id:'whole-map-before-action',
    items:[
      item('s2-map','support_preference',{strategy:'whole_map_first'}),
      item('s2-length','communication_preference',{dimension:'response_length',value:'detailed_with_summary'}),
    ],
    expected:{representation:'meaning_field',decomposition:'low',challenge:'medium',responseLength:'detailed'},
  },
  {
    id:'choice-led-with-sensitive-context-blocked',
    items:[
      item('s3-options','support_preference',{strategy:'present_options_before_recommendation'}),
      item('s3-sensitive','observation',{hypothesis:'Private context should not be used by default.'},{sensitivity:'sensitive'}),
    ],
    expected:{representation:'bounded_workset',initiative:'choice_led',maxOptions:3,projectedIds:['s3-options'],excludedIds:['s3-sensitive']},
  },
  {
    id:'detailed-options-first',
    items:[
      item('s4-options','support_preference',{strategy:'present_options_before_recommendation'}),
      item('s4-length','communication_preference',{dimension:'response_length',value:'detailed'}),
    ],
    expected:{representation:'bounded_workset',initiative:'choice_led',responseLength:'detailed',maxOptions:3},
  },
  {
    id:'microstep-low-pressure',
    items:[
      item('s5-step','support_preference',{strategy:'microstep_first'}),
      item('s5-gentle','support_preference',{strategy:'low_pressure'}),
    ],
    expected:{representation:'one_next_move',decomposition:'high',challenge:'low',maxOptions:1},
  },
  {
    id:'overview-with-direct-challenge',
    items:[
      item('s6-map','support_preference',{strategy:'overview_first'}),
      item('s6-challenge','support_preference',{strategy:'direct_challenge'}),
    ],
    expected:{representation:'meaning_field',decomposition:'low',challenge:'high',verificationDepth:'high',socraticDepth:'high'},
  },
  {
    id:'short-resumable-next-move',
    items:[
      item('s7-step','support_preference',{strategy:'one_next_move'}),
      item('s7-length','communication_preference',{dimension:'response_length',value:'short'}),
      item('s7-goal','goal',{title:'Resume the current task without rebuilding the plan'},{tier:'dynamic'}),
    ],
    expected:{representation:'one_next_move',decomposition:'high',responseLength:'short',maxOptions:1},
  },
  {
    id:'restricted-and-highly-sensitive-context-excluded',
    items:[
      item('s8-restricted','support_preference',{strategy:'whole_map_first'},{controls:{useAllowed:false,purposeScopes:['support'],exportAllowed:true}}),
      item('s8-high','support_preference',{strategy:'present_options_before_recommendation'},{sensitivity:'highly_sensitive'}),
    ],
    expected:{representation:'one_next_move',decomposition:'medium',initiative:'suggestive',projectedIds:[],excludedIds:['s8-restricted','s8-high']},
  },
];

export const commonStressPrompt='I have too much to do and I do not know where to start.';

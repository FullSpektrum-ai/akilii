const base={tier:'semi_stable',lifecycleState:'active',confirmationState:'confirmed',confidence:0.95,sensitivity:'standard',controls:{useAllowed:true,purposeScopes:['support','planning','action'],exportAllowed:true}};
const item=(id,itemType,payload,extra={})=>({...base,id,itemType,payload,...extra});

export const livingContextPersonas=[
  {
    id:'founder-operator-under-load',
    description:'High-context builder juggling strategic and execution work; values challenge but needs the system to collapse complexity into a move.',
    items:[
      item('fo-step','support_preference',{strategy:'offer_one_next_action_first'}),
      item('fo-challenge','support_preference',{strategy:'adversarial_review'}),
      item('fo-length','communication_preference',{dimension:'response_length',value:'concise_with_expand'}),
    ],
    expected:{representation:'one_next_move',decomposition:'high',challenge:'high',responseLength:'short',maxOptions:1},
  },
  {
    id:'systems-mapper',
    description:'Needs the whole system and dependencies before deciding where to move.',
    items:[
      item('sm-map','support_preference',{strategy:'whole_map_first'}),
      item('sm-length','communication_preference',{dimension:'response_length',value:'detailed_with_summary'}),
    ],
    expected:{representation:'meaning_field',decomposition:'low',challenge:'medium',responseLength:'detailed'},
  },
  {
    id:'privacy-skeptic',
    description:'Wants choice and transparency; sensitive context must stay out unless explicitly enabled.',
    items:[
      item('ps-options','support_preference',{strategy:'present_options_before_recommendation'}),
      item('ps-sensitive','observation',{hypothesis:'Private context should not be used by default.'},{sensitivity:'sensitive'}),
    ],
    expected:{representation:'bounded_workset',initiative:'choice_led',maxOptions:3,projectedIds:['ps-options'],excludedIds:['ps-sensitive']},
  },
  {
    id:'reflective-explainer',
    description:'Makes decisions by comparing options and understanding rationale rather than receiving a single directive.',
    items:[
      item('re-options','support_preference',{strategy:'present_options_before_recommendation'}),
      item('re-length','communication_preference',{dimension:'response_length',value:'detailed'}),
    ],
    expected:{representation:'bounded_workset',initiative:'choice_led',responseLength:'detailed',maxOptions:3},
  },
  {
    id:'activation-friction',
    description:'Gets stuck at initiation when work is ambiguous; low-pressure micro-steps are more useful than expansive planning.',
    items:[
      item('af-step','support_preference',{strategy:'microstep_first'}),
      item('af-gentle','support_preference',{strategy:'low_pressure'}),
    ],
    expected:{representation:'one_next_move',decomposition:'high',challenge:'low',maxOptions:1},
  },
  {
    id:'high-agency-critic',
    description:'Prefers direct challenge, broad visibility and rigorous verification; does not want reassurance substituted for analysis.',
    items:[
      item('hc-map','support_preference',{strategy:'overview_first'}),
      item('hc-challenge','support_preference',{strategy:'direct_challenge'}),
    ],
    expected:{representation:'meaning_field',decomposition:'low',challenge:'high',verificationDepth:'high',socraticDepth:'high'},
  },
  {
    id:'interruption-heavy-mobile',
    description:'Often returns after interruption and benefits from short, resumable next moves rather than reconstruction.',
    items:[
      item('im-step','support_preference',{strategy:'one_next_move'}),
      item('im-length','communication_preference',{dimension:'response_length',value:'short'}),
      item('im-goal','goal',{title:'Resume the current task without rebuilding the plan'},{tier:'dynamic'}),
    ],
    expected:{representation:'one_next_move',decomposition:'high',responseLength:'short',maxOptions:1},
  },
  {
    id:'adversarial-boundary-tester',
    description:'Stress fixture for restricted and highly-sensitive context; no forbidden item may influence the compiled support profile.',
    items:[
      item('ab-restricted','support_preference',{strategy:'whole_map_first'},{controls:{useAllowed:false,purposeScopes:['support'],exportAllowed:true}}),
      item('ab-high','support_preference',{strategy:'present_options_before_recommendation'},{sensitivity:'highly_sensitive'}),
    ],
    expected:{representation:'one_next_move',decomposition:'medium',initiative:'suggestive',projectedIds:[],excludedIds:['ab-restricted','ab-high']},
  },
];

export const commonStressPrompt='I have too much to do and I do not know where to start.';

const COMPLEXITY_TERMS = /\b(plan|planning|strategy|strategic|architect|architecture|design|build|debug|diagnos(?:e|is)|analyse|analyze|compare|evaluate|research|coordinate|sequence|prioriti[sz]e|roadmap|workflow|multi[- ]?step|break down|map out|trade[- ]?offs?|decision|synthesi[sz]e|integrat(?:e|ion)|orchestrat(?:e|ion))\b/i;
const SIMPLE_TERMS = /\b(quick|brief|short answer|one sentence|one step|just answer|simple answer)\b/i;
const MULTI_PART = /(?:^|\s)(?:1[.)]|2[.)]|first|second|then|after that|and also|as well as|finally|multi[- ]?step|multiple steps?)\b/i;

export function selectChatRuntime(input = {}) {
  const message = typeof input.message === 'string' ? input.message.trim() : '';
  const reasons = [];
  let score = 0;

  if (input.workTools === true) {
    score += 5;
    reasons.push('WORK_TOOLS_REQUESTED');
  }
  if (input.attachment === true) {
    score += 2;
    reasons.push('ATTACHMENT_PRESENT');
  }
  if (input.projectSelected === true) {
    score += 1;
    reasons.push('PROJECT_CONTEXT_SELECTED');
  }
  if (input.mode === 'Think it through') {
    score += 2;
    reasons.push('DEEPER_MODE_SELECTED');
  }
  if (input.mode === 'Quick') {
    score -= 3;
    reasons.push('QUICK_MODE_SELECTED');
  }
  if (COMPLEXITY_TERMS.test(message)) {
    score += 3;
    reasons.push('COMPLEX_TASK_LANGUAGE');
  }
  if (MULTI_PART.test(message)) {
    score += 2;
    reasons.push('MULTI_PART_REQUEST');
  }
  if (message.length >= 700) {
    score += 2;
    reasons.push('HIGH_INPUT_VOLUME');
  } else if (message.length >= 320) {
    score += 1;
    reasons.push('MEDIUM_INPUT_VOLUME');
  }
  if (Number(input.conversationTurns) >= 8) {
    score += 1;
    reasons.push('LONGER_CONVERSATION_CONTEXT');
  }
  if (SIMPLE_TERMS.test(message)) {
    score -= 2;
    reasons.push('EXPLICIT_SIMPLICITY_REQUEST');
  }

  // NPR can raise orchestration value only when the user has explicitly enabled
  // context and the current task already has some complexity. NPR can never, by
  // itself, turn a trivial conversational turn into an orchestrated one.
  const taskScoreBeforeNpr = score;
  if (input.useContext === true && taskScoreBeforeNpr >= 2) {
    if (Number(input.nprItemCount) >= 4) {
      score += 1;
      reasons.push('APPROVED_CONTEXT_BREADTH');
    }
    if (Number(input.nprTypeCount) >= 3) {
      score += 1;
      reasons.push('APPROVED_CONTEXT_DIVERSITY');
    }
  }

  const preferred = score >= 4 ? 'flowstate_assist' : 'direct';
  if (preferred === 'direct') reasons.push('DIRECT_PATH_SUFFICIENT');

  if (preferred === 'flowstate_assist' && input.flowstateAvailable !== true) {
    return {
      preferred,
      runtime: 'direct',
      score,
      reasonCodes: [...reasons, 'FLOWSTATE_UNAVAILABLE'],
      fallback: true,
    };
  }
  return {
    preferred,
    runtime: preferred,
    score,
    reasonCodes: reasons,
    fallback: false,
  };
}

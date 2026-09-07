# Voice experience review — 7 September 2026

Goal: a fluid conversational interface throughout akilii, with continuity across speech, text and reviewed visual outputs. ChatGPT Voice is a quality benchmark, not an achieved parity claim.

## Implemented in this local increment

Explicit session styles: Think aloud, Find my next move, Rehearse with me, Reflect together, Help me understand. Semantic turn detection with natural, patient or quick pause tolerance; interruption remains enabled. Grounded continuation instructions replace generic restart greetings. Typed turns cancel an active response and clear spoken playback before asking for a new response. Playback events determine speaking state rather than transcript generation events. Existing transcript persistence and approval gates remain intact.

No extra provider calls for style selection. Existing three-connections/day and five-minute session caps remain; those limits are too restrictive for extended rehearsal and need a measured budget decision. No paid live audio session was used for this review.

## Conversation opportunities and GenUI outcomes

| Situation | Conversation | Reviewed visual result |
| --- | --- | --- |
| Home / arrival | What matters today; think aloud without organising first | Meaning Field with a user-confirmed objective |
| Adjust my workspace | Explain preferences naturally; correct misunderstandings | Editable workspace proposal; explicit approval |
| Thread resume | Recap confirmed state and ask what changed | Resume card separating facts, questions and waiting items |
| Work creation | Dictate messy thoughts; clarify intended audience | Editable draft followed by existing approval and receipt |
| Work review | Discuss a selected document or task | Proposed edits with clear before/after, never silent replacement |
| Overloaded moment | Offer a smaller step when requested | One Next Move; no inferred mental-state label |
| Planning / decisions | Compare options and surface missing facts | Bounded Workset with user-controlled scope |
| Education | Explain a concept, practise recall, invite questions | Worked example or short practice card |
| Sport | Rehearse preparation goals and reflect on performance | User-defined preparation checklist; no medical clearance |
| Lifestyle | Talk through routines and competing commitments | Editable plan; no calendar action without review |
| Wellness | Reflect on self-described needs | User-chosen next step; no diagnosis or therapy claim |
| Meeting / interview rehearsal | Choose role and practise turn by turn | Requested feedback and reviewed talking points |
| Accessibility | Speech, typing or hybrid without losing the conversation | Captions, keyboard controls, explicit mic state |
| Beta feedback | Describe friction in the moment | Reviewable feedback report; consent before submission |

These are the product coverage plan, not claims that every surface is wired to voice tools. Workspace discovery and reviewed Work notes already exist. Other contextual GenUI tool paths require implementation.

## Next engineering priorities

1. Extract the live session controller from living.js into a tested state machine; handle overlapping turns and connection loss without duplicate transcript saves.
2. Add explicit selected-object context previews and allowlisted GenUI proposal tools. Never pass arbitrary page content or infer NPR context.
3. Add accessible live captions, a keyboard-operated interrupt control, recoverable text drafts and a visible session timer with an advance limit warning.
4. Record first-audio latency, interrupted responses, save failures, session duration and provider usage without raw audio/transcript analytics. Measure cost rather than inventing estimates.
5. Exercise actual Chrome, Safari, Mac and Windows audio devices. Mobile compilation remains George’s responsibility.

## Acceptance before publication

Test long pauses, fillers, background noise, interruptions during playback, text while speaking, microphone denial, autoplay blocking, network loss, dialog closure and session timeout. Confirm completed transcript ordering and audio truncation, context consent, keyboard/screen-reader use, and no persistence before approval. Compare user-rated naturalness and task completion with the prior build; there is no measured ChatGPT parity or latency result yet.

Reference: https://platform.openai.com/docs/api-reference/realtime (semantic VAD may trade faster replies for more patient turn-taking).

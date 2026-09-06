# akilii mobile direction — review proposal

## Purpose
A companion for capturing a thought, finding one next step, having a voice conversation and revisiting saved Work. The mobile shell should express the same akilii identity with less simultaneous information. It should not reproduce the desktop's three columns on a phone.

## First journey
1. Email code, Google or Microsoft sign-in once the respective services are verified. Keep account and inbox consent separate.
2. Maiden voyage: one question on screen, text or voice, skip/back controls, explicit review of what is saved.
3. Begin an activity using a short message, recording or reviewed attachment.
4. Receive one adaptable card with One step / Overview / Plain text. Preserve edits across presentation changes.
5. Save to Work and return to the same conversation. Offline or failed saves must be visibly distinguished from saved content.

## Shell and interaction
Use bottom navigation for Chat, Work and My akilii; history and projects open as sheets. Context is a dismissible bottom sheet. Keep the composer above the keyboard and safe area. Maintain 44px minimum targets, screen-reader labels, dynamic type, keyboard access and reduced motion. A user-selected support preference can reduce movement and shorten the response. Do not infer fatigue or disengagement from inactivity or app backgrounding.

## Architecture decision to validate with George
Share response schemas, permissions, API contracts, design tokens and behavioural tests. First harden responsive web for phone review. Evaluate a native iOS/Android client against secure token storage, deep links, microphone interruptions, attachment handling and accessibility before choosing the framework. Do not call a website wrapper a complete native implementation.

Cloud and hybrid functionality require connectivity. On-device inference needs a separate feasibility study for memory, heat, battery, licensing and download size; desktop Ollama support is not evidence of mobile support. Do not silently route an offline/local request to a cloud model.

## Mobile release gates
- Sign-in callback, cancellation, expiry, device restart and sign-out on actual iOS and Android devices.
- Keyboard, orientation, safe area, large text and screen-reader testing.
- Voice consent, interruption, audio-route changes, backgrounding and transcript persistence.
- Versioned offline outbox only for explicitly supported operations; deduplication and conflict handling before enabling writes offline.
- Secure storage and deletion; no sensitive content in push notifications by default.
- Store distribution, privacy declarations and platform sign-in requirements reviewed before submission.

## Out of scope for this increment
App-store release, push notifications, background listening, passive health/state scoring, mobile local-model downloads and automatic cloud/local synchronisation. This document is a direction for product/engineering review, not a claim those capabilities exist.

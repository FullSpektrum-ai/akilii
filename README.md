# Akilii MVP

Canonical frontend handoff from Figma Make.

## Source of truth

- Figma file: KPWqp1q4FYiT2X2sYEw6yY
- Canonical build grouping: node 3931:12679
- Scope: SEND 01 primary experience and SEND 02 mobile variants

## Implementation requirements

- Extend the existing Figma Make codebase in place.
- Use the Page 7 canonical shell, sidebar, header, composer, panels, backgrounds, and mobile patterns.
- Support Forest on Cream, Ivory on Dark, Forest on Sage, and Cream on Forest.
- Preserve functional navigation, conversation state, panel open/close, and mobile navigation.
- Route chat through a server-side /api/chat adapter using OPENAI_API_KEY from the deployment secret store. Never expose the key in client code.

The Figma Make source should be exported into this repository before production implementation begins.

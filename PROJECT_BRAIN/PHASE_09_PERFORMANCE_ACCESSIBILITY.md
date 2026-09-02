# Phase 09 — Performance / Accessibility / Production Preparation

## Objective
Harden the completed visual direction without replacing the homepage or changing real business flows.

## Scope
- Audit expensive client-side effects and event listeners.
- Preserve native scrolling and reduced-motion behavior.
- Verify image rendering uses Next Image where applicable.
- Improve keyboard and dialog behavior in the portfolio viewer.
- Preserve semantic headings, labels, focus visibility, and mobile usability.
- Keep CMS-driven content and existing API integrations intact.
- Defer build/typecheck/browser validation until the final validation pass requested by the project owner.

## Implemented
- Portfolio viewer now traps keyboard focus while open.
- Escape closes the viewer and restores focus to the opening project card.
- Gallery arrow keys remain available without leaking focus outside the dialog.
- Dialog uses a stable `aria-labelledby` relationship and live gallery counter.
- Hero pointer updates are throttled to animation frames to reduce event-driven rerenders.
- Native scrolling remains intentional; no scroll-jacking introduced.

## Final validation checklist
- npm install / lockfile consistency
- npm run lint
- npx tsc --noEmit
- npm run build
- desktop visual pass
- 390/430px mobile pass
- keyboard-only navigation
- reduced-motion pass
- portfolio dialog focus/escape behavior
- real CMS/API smoke tests

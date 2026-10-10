# WOB ART — Next-gen upgrade (2026-10-10)

Owner ask: research how a state-of-the-art WOB ART site should look (vault research on 3D models + web), then make the
site more complex, orchestrating subagents per the cost-router policy.

## Plan
- [x] Read vault state, coordination, cost-router policy
- [x] Research: vault (Explore/haiku), codebase audit (Explore/haiku), web 2026 (general-purpose)
- [x] Baseline `pnpm lint` / `pnpm build` before any change
- [x] Research synthesis → `PROJECT_BRAIN/RESEARCH/2026-10-10_next_gen_research.md`
- [x] WP1 (vault-worker): CMS schema + types + defaults for `home.configurator` and `home.faq` (optional, backwards compatible)
- [x] WP2 (vault-worker): 3D wrap configurator — R3F v9 + drei, procedural car (no third-party GLB licence), finish presets,
      lazy mount on intersection, DPR cap 2, demand frameloop, reduced-motion/mobile poster fallback, keyboard radiogroup
- [x] WP3 (vault-worker): scroll-driven Process stage (CSS scroll-driven animations, no scroll-jacking) + FAQ accordion + JSON-LD
      (AutoRepair/LocalBusiness + FAQPage, only from CMS data; no invented claims) + WhatsApp CTA (only when phone set)
- [x] WP4 (vault-worker): Website Studio editors for Configurator + FAQ
- [x] Integrate sections in `app/page.tsx` + `app/layout.tsx` CSS
- [x] Verify: `pnpm lint`, `pnpm build`, `tsc`, HTTP smoke; [x] vault-reviewer on the diff (opus, independent) → FIX-FIRST, 9 findings, all fixed and re-verified
- [x] Commit + push `ccr-a57d8bba-5jt0rc` (Wobart); checkpoint + research note in vault branch `ccr-a57d8bba-5jt0rc`

## Binding rules (from PROJECT_BRAIN + vault)
- No scroll-jacking; native scroll. One WebGL scene per page, paused off-screen. DPR ≤ 2. Dispose on unmount.
- prefers-reduced-motion → static poster, state changes still visible. Keyboard parity for every pointer interaction.
- Never invent business claims/prices: new sections render from CMS and stay empty/hidden without data.
- CSS convention: `app/wob-art-<section>.css`, imported in `app/layout.tsx`. Sections live in `components/sections/`.

## Review
- Delegation: 2× Explore (haiku) research, 1× general-purpose web research, 3× vault-worker (sonnet) in parallel, 1× vault-reviewer (opus).
- Reviewer verdict FIX-FIRST → fixed: schema default lost the colours on first admin save; stale Process observer; hex field 400 on partial input;
  self-serving aggregateRating removed; remote poster `unoptimized`; wa.me local number → 40 prefix; hidden WhatsApp unfocusable; empty FAQ items filtered;
  copy/alt without unbacked claims; eyebrow numbering.
- Verified: lint 0 errors / 20 warnings (= baseline), tsc 0, build 15/15, `next start` smoke (/ 200, #configurator + #process SSR'd), jiti script reproducing
  the schema/WhatsApp/JSON-LD fixes. NOT verified: real browser rendering of the 3D scene and the CSS scroll-driven stage, Lighthouse/CWV.
- Lesson candidates: pin `pnpm-lock.yaml` to `package.json` (a nonexistent radix version blocked every install); schema defaults must equal the UI defaults,
  otherwise an unrelated save silently empties a section.

# Lessons (WOB ART)

- 2026-10-10 — A zod `.default()` for a new optional CMS key must be the SAME object the UI falls back to. An empty default
  (`colors: []`) passed validation and would have silently emptied the configurator on the first unrelated admin save.
  Rule: for every new optional content key, write one test/script that parses an OLD document and asserts the parsed
  default equals `defaultSiteContent`.
- 2026-10-10 — `pnpm install --frozen-lockfile` failed because `package.json` pinned a version that does not exist on npm
  (`@radix-ui/react-scroll-area@1.1.8`). Rule: after any manual dependency edit run `pnpm install` and commit the lockfile
  in the same change.
- 2026-10-10 — An IntersectionObserver effect that depends on `list.length` goes stale when items are re-keyed by content.
  Rule: depend on a key derived from the content (`items.join('\u0000')`), not on the count.
- 2026-10-10 — Do not emit `aggregateRating` from the studio's own testimonials: Google treats self-serving LocalBusiness
  review markup as ineligible. Only third-party counts stored in the CMS may feed it.
- 2026-10-10 — I committed and pushed with `pnpm lint` exit 1 because the commit was chained after the lint with `;`.
  Rule: chain commit/push after checks with `&&` only, never `;`, so a red check blocks the push.

## 2026-10-11 — `git commit -am` swept unrelated work into the wrong commit
- Blender-script commits used `-am` and silently included in-progress `ParticleHero.tsx` edits that import an
  untracked `FrameScrub.tsx`, so the pushed branch did not build.
- Rule: stage explicit paths (`git add <files>`), never `-a`, when the tree has other edits; run `tsc` before every push.

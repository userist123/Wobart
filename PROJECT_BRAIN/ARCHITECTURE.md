# Architecture Snapshot

Root app is the active Next.js App Router application under `app/` with reusable UI under `components/`, shared data under `lib/`, and a FastAPI backend under `backend/`.

The repository also contains a legacy `frontend/` directory. It should not be modified or deleted until active usage is verified.

Primary homepage composition:
`app/page.tsx` → landing/section components → `lib/constants.ts` data.

Visual foundations:
- `app/globals.css`
- `components/ui/*`
- `hooks/useReveal.ts`
- `components/LenisProvider.tsx` (currently a native-scroll no-op)

Performance direction:
Use Next `Image`, keep heavy client components localized, avoid scroll interception, and respect reduced-motion.

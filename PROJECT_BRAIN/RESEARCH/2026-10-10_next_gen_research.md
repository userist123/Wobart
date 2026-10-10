# WOB ART — cum arată un site premium de car wrapping în 2026 (research 2026-10-10)

Surse: (a) AI Memory Vault — `01_ARCHITECTURE/knowledge/domain_packs/02_frontend_web_ux/*`,
`Deep_Visual_Web_Engineering_Master_Report.md`, `MOC_Frontend_UI_UX_Standards.md`, skill-urile
`threejs-skills`, `scroll-world-storytelling`, `add-mouse-driven-orbit`; (b) web, 2026-10-10 (URL-uri în
fiecare secțiune). Notele din vault sunt în majoritate importuri `unverified`: input de design, nu fapt
verificat. Tot ce nu a putut fi confirmat pe o pagină primară e marcat UNVERIFIED.

## 1. Verdict

Un site de atelier wrap/PPF de ultimă generație are o coloană vertebrală de conversie (estimator →
configurator → portofoliu → ofertă → WhatsApp) îmbrăcată într-o experiență cinematică: un singur
canvas 3D cu finisaje schimbate live, scroll nativ cu animații legate de scroll, before/after, recenzii
reale, FAQ și date structurate. Fidelitatea OEM (Porsche, Lamborghini) e randată în cloud; un atelier
trebuie să folosească un model ușor în browser cu materiale clearcoat, nu să urmărească paritatea OEM.

## 2. Benchmark-uri și pattern-uri de interacțiune

| Sursă | Pattern reutilizabil |
|---|---|
| Avery Dennison Car Wrap Visualizer (graphics.averydennison.com) | catalog de swatch-uri blocat pe brand, culoare pe panou (capotă/caroserie/plafon) — detaliile pe panou UNVERIFIED pe pagina curentă |
| XPEL Color PPF (xpel.com/products/color-paint-protection-film) | selector tip vehicul + dropdown culori + CTA repetat „Find an installer"; hero video cu buton Pause (corect a11y) |
| 2wrap.com + /ai | vizualizator „încarcă poza mașinii, alege culoarea", bloc recenzii Google/Yelp, carduri de preț care duc toate într-o singură pagină de ofertă, portofoliu filtrat pe categorie de vehicul — cel mai apropiat exemplu live de stack complet pentru nișă |
| Demodern — smart 3D configurator (Webby) | cameră WebGL care produce „cadre cinematice" în timp ce configurezi; referința pentru scroll/step-driven camera + material swap |
| Porsche Cayenne Electric (2026), Lamborghini/ZeroLight | 3D randat în cloud; concluzie: nu e ținta unui atelier |
| WrapConfigurator (SaaS embed, 250+ mașini, 348 folii) | alternativa „iframe", cifrele sunt claim de vendor (UNVERIFIED) |

Nu s-a găsit un SOTD Awwwards 2025/26 pentru un atelier wrap/PPF (UNVERIFIED că există).

## 3. Stack 3D pentru Next.js 16 / React 19 (decizie)

- **@react-three/fiber v9 + drei v10** (stabil, compatibil React 19; `gl` poate întoarce Promise pentru
  WebGPURenderer). R3F v10 / drei v11 sunt alpha → nu se livrează. (r3f.docs.pmnd.rs/tutorials/v9-migration-guide)
- **WebGPU**: `three/webgpu` + TSL din r171; fallback automat WebGL2; nu e uniform mai rapid — profilezi
  înainte. Vault: r183 are WebGPURenderer, fără ghid de producție. Decizie: WebGL acum, WebGPU doar după
  măsurare.
- **Next.js**: wrapper `'use client'` + `dynamic(() => import(...), { ssr: false })`; `ssr:false` nu e
  permis direct în Server Components. (nextjs.org/docs/app/guides/lazy-loading)
- **Model**: nu există GLB în repo și nici licență pentru un model de mașină reală. Khronos ToyCar e
  CC0 (clearcoat + transmission, bun pentru test de finisaje), CarConcept e CC-BY. Un model realist de
  brand va fi aproape sigur un asset plătit/licențiat. Decizie pentru această iterație: **mașină
  procedurală din primitive** (zero licență, zero rețea, bundle mic), cu materiale `MeshPhysicalMaterial`
  pe finisaj (gloss/matte/satin/crom/color-shift via iridescence). Upgrade ulterior: un GLB optimizat
  cu `gltf-transform optimize --compress meshopt --texture-compress ktx2` și `KHR_materials_variants`.
- **Lumini**: fără `Environment preset` (descarcă HDR de pe CDN; vault interzice CDN pentru core).
  Lightformer-e procedurale + ContactShadows.
- Alternative evaluate: `<model-viewer>` (bun pentru viewer pasiv, slab pentru shadere/cameră custom),
  Spline/Unicorn Studio (fundaluri shader, nu configuratoare; licența free Unicorn interzice uz
  comercial — UNVERIFIED).

## 4. Motion

- GSAP 3.15 e gratuit integral (ScrollTrigger, SplitText) — gsap.com/pricing. Motion v12 (ex
  framer-motion) ~17 kB vs GSAP 23.5 kB (cifre de vendor). Lenis 1.3 respectă reduced-motion, dar
  două bucle rAF (Lenis + R3F) sunt interzise.
- Decizia WOB ART rămâne **scroll nativ** (`IMPORTANT_DECISIONS: native_scroll_instead_of_scroll_jacking`).
  Pentru storytelling folosim **CSS scroll-driven animations** (`animation-timeline: view()`; Chrome/Edge
  115+, Safari 26+, Firefox doar 160 → 87.8 % global, caniuse) gated cu `@supports` și
  `prefers-reduced-motion`. Zero JS, zero rAF, zero INP risk.
- View Transitions same-document 92.9 % suport; candidat pentru navigarea admin, nu pentru homepage.

## 5. Bugete performanță & a11y (vault + web, aplicate)

- Core Web Vitals p75: LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. **LCP = poster static `<Image priority>`,
  niciodată canvas-ul.**
- Un singur scene WebGL per pagină, oprit când iese din viewport (vault Master_Report:70); DPR ≤ 2;
  `frameloop="demand"`/`never` off-screen; fără alocări în rAF; dispose la unmount; texturi ≤ 2048;
  draw calls sub câteva sute.
- Reduced motion → poster static, fără auto-rotate, schimbările de stare rămân vizibile (overlay de
  culoare pe poster). Mobil (< 768 px) și dispozitive fără WebGL → poster.
- Canvas-ul e invizibil pentru AT: fiecare alegere există ca `<fieldset>` + `<input type=radio>` nativ
  în afara canvas-ului; canvas-ul primește `role="img"` + `aria-label` cu configurația curentă
  (a11y.docs.pmnd.rs; WCAG 2.3.3 C39/SCR40).
- Tranziții: hover 100–150 ms, UI 200–300 ms, intrare în viewport 300–500 ms (vault Motion_Design_Principles).
- Test la 390/768/1024/1440 (vault); Safari iOS slab acoperit în vault (`gaps.md`).

## 6. Conversie & SEO

- Estimator: acoperire → clasă vehicul → finisaj, etichetat „orientativ", predă către formular (există).
- Recenzii, portofoliu pe vehicul, before/after, booking/WhatsApp — elementele standard ale nișei;
  studii de conversie specifice nișei nu au fost găsite (UNVERIFIED).
- Schema: `AutomotiveBusiness` (sub `LocalBusiness`), `Service`, `AggregateRating` doar din recenzii
  reale din CMS; `FAQPage` rămâne util mașinilor, dar Google nu mai afișează rich results FAQ pentru
  site-uri comerciale din aug. 2023 (developers.google.com/search/blog/2023/08/howto-faq-changes).

## 7. Ce s-a construit pe baza acestui research (2026-10-10)

Vezi `tasks/todo.md` și `PROJECT_STATE.md`: configurator 3D procedural lazy cu fallback poster, proces
cu stage sticky + CSS scroll-driven, FAQ nativ `<details>`, JSON-LD din CMS, CTA WhatsApp condiționat
de telefon în CMS, editoare în Website Studio pentru Configurator și FAQ, schema CMS extinsă
backwards-compatible.

## 8. Următorii pași recomandați (ne-construiți)

1. Model GLB licențiat + `KHR_materials_variants`, pipeline gltf-transform, `PerformanceMonitor` din drei.
2. Vizualizator foto („încarcă poza mașinii") — necesită serviciu de segmentare; cost și date personale.
3. Măsurare reală CWV pe un deploy (Lighthouse/CrUX) înainte de a declara bugetele îndeplinite.
4. JSON-LD randat server-side (acum e client-side, Googlebot îl execută, dar SSR e mai robust).

# WOB ART — ce înseamnă un site „de ultimă generație” și cum ajungem acolo (cercetare 2026-10-10)

Cinci cercetări paralele, surse primare unde s-a putut (pagini Awwwards citite direct). Tot ce nu s-a putut confirma e marcat
UNVERIFIED în rapoartele originale; aici păstrez doar concluziile care se sprijină pe ele.

## 1. Verdictul

Site-urile premiate în 2025–2026 nu au „mai multe efecte”. Au **o singură idee forte, dusă consecvent prin tot site-ul**,
o paletă de 2–3 culori, conținut real (foto/video proprii) și o execuție impecabilă (rapid, accesibil, merge pe telefon).
- Lando Norris (Site of the Year 2025): verde-acid pe negru + forme care reacționează la cursor peste foto. Neonul nu e problema; folosirea lui e.
- Scout Motors (Developer Award, E-commerce of the Year): poveste de brand condusă de scroll, video full-bleed, o culoare caldă.
- Cartier W&W (Immersive Garden): „alcove” 3D separate pentru fiecare ceas + sunet ca strat narativ.
- Spyker (HM 2026): mașina povestită ca o zi din viața proprietarului, alb-negru strict, programare integrată.
- Oryzo (Lusion): un obiect banal prezentat cu macro-uri WebGL obsesive ale materialului.
- Bruno Simon (SOTM ian. 2026): portofoliul e un joc în care conduci o mașinuță (Three.js WebGPU).
Nicio firmă de wrap/PPF/detailing nu a câștigat vreodată un premiu Awwwards (doar un HM pentru o vopsitorie, 2024): **categoria e liberă**.

Ce juriul punctează: Design 40 %, Usability 30 %, Creativity 20 %, Content 10 %. Câștigătorii iau note mari la creativitate
și mici la usability/accesibilitate → un site frumos **și** rapid/accesibil câștigă puncte ușor.

## 2. De ce versiunile de până acum par „obosite”

Exact tiparele numite datate în 2026 de toate sursele: glassmorphism peste tot, glow neon decorativ, gradient
cyan/violet, grile bento cu carduri identice, fotografii stock/AI cu logo BMW/Audi, „fade-up la scroll” ca singură mișcare,
o singură pagină lungă cu toate secțiunile. Nu lipsesc efectele; lipsesc **ideea, fotografia reală și structura**.

## 3. Direcții de concept (alegem UNA ca idee centrală)

1. **Material Lab** — site-ul e un laborator de folii: lucios, satinat, mat, color-shift, PPF prezentate ca mostre reale. Un
   shader WebGL în care vizitatorul plimbă „lumina” peste un panou de caroserie: reflexii, orange-peel, marginea foliei. Comutator
   vopsea goală ↔ PPF. *Cel mai unic pentru nișă; se face cu Blender + R3F, fără foto de la client la început.*
2. **Garage Film** — o singură mișcare de cameră prin atelierul din București, condusă de scroll: mașina intră, decontaminare,
   tăiere, aplicare, pistol cu aer cald, predare. Video real + sunet ambiental opțional. Titlurile capitolelor sunt navigația.
   *Cel mai convingător emoțional; cere o filmare reală.*
3. **Colour Atlas** — index editorial al fiecărei culori aplicate, fotografiată pe mașini reale în lumina Bucureștiului; filtru pe
   finisaj/brand/model; alegi culoarea → o vezi pe silueta modelului tău → cerere de ofertă.
4. **Before/After Cinema** — fiecare lucrare ca un cadru de film, wipe split-screen controlat de cursor, cu citirea grosimii vopselei și orele de lucru.
5. **Atelier Journal** — revista unui atelier artizanal: tipografie serif puternică, portrete ale montatorilor, eseuri despre mașini, programare la final.

**Recomandare:** Material Lab ca idee centrală pe Home (unic, realizabil acum), Garage Film ca hero video imediat ce există
filmarea, iar Colour Atlas și Before/After Cinema ca pagini dedicate. Atelier Journal = secțiunea de ghiduri/blog.

## 4. Site complet, nu landing page (arhitectura)

Home · /servicii (Wrap, PPF transparent/mat/colorat, Detailing, Ceramic, Folie geamuri RAR, Dechromare — o pagină fiecare, cu
pachete, diagrame de acoperire, folii folosite, prețuri „de la”, garanție, durată, FAQ, studii de caz) · /finisaje (atlasul
de culori) · /portofoliu (studii de caz: brief, folie exactă, suprafață, zile în atelier, înainte/după, galerie, video) · /proces ·
/preturi + estimator (PDF pe email) · /studio (echipă, certificări, atelier, garanții scrise) · /ghiduri · /intrebari ·
/contact-programare (calendar + formular cu poze) · pagini legale · versiune /en.

Avantajul pe piață (5 concurenți din București analizați): **niciunul** nu publică studii de caz reale, garanții scrise,
programare online sau versiune în engleză. Ce convertește în nișă: prețuri „de la” vizibile, folie premium numită,
rating Google real, timp de răspuns rapid, locuri limitate pe lună, WhatsApp precompletat cu mașina și serviciul.

## 5. Back-office de ultimă generație

Stil Linear / Attio / Stripe: tastatură întâi (`Cmd+K`), editare în tabel, UI optimist, gri liniștit + un singur accent.
Ecrane: **tabla zilei** (coloane pe etape de atelier, drag & drop, timp în etapă) · **pipeline lead-uri** (nou → ofertat →
programat → în lucru → livrat/pierdut; lead fără răspuns se înroșește) · **fișa lucrării** (mașină, client, folie cu lot,
cronologie, poze înainte/după, checklist QC, certificat de garanție, factură) · **calendar pe boxe și montatori** ·
**clienți și vehicule** · **constructor de oferte** din catalogul de folii → PDF/link → acceptare = programare ·
**catalog folii** · **media** · **Website Studio** (draft → preview → publicare → istoric cu diff) · **analytics**.
Unelte: shadcn/ui + Tailwind v4, TanStack Table/Query, cmdk, Sonner, dnd-kit, Tremor pentru grafice, Geist pentru interfață.

Arhitectură recomandată: **Next.js 16 + Postgres (UE: Supabase Frankfurt sau VPS în RO) + Drizzle + Better Auth + Cloudflare R2
+ Resend + Inngest + Cal.com API v2**. Better Auth înlocuiește serviciul FastAPI. Migrare treptată de pe Mongo, pe zone
(întâi lead-urile), fără oprire. Variantă de buget: redesign + Better Auth pe Mongo acum, Postgres mai târziu.

## 6. Unelte (cine instalează ce)

Eu, fără admin: GSAP 3.13+ (gratuit integral, inclusiv SplitText/ScrollTrigger), Lenis, next-transition-router (tranziții între
pagini), Blender Cycles pentru randări foto și secvențe de cadre pentru scroll, ffmpeg (AV1/H.265/VP9 cu keyframe la fiecare cadru
pentru scrub), gltf-transform, Lighthouse CI, Playwright visual regression, axe-core, detect-gpu (fallback pe telefoane slabe).
Fonturi gratuite de calitate: Fontshare (Satoshi, General Sans, Clash Display, Cabinet Grotesk), Geist, Instrument Serif.

Tu (doar tu poți): KTX-Software (instalare admin, opțional) · licență font premium (opțional, ~30–300 $) · plan plătit Rive
doar dacă vrem animații vectoriale interactive.

## 7. Ce nu pot inventa (și nici n-ar trebui)

Fotografii și video reale ale lucrărilor (lista de cadre în raportul de unelte: dezvelire, macro-uri de montaj, picături pe PPF,
auto-vindecare, înainte/după din același unghi, 360°, portrete echipă) · branduri și coduri de folie + certificări · garanții
scrise · prețuri „de la” pe clase · date firmă (CUI, Reg. Com., adresă, program) · recenzii Google · acordul clienților pentru
poze. Randările 3D se marchează ca randări; rezultatele generate AI nu se prezintă niciodată drept lucrări reale (risc ANPC).

## 8. Legal RO/UE (de pus înainte de lansare)

Banner cookies cu „Refuz” la fel de ușor ca „Accept”, Consent Mode v2, politică de confidențialitate (formulare, poze, WhatsApp,
CRM, ANSPDCP), date firmă în footer (Legea 365/2002), pictograma ANPC SAL (verificat în Monitorul Oficial — ordinul 270/2026
raportat de presă, UNVERIFIED), accesibilitate (European Accessibility Act, din iunie 2025), plăcuțe și fețe blurate sau acord scris.

## 9. Plan propus

1. Alegem conceptul (recomandat: Material Lab + pagini Colour Atlas și Before/After Cinema).
2. Machetă în Penpot pentru Home + o pagină de serviciu + un studiu de caz, cu randări Blender reale → aprobare.
3. Front-end multi-pagină pe macheta aprobată (Next.js App Router, tranziții între pagini, GSAP + Lenis, R3F pentru Material Lab).
4. Back-office nou (tabla zilei, pipeline, fișa lucrării, oferte) pe API-urile actuale; apoi Better Auth și Postgres.
5. Ședință foto/video reală → Garage Film și portofoliul cu studii de caz.
6. Lighthouse CI + Playwright + axe în CI; versiunea /en; lansare.

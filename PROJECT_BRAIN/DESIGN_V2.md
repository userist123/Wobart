# WOB ART — Design v2 (2026-10-10) · "Holographic studio"

Source of truth: `design_guidelines.json` (owner's brief) + research in `PROJECT_BRAIN/RESEARCH/2026-10-10_next_gen_research.md`.
The v1 look (Bebas Neue, neon yellow, editorial) is retired. Every section is restyled against the rules below.

## Tokens (app/globals.css `:root`)
- Colours: `--wob-bg #050505`, `--wob-carbon #0F0F13`, `--wob-glass rgba(15,15,19,.55)`, `--wob-line rgba(255,255,255,.10)`,
  `--wob-line-soft rgba(255,255,255,.06)`, `--wob-accent #00F0FF` (primary, use sparingly: one accent element per view),
  `--wob-accent-2 #BD00FF` (only inside gradients/glows, never for text), `--wob-success #00FFA3`, `--wob-warning #FFB000`,
  `--wob-danger #FF003C`, text `#FFFFFF` / `--wob-muted #A1A1AA` / `--wob-dim #71717A`.
- Radii: panels `--r-panel 20px`, controls `--r-ctrl 8px`, pills 999px. Never square corners on cards or buttons.
- Fonts: display `--font-display` = Unbounded (600/700/900), body `--font-sans` = Outfit (300-600), labels `--font-label` = Outfit
  uppercase, mono `--font-mono` = JetBrains Mono. Legacy aliases (`--font-bebas-neue`, `--font-barlow-condensed`, `--font-dm-sans`)
  resolve to the new fonts, but every section must retune its sizes (see Type).
- Max width 1280px content (`--wob-max`), 1440px for full-bleed stages. Gutters 24px mobile / 48px desktop. 8pt spacing scale.

## Type (Unbounded is wide: sizes drop by ~35% vs Bebas)
- Hero H1: clamp(40px, 6vw, 88px), weight 700, line-height 1.0, letter-spacing -.035em. Max 2 lines on desktop, 3 on phone.
- Section title: clamp(32px, 4.2vw, 64px), 700, 1.04, -.03em. Accent word = gradient text (cyan→white), not flat yellow.
- Card title: 20-28px, 600, 1.15. Body: Outfit 16-18px / 1.65, colour `--wob-muted`. Labels: Outfit 11-12px, 600, tracking .22em,
  uppercase, colour rgba(255,255,255,.55). Mono micro-labels: 10-11px, tracking .12em.
- Eyebrow: label style + 24px cyan line before it. Numbers (01, 02…) in Unbounded 900 at 40-72px, colour rgba(255,255,255,.08) as background art.

## Surfaces & effects
- `.glass` = glass panel: blur 24px, 1px white/10 border, radius 20px, shadow 0 8px 32px rgba(0,0,0,.4); hover: border cyan/50 +
  0 0 15px rgba(0,240,255,.2). `.solid` = #0F0F13 + 1px white/5 (inputs, deep areas).
- Holo background: fixed layer `.holo-bg` (two drifting radial gradients cyan/purple at low opacity, blur 120px) sits behind
  everything; sections are transparent (`.section-obsidian`) or carbon at 55% (`.section-carbon`) so the glow shows through.
- Images: always inside a radius-20 clip with a bottom gradient (rgba(5,5,5,0)→rgba(5,5,5,.85)) and a 1px white/10 border.
- Buttons (`MagneticButton`): primary = cyan fill, #050505 text, radius 8px, glow 0 0 24px rgba(0,240,255,.25), hover white fill;
  ghost = transparent, 1px white/15, hover cyan border + glow. Height 48px desktop / 44px mobile, Outfit 600 12px tracking .16em.
- Chips/pills: 999px radius, mono 10px, 1px white/10, active = cyan 12% fill + cyan text.

## Motion
- Reveal: opacity 0 → 1, y 30 → 0, blur 10px → 0, 600ms ease-out, staggered 80ms per sibling (via `--reveal-delay`); `useReveal` + `.reveal`.
- Hover: 150ms; card lift translateY(-4px) + glow. No scroll-jacking; CSS scroll-driven effects only behind `@supports`.
- Reduced motion: everything static, state changes still visible.

## Layout principle ("Tetris grid")
12-column grid, mix spans 12 / 8 / 4 / 6, break symmetry on marketing sections (hero copy 7 cols + stat strip 5 cols; services as
bento: one 8-col feature card + 4-col cards; portfolio masonry with one 8-col hero tile). Dashboards stay dense (not in scope).

## Section-by-section intent
Navbar: floating glass pill (radius 999px) with blur, 12px above the top at ≥ 900px; logo wordmark in Unbounded 700 18px;
links Outfit 12px tracking .16em; primary CTA pill. Hero: full-bleed image with gradient + holo glow, H1 + one-line sub,
two CTAs, a stat strip (3 glass chips) bottom-right, scroll cue. Trust bar: glass strip with mono items separated by dots.
Statement: 2-col, big quote in Unbounded 600 32-40px, cyan line. Services: bento glass cards with image on the feature card,
icon chips, hover glow, roving tabs kept. Configurator: stage keeps the 3D; frame radius 20 + glass controls panel.
Before/after: glass frame, slider handle cyan. Portfolio: masonry tiles radius 20, caption on glass pill, hover zoom 1.04.
Process: sticky stage stays; rows become glass cards with big ghost numbers. Estimator: calculator glass panel, result in
Unbounded 48px with cyan gradient, range as a cyan progress bar. Reviews: glass cards, stars cyan, carousel dots. FAQ: glass
accordion. Quote form: solid_tech inputs, cyan glowing bottom border on focus, choice chips. CTA: full-bleed holo glow panel.
Footer: 4-col grid, mono legal line, model credit stays. WhatsApp: cyan-ringed glass button (keep #25D366 icon colour).

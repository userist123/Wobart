'use client'

/**
 * Scroll story hero: a tall track with a sticky viewport. A canvas scrubs the pre-rendered Blender frames by
 * scroll progress (read from a ref); DOM chapters (real, crawlable text) fade in and out on top. Native scroll, no hijacking.
 * Reduced motion or no WebGL: chapters render as a normal stacked section over a static glow.
 */
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from '@/components/ui/MagneticButton'

import { FrameScrub } from '@/components/canvas/FrameScrub'

/** Pre-rendered Blender story (scripts/blender/render_scrub.py): 151 frames, 30 per chapter. */
const FRAME_COUNT = 151
const SIDE = [0, 1, -1, 1, -1, 0] // must match render_scrub.py: +1 = text left, car framed right
const SHIFT = 0.19
const smooth = (x: number) => { const t = Math.min(1, Math.max(0, x)); return t * t * (3 - 2 * t) }
/** Where the car sits horizontally in the frame at progress p, so phone crops can follow it. */
const carFocus = (p: number) => {
  const m = Math.min(4.9999, Math.max(0, p * 5))
  const i = Math.floor(m)
  const k = smooth(m - i)
  return 0.5 + (SIDE[i] * (1 - k) + SIDE[i + 1] * k) * SHIFT
}
/** 1920 px frames for large/HiDPI screens, 1280 px otherwise. */
const frameSrc = (i: number) => {
  const dir = window.innerWidth * Math.min(window.devicePixelRatio || 1, 2) > 1400 ? 1920 : 1280
  return `/story/${dir}/f${String(i + 1).padStart(4, '0')}.webp`
}

type Chapter = { eyebrow: string; title: string; accent?: string; body?: string; hud?: string[]; cta?: boolean; align: 'center' | 'left' | 'right' }

const CHAPTERS: Chapter[] = [
  { eyebrow: 'WOB ART — București', title: 'Suprafața,', accent: 'reinventată.', body: 'Atelier de wrap, PPF și detailing. Derulează ca să vezi cum se construiește o mașină nouă, strat cu strat.', align: 'center', cta: true },
  { eyebrow: '01 — Scanare', title: 'Fiecare proiect începe', accent: 'cu mașina ta.', body: 'Evaluăm caroseria, vopseaua și felul în care folosești mașina înainte să alegem materialul.', hud: ['CAROSERIE', 'VOPSEA', 'UTILIZARE'], align: 'left' },
  { eyebrow: '02 — Straturi', title: 'Protecția e', accent: 'o arhitectură.', body: 'Vopseaua originală rămâne dedesubt. Peste ea: folie de culoare sau PPF transparent, apoi tratament ceramic.', hud: ['STRAT 03 · CERAMIC', 'STRAT 02 · FOLIE / PPF', 'STRAT 01 · VOPSEA'], align: 'right' },
  { eyebrow: '03 — Material', title: 'Lucios. Satinat.', accent: 'Mat. Color-shift.', body: 'Alegi finisajul pe mostre reale, în lumina atelierului, nu pe un ecran.', align: 'left' },
  { eyebrow: '04 — Montaj', title: 'Aceeași mașină.', accent: 'O nouă identitate.', body: 'Pregătire, montaj cu margini curate și control de calitate înainte de predare.', align: 'right' },
  { eyebrow: '05 — Următorul pas', title: 'Un univers de finisaje,', accent: 'la un mesaj distanță.', body: 'Spune-ne mașina și ce vrei să schimbi. Primești direcția și oferta după evaluare.', align: 'center', cta: true },
]

const REDUCED = '(prefers-reduced-motion: reduce)'
const subscribe = (cb: () => void) => { const m = window.matchMedia(REDUCED); m.addEventListener('change', cb); return () => m.removeEventListener('change', cb) }
const canAnimate = () => {
  if (window.matchMedia(REDUCED).matches) return false
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false }
}

export function ParticleHero() {
  const animated = useSyncExternalStore(subscribe, canAnimate, () => false)
  const trackRef = useRef<HTMLElement>(null)
  const progress = useRef(0)
  const [chapter, setChapter] = useState(0)

  useEffect(() => {
    if (!animated || !trackRef.current) return
    gsap.registerPlugin(ScrollTrigger)
    // GSAP ScrollTrigger with scrub: the particle morph follows the (Lenis-smoothed) scroll position exactly
    const st = ScrollTrigger.create({
      trigger: trackRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progress.current = self.progress
        const c = Math.min(CHAPTERS.length - 1, Math.round(self.progress * (CHAPTERS.length - 1)))
        setChapter((prev) => (prev === c ? prev : c))
      },
    })
    return () => { st.kill() }
  }, [animated])

  if (!animated) {
    return (
      <section id="hero" className="ph-static">
        {CHAPTERS.map((c, i) => <ChapterBlock key={i} c={c} active index={i} />)}
      </section>
    )
  }

  return (
    <section id="hero" ref={trackRef} className="ph-track" style={{ height: `${CHAPTERS.length * 115}vh` }}>
      <div className="ph-sticky">
        <div className="ph-canvas"><FrameScrub progress={progress} src={frameSrc} count={FRAME_COUNT} focusX={carFocus} /></div>
        <div className="ph-vignette" aria-hidden="true" />
        {CHAPTERS.map((c, i) => <ChapterBlock key={i} c={c} active={i === chapter} index={i} />)}
        <div className="ph-rail" aria-hidden="true">
          {CHAPTERS.map((_, i) => <span key={i} className={i === chapter ? 'is-on' : ''} />)}
        </div>
        <div className="ph-hint" aria-hidden="true" data-hidden={chapter > 0}>DERULEAZĂ</div>
      </div>
    </section>
  )
}

function ChapterBlock({ c, active, index }: { c: Chapter; active: boolean; index: number }) {
  const Heading = index === 0 ? 'h1' : 'h2'
  return (
    <div className={`ph-chapter ph-${c.align}${active ? ' is-active' : ''}`} aria-hidden={!active}>
      <p className="ph-eyebrow">{c.eyebrow}</p>
      <Heading className="ph-title">{c.title}{c.accent ? <><br /><span>{c.accent}</span></> : null}</Heading>
      {c.body ? <p className="ph-body">{c.body}</p> : null}
      {c.hud ? <ul className="ph-hud">{c.hud.map((h) => <li key={h}>{h}</li>)}</ul> : null}
      {c.cta ? (
        <div className="ph-cta">
          <MagneticButton href="#quote" size="lg" tabIndex={active ? 0 : -1}>Solicită ofertă</MagneticButton>
          <MagneticButton href="#portfolio" variant="ghost" size="lg" tabIndex={active ? 0 : -1}>Vezi lucrări</MagneticButton>
        </div>
      ) : null}
    </div>
  )
}

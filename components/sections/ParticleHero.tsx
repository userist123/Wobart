'use client'

/**
 * Scroll story hero: a 700vh track with a sticky viewport. The particle canvas reads scroll progress
 * from a ref; DOM chapters (real, crawlable text) fade in and out on top. Native scroll, no hijacking.
 * Reduced motion or no WebGL: chapters render as a normal stacked section over a static glow.
 */
import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MagneticButton } from '@/components/ui/MagneticButton'

const ParticleStory = dynamic(() => import('@/components/canvas/ParticleStory'), { ssr: false, loading: () => null })

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
  const pointer = useRef({ x: 0, y: 0 })
  const [chapter, setChapter] = useState(0)
  const [size] = useState(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 208 : 352))

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
    const onPointer = (e: PointerEvent) => { pointer.current = { x: (e.clientX / window.innerWidth - 0.5) * 2, y: (e.clientY / window.innerHeight - 0.5) * 2 } }
    window.addEventListener('pointermove', onPointer, { passive: true })
    return () => { st.kill(); window.removeEventListener('pointermove', onPointer) }
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
        <div className="ph-canvas"><ParticleStory progress={progress} pointer={pointer} size={size} /></div>
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

'use client'

import { ArrowRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { BeforeAfter } from '@/components/ui/BeforeAfter'

const SLIDE_URI = [
  { before: '/images/ba-before-1.jpg', after: '/images/ba-after-1.jpg', label: 'BMW Seria 5 — Negru Mat' },
  { before: '/images/ba-before-2.jpg', after: '/images/ba-after-2.jpg', label: 'Audi A4 — Satin Midnight Blue' },
  { before: '/images/ba-before-3.jpg', after: '/images/ba-after-3.jpg', label: 'Porsche Cayenne — Gloss Auriu' },
]

export function BeforeAfterSection() {
  const headRef = useReveal<HTMLDivElement>()
  return (
    <section id="transformation" className="section section-obsidian">
      <div className="section-shell">
        <div ref={headRef} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">03 / TRANSFORMARE</p><h2 className="section-title">ÎNAINTE.<br /><span>DUPĂ.</span></h2></div>
          <p className="body-copy heading-note">Trage cursorul prin imagine. Aici se vede diferența dintre o simplă schimbare și o transformare controlată.</p>
        </div>
        <div className="before-after-grid">
          {SLIDE_URI.map(item => <BeforeAfter key={item.label} before={item.before} after={item.after} label={item.label} />)}
        </div>
        <div className="section-cta-row"><span className="mono-note">DRAG / TOUCH / KEYBOARD</span><a className="text-link" href="#portfolio">Vezi proiectele <ArrowRight size={14} /></a></div>
      </div>
    </section>
  )
}

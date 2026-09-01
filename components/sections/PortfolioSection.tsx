'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, X } from 'lucide-react'
import { PORTFOLIO } from '@/lib/constants'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'

export function PortfolioSection() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const headRef = useReveal<HTMLDivElement>()
  const item = expanded !== null ? PORTFOLIO[expanded] : null

  return (
    <section id="portfolio" className="section section-obsidian">
      <div className="section-shell">
        <div ref={headRef} className="reveal section-heading section-heading-split">
          <div>
            <p className="eyebrow">04 / PORTOFOLIU</p>
            <h2 className="section-title">MAȘINI CU<br /><span>PREZENȚĂ.</span></h2>
          </div>
          <p className="body-copy heading-note">Nu punem doar fotografii într-un grid. Fiecare proiect trebuie să transmită materialul, finisajul și atitudinea mașinii.</p>
        </div>

        <div className="portfolio-grid">
          {PORTFOLIO.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setExpanded(index)}
              className={`portfolio-card portfolio-card-${index + 1}`}
              data-cursor="VIEW"
            >
              <Image src={item.img} alt={`${item.make} ${item.model}`} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              <div className="portfolio-overlay" />
              <div className="portfolio-meta">
                <span>{item.badge}</span>
                <strong>{item.make} {item.model}</strong>
                <small>{item.wrap}</small>
              </div>
              <ArrowUpRight className="portfolio-icon" size={18} aria-hidden="true" />
            </button>
          ))}
        </div>

        <div className="section-cta-row">
          <span className="mono-note">SELECTED WORKS / 2025—2026</span>
          <a href="#quote" className="text-link">Vreau ceva similar <ArrowUpRight size={14} /></a>
        </div>
      </div>

      {item && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${item.make} ${item.model}`} onClick={() => setExpanded(null)}>
          <div className="portfolio-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setExpanded(null)} aria-label="Închide"><X size={20} /></button>
            <div className="portfolio-modal-media"><Image src={item.img} alt={`${item.make} ${item.model}`} fill sizes="90vw" className="object-cover" /></div>
            <div className="portfolio-modal-copy">
              <span className="eyebrow">{item.badge}</span>
              <h3>{item.make} {item.model}</h3>
              <div className="portfolio-data-grid">
                <div><span>Finisaj</span><strong>{item.wrap}</strong></div>
                <div><span>An</span><strong>{item.year}</strong></div>
                <div><span>Material</span><strong>Avery Dennison</strong></div>
              </div>
              <MagneticButton variant="accent" href="#quote" onClick={() => setExpanded(null)}>Solicită un proiect similar</MagneticButton>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

'use client'

import { ArrowDownRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'

export function ProcessSection() {
  const ref = useReveal<HTMLDivElement>()
  const { content } = useSiteContent()
  const intro = content.home.processIntro
  const steps = content.home.processSteps.length ? content.home.processSteps : [
    'Discutăm mașina, utilizarea și direcția vizuală înainte de montaj.',
    'Primești o propunere clară după evaluarea vehiculului.',
    'Pregătire, montaj și control de calitate înainte de predare.',
  ]

  return (
    <section id="process" className="section section-obsidian">
      <div className="section-shell">
        <div ref={ref} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">{intro.eyebrow || '05 / PROCES'}</p><h2 className="section-title">{intro.title || 'TREI PAȘI.\nZERO GRABA.'}</h2></div>
          <p className="body-copy heading-note">{intro.body || 'Un rezultat premium nu se grăbește. Fiecare etapă reduce riscul și crește precizia.'}</p>
        </div>
        <div className="process-list">
          {steps.slice(0, 6).map((body, index) => (
            <article key={`${index}-${body}`} className="process-row">
              <span className="process-number">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{['DESCOPERIRE', 'OFERTĂ', 'TRANSFORMARE', 'CONTROL', 'PREDARE', 'FOLLOW-UP'][index] ?? `ETAPA ${index + 1}`}</h3><p className="body-copy">{body}</p></div>
              <ArrowDownRight size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

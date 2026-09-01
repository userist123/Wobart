'use client'

import { ArrowDownRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

const PASI = [
  { num: '01', title: 'DESCOPERIRE', body: 'Discutăm mașina, utilizarea și direcția vizuală. Alegem materialul potrivit înainte de orice montaj.' },
  { num: '02', title: 'OFERTĂ', body: 'Primești o propunere clară după evaluarea vehiculului, cu finisaj, acoperire și durată estimate.' },
  { num: '03', title: 'TRANSFORMARE', body: 'Pregătire, demontare unde este necesar, montaj și control de calitate. Predarea este parte din experiență.' },
]

export function ProcessSection() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section id="process" className="section section-obsidian">
      <div className="section-shell">
        <div ref={ref} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">05 / PROCES</p><h2 className="section-title">TREI PAȘI.<br /><span>ZERO GRABA.</span></h2></div>
          <p className="body-copy heading-note">Un rezultat premium nu se grăbește. Fiecare etapă reduce riscul și crește precizia.</p>
        </div>
        <div className="process-list">
          {PASI.map(step => (
            <article key={step.num} className="process-row">
              <span className="process-number">{step.num}</span>
              <div><h3>{step.title}</h3><p className="body-copy">{step.body}</p></div>
              <ArrowDownRight size={18} aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

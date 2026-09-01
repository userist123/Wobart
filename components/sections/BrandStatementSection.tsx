'use client'

import { ArrowUpRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'

export function BrandStatementSection() {
  const ref = useReveal<HTMLDivElement>()
  const { content } = useSiteContent()
  const statement = content.home.statement

  return (
    <section className="brand-statement-section">
      <div className="section-shell">
        <div ref={ref} className="reveal brand-statement-grid">
          <div className="brand-statement-aside">
            <p className="eyebrow">{statement.eyebrow || '01 / FILOSOFIE'}</p>
            <p className="mono-note">{content.global.city || 'București'} · Romania</p>
            <span className="brand-statement-rule" aria-hidden="true" />
            <span className="brand-statement-coordinate">44°25′N / 26°06′E</span>
          </div>
          <div className="brand-statement-copy">
            <p className="brand-statement-lede">{statement.title || 'Nu schimbăm doar culoarea.'}</p>
            <p className="body-copy">{statement.body || 'Fiecare proiect pornește de la proporțiile mașinii, materialul potrivit și un finisaj care trebuie să arate impecabil din orice unghi.'}</p>
            <a className="brand-statement-link" href="#services">Descoperă serviciile <ArrowUpRight size={15} /></a>
          </div>
          <div className="brand-statement-mark" aria-hidden="true">WØB</div>
        </div>
      </div>
    </section>
  )
}

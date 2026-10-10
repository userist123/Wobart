'use client'

import { ArrowUpRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'

export function BrandStatementSection() {
  const leftRef = useReveal<HTMLDivElement>()
  const rightRef = useReveal<HTMLDivElement>({ delay: 80 })
  const { content } = useSiteContent()
  const statement = content.home.statement
  const title = statement.title || 'Nu schimbăm doar culoarea.'
  const words = title.split(/\s+/).filter(Boolean)
  const keyCount = words.length >= 4 ? 2 : 1
  const lead = words.slice(0, words.length - keyCount).join(' ')
  const key = words.slice(words.length - keyCount).join(' ')

  return (
    <section className="v2-statement">
      <div className="section-shell">
        <div className="v2-statement-grid">
          <div ref={leftRef} className="reveal v2-statement-left">
            <p className="eyebrow">{statement.eyebrow || '01 / FILOSOFIE'}</p>
            <p className="v2-statement-lede">{lead}{lead ? ' ' : ''}<span>{key}</span></p>
            <p className="mono-note">{content.global.city || 'București'} · Romania</p>
          </div>
          <div ref={rightRef} className="reveal v2-statement-right">
            <p className="body-copy">{statement.body || 'Fiecare proiect pornește de la proporțiile mașinii, materialul potrivit și un finisaj care trebuie să arate impecabil din orice unghi.'}</p>
            <span className="v2-statement-line" aria-hidden="true" />
            <a className="v2-statement-link" href="#services">Descoperă serviciile <ArrowUpRight size={15} /></a>
          </div>
        </div>
      </div>
    </section>
  )
}

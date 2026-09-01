'use client'

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
          <div>
            <p className="eyebrow">{statement.eyebrow || '01 / FILOSOFIE'}</p>
            <p className="mono-note">{content.global.city || 'București'} · Romania</p>
          </div>
          <div className="brand-statement-copy">
            <p className="brand-statement-lede">{statement.title || 'Nu schimbăm doar culoarea.'}</p>
            <p className="body-copy max-w-2xl">{statement.body || 'Fiecare proiect pornește de la proporțiile mașinii, materialul potrivit și un finisaj care trebuie să arate impecabil din orice unghi.'}</p>
          </div>
          <div className="brand-statement-mark" aria-hidden="true">WØB</div>
        </div>
      </div>
    </section>
  )
}

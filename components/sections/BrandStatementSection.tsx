'use client'

import { useReveal } from '@/hooks/useReveal'

export function BrandStatementSection() {
  const ref = useReveal<HTMLDivElement>()

  return (
    <section className="brand-statement-section">
      <div className="section-shell">
        <div ref={ref} className="reveal brand-statement-grid">
          <div>
            <p className="eyebrow">01 / FILOSOFIE</p>
            <p className="mono-note">București · Romania</p>
          </div>
          <div className="brand-statement-copy">
            <p className="brand-statement-lede">
              Nu schimbăm doar culoarea. <span>schimbăm felul în care arată mașina când intră în lumină.</span>
            </p>
            <p className="body-copy max-w-2xl">
              Fiecare proiect pornește de la proporțiile mașinii, materialul potrivit și un finisaj care trebuie să arate impecabil din orice unghi.
            </p>
          </div>
          <div className="brand-statement-mark" aria-hidden="true">WØB</div>
        </div>
      </div>
    </section>
  )
}

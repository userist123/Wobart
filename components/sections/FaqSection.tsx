'use client'

import type { ReactNode } from 'react'
import { Plus } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'
import { defaultSiteContent } from '@/lib/site-content'

function RevealDetails({ children, delay }: { children: ReactNode; delay: number }) {
  const ref = useReveal<HTMLDivElement>({ delay })
  return <div ref={ref} className="reveal faq-reveal">{children}</div>
}

export function FaqSection() {
  const ref = useReveal<HTMLDivElement>()
  const { content } = useSiteContent()
  const faq = content.home.faq ?? defaultSiteContent.home.faq
  const items = (faq?.items ?? []).filter((item) => item.active && item.question.trim()).sort((a, b) => a.sortOrder - b.sortOrder)

  if (items.length === 0) return null

  const lines = (faq?.title || 'ÎNTREBĂRI.\nRĂSPUNSURI CLARE.').split('\n')
  const lastLine = lines.length - 1

  return (
    <section id="faq" className="section section-obsidian faq-section">
      <div className="section-shell">
        <div ref={ref} className="reveal section-heading section-heading-split">
          <div>
            <p className="eyebrow">{faq?.eyebrow || '08 / ÎNTREBĂRI'}</p>
            <h2 className="section-title">
              {lines.map((line, i) => (
                <span key={i} className="faq-title-line">
                  {i === lastLine && lines.length > 1 ? <span>{line}</span> : line}
                  {i < lastLine ? <br /> : null}
                </span>
              ))}
            </h2>
          </div>
          <p className="body-copy heading-note">{faq?.body || 'Ce întreabă cel mai des clienții înainte de a programa o lucrare.'}</p>
        </div>
        <div className="faq-list">
          {items.map((item, index) => (
            <RevealDetails key={`${index}-${item.question}`} delay={Math.min(index, 6) * 80}>
            <details className="faq-item glass" name="faq">
              <summary>
                <span className="faq-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="faq-question">{item.question}</span>
                <span className="faq-icon-wrap glass" aria-hidden="true"><Plus className="faq-icon" size={16} /></span>
              </summary>
              <div className="faq-answer"><p className="body-copy">{item.answer}</p></div>
            </details>
            </RevealDetails>
          ))}
        </div>
        <div className="section-cta-row">
          <MagneticButton href="#quote" variant="ghost">Altă întrebare? Scrie-ne</MagneticButton>
        </div>
      </div>
    </section>
  )
}

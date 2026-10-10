'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowDownRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'

const STEP_TITLES = ['DESCOPERIRE', 'OFERTĂ', 'TRANSFORMARE', 'CONTROL', 'PREDARE', 'FOLLOW-UP']

function ProcessItem({ index, children }: { index: number; children: ReactNode }) {
  const ref = useReveal<HTMLDivElement>({ delay: 80 * (index % 6) })
  return <div ref={ref} className="reveal process-item">{children}</div>
}

export function ProcessSection() {
  const ref = useReveal<HTMLDivElement>()
  const stageRef = useReveal<HTMLDivElement>({ delay: 80 })
  const { content } = useSiteContent()
  const listRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const intro = content.home.processIntro
  const steps = content.home.processSteps.length ? content.home.processSteps : [
    'Discutăm mașina, utilizarea și direcția vizuală înainte de montaj.',
    'Primești o propunere clară după evaluarea vehiculului.',
    'Pregătire, montaj și control de calitate înainte de predare.',
  ]

  const visible = steps.slice(0, 6)
  const visibleKey = visible.join('\u0000')

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const rows = Array.from(list.querySelectorAll<HTMLElement>('.process-row'))
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(rows.indexOf(entry.target as HTMLElement))
        }
      },
      { threshold: 0.5, rootMargin: '-35% 0px -35% 0px' },
    )
    rows.forEach((row) => observer.observe(row))
    return () => observer.disconnect()
  }, [visibleKey])

  const activeIndex = Math.min(active, visible.length - 1)
  const activeNumber = String(activeIndex + 1).padStart(2, '0')

  return (
    <section id="process" className="section section-obsidian">
      <div className="section-shell">
        <div ref={ref} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">{intro.eyebrow || '05 / PROCES'}</p><h2 className="section-title">{intro.title || 'TREI PAȘI.\nZERO GRABA.'}</h2></div>
          <p className="body-copy heading-note">{intro.body || 'Un rezultat premium nu se grăbește. Fiecare etapă reduce riscul și crește precizia.'}</p>
        </div>
        <div className="process-layout">
          <div ref={stageRef} className="reveal process-stage" aria-hidden="true">
            <div className="process-stage-number">
              <span className="process-stage-ghost">{activeNumber}</span>
              <span className="process-stage-current">{activeNumber}</span>
            </div>
            <div className="process-rail"><span className="process-rail-fill" /></div>
            <p className="process-stage-title">{STEP_TITLES[activeIndex] ?? `ETAPA ${activeIndex + 1}`}</p>
          </div>
          <div ref={listRef} className="process-list">
          {visible.map((body, index) => (
            <ProcessItem key={`${index}-${body}`} index={index}>
            <article className={`process-row glass${index === activeIndex ? ' is-active' : ''}`}>
              <span className="process-number">{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{STEP_TITLES[index] ?? `ETAPA ${index + 1}`}</h3><p className="body-copy">{body}</p></div>
              <ArrowDownRight size={18} aria-hidden="true" />
            </article>
            </ProcessItem>
          ))}
          </div>
        </div>
      </div>
    </section>
  )
}

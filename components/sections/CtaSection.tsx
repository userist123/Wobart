'use client'

import { ArrowUpRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useSiteContent } from '@/hooks/useSiteContent'

export function CtaSection() {
  const { content } = useSiteContent()
  const cta = content?.home.cta
  const panelRef = useReveal<HTMLDivElement>()
  const textRef = useReveal<HTMLDivElement>({ delay: 80 })
  const actionsRef = useReveal<HTMLDivElement>({ delay: 160 })

  return (
    <section className="closing-cta closing-cta-premium section-obsidian">
      <div className="section-shell">
        <div ref={panelRef} className="reveal closing-panel glass">
          <div className="closing-glow" aria-hidden="true" />
          <div ref={textRef} className="reveal closing-cta-content">
            <p className="eyebrow">{cta?.eyebrow || 'WOB ART / NEXT PROJECT'}</p>
            <h2>{cta?.title ? cta.title.split('\n').map((line, i, all) => <span key={i} className={i === all.length - 1 && all.length > 1 ? 'block closing-accent' : 'block'}>{line}</span>) : <>MAȘINA TA<br /><span>URMEAZĂ.</span></>}</h2>
            <p className="body-copy">{cta?.body || 'Spune-ne ce ai în minte. Construim direcția, apoi o executăm.'}</p>
          </div>
          <div ref={actionsRef} className="reveal closing-actions">
            <MagneticButton variant="accent" size="lg" href={cta?.buttonHref || '#quote'}>{cta?.buttonLabel || 'Solicită ofertă'}</MagneticButton>
            <MagneticButton variant="ghost" size="lg" href="#portfolio">Vezi lucrările <ArrowUpRight size={14} /></MagneticButton>
          </div>
        </div>
      </div>
    </section>
  )
}

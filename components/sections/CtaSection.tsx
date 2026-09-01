'use client'

import { ArrowUpRight } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useSiteContent } from '@/hooks/useSiteContent'

export function CtaSection() {
  const { content } = useSiteContent()
  const cta = content?.home.cta

  return (
    <section className="closing-cta">
      <div className="section-shell closing-cta-inner">
        <p className="eyebrow">{cta?.eyebrow || 'WOB ART / NEXT PROJECT'}</p>
        <h2>{cta?.title ? cta.title.split('\n').map((line, i) => <span key={i} className={i > 0 ? 'block' : 'block'}>{line}</span>) : <>MAȘINA TA<br /><span>URMEAZĂ.</span></>}</h2>
        <p className="body-copy">{cta?.body || 'Spune-ne ce ai în minte. Construim direcția, apoi o executăm.'}</p>
        <div className="closing-actions">
          <MagneticButton variant="accent" size="lg" href={cta?.buttonHref || '#quote'}>{cta?.buttonLabel || 'Solicită ofertă'}</MagneticButton>
          <a href="#portfolio" className="text-link">Vezi lucrările <ArrowUpRight size={14} /></a>
        </div>
      </div>
      <div className="closing-mark" aria-hidden="true">WOB</div>
    </section>
  )
}

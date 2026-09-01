import { ArrowUpRight } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'

export function CtaSection() {
  return (
    <section className="closing-cta">
      <div className="section-shell closing-cta-inner">
        <p className="eyebrow">WOB ART / NEXT PROJECT</p>
        <h2>MAȘINA TA<br /><span>URMEAZĂ.</span></h2>
        <p className="body-copy">Spune-ne ce ai în minte. Construim direcția, apoi o executăm.</p>
        <div className="closing-actions">
          <MagneticButton variant="accent" size="lg" href="#quote">Solicită ofertă</MagneticButton>
          <a href="#portfolio" className="text-link">Vezi lucrările <ArrowUpRight size={14} /></a>
        </div>
      </div>
      <div className="closing-mark" aria-hidden="true">WOB</div>
    </section>
  )
}

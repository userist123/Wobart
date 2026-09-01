'use client'

import Image from 'next/image'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'

export function HeroSection() {
  const kickerRef = useReveal<HTMLParagraphElement>()
  const titleRef = useReveal<HTMLHeadingElement>({ delay: 90 })
  const copyRef = useReveal<HTMLDivElement>({ delay: 170 })
  const metaRef = useReveal<HTMLDivElement>({ delay: 260 })

  return (
    <section className="hero-shell">
      <div className="hero-media" aria-hidden="true">
        <Image
          src="/images/hero-car.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover hero-image"
        />
        <div className="hero-vignette" />
        <div className="hero-scanline" />
      </div>

      <div className="section-shell hero-inner">
        <div className="hero-copy">
          <p ref={kickerRef} className="reveal eyebrow hero-kicker">
            WOB ART / ATELIER DE CAR WRAPPING
          </p>
          <h1 ref={titleRef} className="reveal hero-title">
            MAȘINA TA.<br /><span>REINVENTATĂ.</span>
          </h1>
          <div ref={copyRef} className="reveal hero-copy-row">
            <p className="body-copy hero-description">
              Wrap premium, PPF și finisaje care schimbă complet prezența unei mașini — fără compromisuri la detalii.
            </p>
            <div className="hero-actions">
              <MagneticButton variant="accent" size="lg" href="#quote">Solicită ofertă</MagneticButton>
              <a className="text-link" href="#portfolio">
                Vezi transformările <ArrowUpRight size={14} />
              </a>
            </div>
          </div>
        </div>

        <div ref={metaRef} className="reveal hero-meta">
          <div className="hero-meta-block">
            <span>Locație</span>
            <strong>București</strong>
          </div>
          <div className="hero-meta-block">
            <span>Specializare</span>
            <strong>Wrap / PPF / Detailing</strong>
          </div>
          <div className="hero-meta-block hero-meta-last">
            <span>Scroll pentru</span>
            <a href="#services">servicii <ArrowDownRight size={13} /></a>
          </div>
        </div>
      </div>

      <div className="hero-index" aria-hidden="true">01</div>
      <div className="hero-side-label" aria-hidden="true">PRECISION / MATERIAL / FINISH</div>
    </section>
  )
}

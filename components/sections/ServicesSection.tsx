'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Check } from 'lucide-react'
import { SERVICES } from '@/lib/constants'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'

export function ServicesSection() {
  const [active, setActive] = useState(0)
  const headRef = useReveal<HTMLDivElement>()
  const svc = SERVICES[active]

  return (
    <section id="services" className="section section-carbon">
      <div className="section-shell">
        <div ref={headRef} className="reveal section-heading section-heading-split">
          <div>
            <p className="eyebrow">02 / SERVICII</p>
            <h2 className="section-title">ALEGEREA<br /><span>CORECTĂ.</span></h2>
          </div>
          <p className="body-copy heading-note">Fiecare material, finisaj și procedură este aleasă în funcție de mașină, utilizare și rezultatul dorit.</p>
        </div>

        <div className="services-layout">
          <div className="services-list" role="tablist" aria-label="Servicii WOB ART">
            {SERVICES.map((item, i) => (
              <button
                key={item.num}
                role="tab"
                aria-selected={active === i}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                className={`service-row ${active === i ? 'is-active' : ''}`}
              >
                <span className="service-num">{item.num}</span>
                <span className="service-title-wrap">
                  <strong>{item.title}</strong>
                  <small>{item.tagline}</small>
                </span>
                <ArrowUpRight size={17} className="service-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>

          <div className="service-stage">
            <Image src={svc.image} alt={svc.title} fill sizes="(max-width: 1024px) 100vw, 58vw" className="object-cover" />
            <div className="service-stage-overlay" />
            <div className="service-stage-top"><span>{svc.num}</span><span>WOB / MATERIAL LAB</span></div>
            <div className="service-stage-bottom">
              <div>
                <p className="eyebrow">Include</p>
                <ul>
                  {svc.inclusions.slice(0, 3).map(item => <li key={item}><Check size={13} />{item}</li>)}
                </ul>
              </div>
              <div className="service-stage-price">
                <span>De la</span>
                <strong>{svc.price}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="section-cta-row">
          <span className="mono-note">04 DIRECȚII / UN SINGUR STANDARD</span>
          <MagneticButton variant="outline" size="md" href="#quote">Discută proiectul tău</MagneticButton>
        </div>
      </div>
    </section>
  )
}

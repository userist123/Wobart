'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, Check } from 'lucide-react'
import { SERVICES } from '@/lib/constants'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'
import type { ServiceContent } from '@/lib/site-content'

export function ServicesSection() {
  const [active, setActive] = useState(0)
  const [cmsServices, setCmsServices] = useState<ServiceContent[]>([])
  const headRef = useReveal<HTMLDivElement>()

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setCmsServices(Array.isArray(data?.services) ? data.services.filter((s: ServiceContent) => s.active).sort((a: ServiceContent, b: ServiceContent) => a.sortOrder - b.sortOrder) : []))
      .catch(() => undefined)
  }, [])

  const items = cmsServices.length ? cmsServices : SERVICES.map((item, index) => ({ id: item.num || String(index), name: item.title, slug: item.title.toLowerCase().replace(/\s+/g, '-'), eyebrow: item.tagline, description: '', benefits: item.inclusions, process: [], materials: [], imageUrl: item.image, active: true, sortOrder: index }))
  const svc = items[Math.min(active, Math.max(items.length - 1, 0))]
  const imageSrc = svc?.imageUrl || '/images/hero-car.jpg'
  const isRemoteImage = /^https?:\/\//i.test(imageSrc)

  return (
    <section id="services" className="section section-carbon services-section">
      <div className="section-shell">
        <div ref={headRef} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">02 / SERVICII</p><h2 className="section-title">ALEGEREA<br /><span>CORECTĂ.</span></h2></div>
          <div className="heading-note"><p className="body-copy">Nu există un finisaj universal. Alegem combinația dintre material, culoare și execuție în funcție de mașină și de rezultatul urmărit.</p><span className="services-heading-mark">MATERIAL / FIT / FINISH</span></div>
        </div>
        <div className="services-layout">
          <div className="services-list" role="tablist" aria-label="Servicii WOB ART">
            {items.map((item, i) => <button key={item.id} role="tab" aria-selected={active === i} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => setActive(i)} className={`service-row ${active === i ? 'is-active' : ''}`}><span className="service-num">{String(i + 1).padStart(2, '0')}</span><span className="service-title-wrap"><strong>{item.name}</strong><small>{item.eyebrow}</small></span><ArrowUpRight size={17} className="service-arrow" aria-hidden="true" /></button>)}
          </div>
          {svc && <div className="service-stage"><Image src={imageSrc} alt={svc.name} fill sizes="(max-width: 1024px) 100vw, 58vw" unoptimized={isRemoteImage} className="object-cover service-stage-image" /><div className="service-stage-overlay" /><div className="service-stage-top"><span>{String(active + 1).padStart(2, '0')}</span><span>WOB / MATERIAL LAB</span></div><div className="service-stage-bottom"><div><p className="eyebrow">Include</p><ul>{svc.benefits.slice(0, 4).map((x) => <li key={x}><Check size={13} />{x}</li>)}</ul></div><div className="service-stage-price"><span>Serviciu</span><strong>{String(active + 1).padStart(2, '0')}</strong></div></div></div>}
        </div>
        <div className="section-cta-row"><span className="mono-note">{String(items.length).padStart(2, '0')} SERVICII / UN SINGUR STANDARD</span><MagneticButton variant="outline" size="md" href="#quote">Discută proiectul tău</MagneticButton></div>
      </div>
    </section>
  )
}

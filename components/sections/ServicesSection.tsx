'use client'

import { useEffect, useMemo, useState } from 'react'
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

  const items = useMemo(() => cmsServices.length ? cmsServices : SERVICES.map((item, index) => ({
    id: item.num || String(index), name: item.title, slug: item.title.toLowerCase().replace(/\s+/g, '-'), eyebrow: item.tagline,
    description: item.tagline, benefits: [...item.inclusions], process: [], materials: [], imageUrl: item.image, active: true, sortOrder: index,
  })), [cmsServices])
  const activeIndex = Math.min(active, Math.max(items.length - 1, 0))
  const svc = items[activeIndex]
  const imageSrc = svc?.imageUrl || '/images/hero-car.jpg'
  const isRemoteImage = /^https?:\/\//i.test(imageSrc)

  const selectService = (index: number) => setActive(index)
  const moveService = (index: number, direction: 1 | -1) => {
    if (!items.length) return
    const next = (index + direction + items.length) % items.length
    setActive(next)
    requestAnimationFrame(() => document.getElementById(`service-tab-${next}`)?.focus())
  }

  return (
    <section id="services" className="section section-carbon services-section">
      <div className="section-shell">
        <div ref={headRef} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">02 / SERVICII</p><h2 className="section-title">MATERIAL<br /><span>INTO FORM.</span></h2></div>
          <div className="heading-note"><p className="body-copy">Nu alegem o folie dintr-un catalog și atât. Alegem materialul, finisajul și metoda de execuție în funcție de mașină și de rezultatul urmărit.</p><span className="services-heading-mark">MATERIAL / FIT / FINISH / CONTROL</span></div>
        </div>
        <div className="services-layout">
          <div className="services-list" role="tablist" aria-label="Servicii WOB ART">
            {items.map((item, i) => {
              const selected = activeIndex === i
              return (
                <button
                  key={item.id}
                  id={`service-tab-${i}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="service-panel"
                  tabIndex={selected ? 0 : -1}
                  onMouseEnter={() => selectService(i)}
                  onFocus={() => selectService(i)}
                  onClick={() => selectService(i)}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                      event.preventDefault()
                      moveService(i, 1)
                    }
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                      event.preventDefault()
                      moveService(i, -1)
                    }
                    if (event.key === 'Home') {
                      event.preventDefault()
                      setActive(0)
                      requestAnimationFrame(() => document.getElementById('service-tab-0')?.focus())
                    }
                    if (event.key === 'End') {
                      event.preventDefault()
                      const last = items.length - 1
                      setActive(last)
                      requestAnimationFrame(() => document.getElementById(`service-tab-${last}`)?.focus())
                    }
                  }}
                  className={`service-row ${selected ? 'is-active' : ''}`}
                >
                  <span className="service-num">{String(i + 1).padStart(2, '0')}</span>
                  <span className="service-title-wrap"><strong>{item.name}</strong><small>{item.eyebrow}</small></span>
                  <ArrowUpRight size={17} className="service-arrow" aria-hidden="true" />
                </button>
              )
            })}
          </div>
          {svc && <div id="service-panel" className="service-stage" role="tabpanel" aria-labelledby={`service-tab-${activeIndex}`}>
            <Image key={imageSrc} src={imageSrc} alt={svc.name} fill sizes="(max-width: 900px) 100vw, 64vw" unoptimized={isRemoteImage} className="object-cover service-stage-image" />
            <div className="service-stage-overlay" />
            <div className="service-stage-top"><span>{String(activeIndex + 1).padStart(2, '0')}</span><span>WOB / MATERIAL LAB</span><span>{svc.slug}</span></div>
            <div className="service-stage-content">
              <div className="service-stage-heading"><span className="eyebrow">{svc.eyebrow}</span><h3>{svc.name}</h3><p>{svc.description}</p></div>
              <div className="service-stage-details">
                <div><span className="eyebrow">Include</span><ul>{svc.benefits.slice(0, 4).map((x) => <li key={x}><Check size={13} />{x}</li>)}</ul></div>
                <div className="service-stage-materials"><span className="eyebrow">Material</span><strong>{svc.materials.length ? svc.materials.slice(0, 2).join(' / ') : 'SELECTED BY APPLICATION'}</strong><small>{svc.process.length ? svc.process[0] : 'EXECUȚIE ADAPTATĂ PROIECTULUI'}</small></div>
              </div>
            </div>
          </div>}
        </div>
        <div className="section-cta-row"><span className="mono-note">{String(items.length).padStart(2, '0')} DIRECȚII / UN SINGUR STANDARD</span><MagneticButton variant="outline" size="md" href="#quote">Discută proiectul tău</MagneticButton></div>
      </div>
    </section>
  )
}

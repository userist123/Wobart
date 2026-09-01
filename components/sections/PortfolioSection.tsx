'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowUpRight, X } from 'lucide-react'
import { PORTFOLIO } from '@/lib/constants'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'
import type { PortfolioContent } from '@/lib/site-content'

type PortfolioItem = PortfolioContent | { id: string; title: string; vehicle: string; service: string; finish: string; material: string; description: string; coverUrl: string; gallery: string[] }

export function PortfolioSection() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [cmsItems, setCmsItems] = useState<PortfolioContent[]>([])
  const headRef = useReveal<HTMLDivElement>()

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setCmsItems(Array.isArray(data?.portfolio) ? data.portfolio.filter((p: PortfolioContent) => p.active) : []))
      .catch(() => undefined)
  }, [])

  const items: PortfolioItem[] = cmsItems.length ? cmsItems : PORTFOLIO.map((item, index) => ({ id: item.id || String(index), title: `${item.make} ${item.model}`, vehicle: `${item.make} ${item.model}`, service: item.wrap, finish: item.wrap, material: '—', description: '', coverUrl: item.img, gallery: [] }))
  const item = expanded !== null ? items[expanded] : null
  const expandedImageSrc = item?.coverUrl || '/images/hero-car.jpg'

  return (
    <section id="portfolio" className="section section-obsidian">
      <div className="section-shell">
        <div ref={headRef} className="reveal section-heading section-heading-split"><div><p className="eyebrow">04 / PORTOFOLIU</p><h2 className="section-title">MAȘINI CU<br /><span>PREZENȚĂ.</span></h2></div><p className="body-copy heading-note">Portfolio-ul este administrabil din Website Studio. Publicarea se face prin CMS, fără recompilarea componentelor de conținut.</p></div>
        <div className="portfolio-grid">{items.map((entry, index) => { const imageSrc = entry.coverUrl || '/images/hero-car.jpg'; return <button key={entry.id} onClick={() => setExpanded(index)} className={`portfolio-card portfolio-card-${(index % 4) + 1}`} data-cursor="VIEW"><Image src={imageSrc} alt={entry.title || entry.vehicle} fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized={/^https?:\/\//i.test(imageSrc)} className="object-cover" /><div className="portfolio-overlay" /><div className="portfolio-meta"><span>{entry.service}</span><strong>{entry.title}</strong><small>{entry.finish || entry.material}</small></div><ArrowUpRight className="portfolio-icon" size={18} aria-hidden="true" /></button> })}</div>
        <div className="section-cta-row"><span className="mono-note">SELECTED WORK / CMS CONTROLLED</span><a href="#quote" className="text-link">Vreau ceva similar <ArrowUpRight size={14} /></a></div>
      </div>
      {item && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={item.title} onClick={() => setExpanded(null)}><div className="portfolio-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setExpanded(null)} aria-label="Închide"><X size={20} /></button><div className="portfolio-modal-media"><Image src={expandedImageSrc} alt={item.title} fill sizes="90vw" unoptimized={/^https?:\/\//i.test(expandedImageSrc)} className="object-cover" /></div><div className="portfolio-modal-copy"><span className="eyebrow">{item.service}</span><h3>{item.title}</h3><div className="portfolio-data-grid"><div><span>Finisaj</span><strong>{item.finish || '—'}</strong></div><div><span>Material</span><strong>{item.material || '—'}</strong></div><div><span>Galerie</span><strong>{item.gallery.length}</strong></div></div>{item.description && <p className="body-copy">{item.description}</p>}<MagneticButton variant="accent" href="#quote" onClick={() => setExpanded(null)}>Solicită un proiect similar</MagneticButton></div></div></div>}
    </section>
  )
}

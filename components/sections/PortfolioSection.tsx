'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from 'lucide-react'
import Image from 'next/image'
import { PORTFOLIO } from '@/lib/constants'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'
import type { PortfolioContent } from '@/lib/site-content'

type PortfolioItem = PortfolioContent | { id: string; title: string; vehicle: string; service: string; finish: string; material: string; description: string; coverUrl: string; gallery: string[] }
const FILTERS = ['Toate', 'Wrap', 'PPF', 'Accente'] as const
type Filter = typeof FILTERS[number]

function matchesFilter(item: PortfolioItem, filter: Filter) {
  if (filter === 'Toate') return true
  const value = `${item.service} ${item.finish} ${item.material}`.toLowerCase()
  if (filter === 'PPF') return value.includes('ppf')
  if (filter === 'Accente') return value.includes('crom') || value.includes('accent') || value.includes('interior')
  return value.includes('wrap')
}

export function PortfolioSection() {
  const [expanded, setExpanded] = useState<number | null>(null)
  const [filter, setFilter] = useState<Filter>('Toate')
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [cmsItems, setCmsItems] = useState<PortfolioContent[]>([])
  const headRef = useReveal<HTMLDivElement>()
  const modalRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setCmsItems(Array.isArray(data?.portfolio) ? data.portfolio.filter((p: PortfolioContent) => p.active) : []))
      .catch(() => undefined)
  }, [])

  const items: PortfolioItem[] = useMemo(() => cmsItems.length ? cmsItems : PORTFOLIO.map((item, index) => ({ id: String(item.id ?? index), title: `${item.make} ${item.model}`, vehicle: `${item.make} ${item.model}`, service: item.badge, finish: item.wrap, material: '—', description: '', coverUrl: item.img, gallery: [] })), [cmsItems])
  const visibleItems = useMemo(() => items.filter((item) => matchesFilter(item, filter)), [items, filter])
  const item = expanded !== null ? visibleItems[expanded] : null
  const gallery = item ? [item.coverUrl, ...item.gallery.filter(Boolean)] : []
  const activeGalleryImage = gallery[galleryIndex] || item?.coverUrl || '/images/hero-car.jpg'

  useEffect(() => {
    if (expanded !== null && expanded >= visibleItems.length) setExpanded(null)
  }, [expanded, visibleItems.length])

  useEffect(() => {
    if (expanded === null) return

    const previousActive = document.activeElement as HTMLElement | null
    triggerRef.current = previousActive
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        setExpanded(null)
        return
      }
      if (gallery.length > 1 && event.key === 'ArrowRight') {
        event.preventDefault()
        setGalleryIndex((current) => (current + 1) % gallery.length)
        return
      }
      if (gallery.length > 1 && event.key === 'ArrowLeft') {
        event.preventDefault()
        setGalleryIndex((current) => (current - 1 + gallery.length) % gallery.length)
        return
      }
      if (event.key !== 'Tab' || !modalRef.current) return
      const focusable = Array.from(modalRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    requestAnimationFrame(() => closeRef.current?.focus())

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
      requestAnimationFrame(() => triggerRef.current?.focus())
    }
  }, [expanded, gallery.length])

  return (
    <section id="portfolio" className="section section-obsidian">
      <div className="section-shell">
        <div ref={headRef} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">04 / PORTOFOLIU</p><h2 className="section-title">MAȘINI CU<br /><span>PREZENȚĂ.</span></h2></div>
          <p className="body-copy heading-note">Portofoliul este administrabil din Website Studio. Publicarea se face prin CMS, fără recompilarea componentelor de conținut.</p>
        </div>

        <div className="portfolio-filter-bar" role="tablist" aria-label="Filtrează portofoliul">
          <div className="portfolio-filter-label"><span>SELECTED WORK</span><strong>{String(visibleItems.length).padStart(2, '0')}</strong></div>
          <div className="portfolio-filters">{FILTERS.map((value) => <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? 'is-active' : ''} onClick={() => { setFilter(value); setExpanded(null) }}>{value}</button>)}</div>
        </div>

        <div className="portfolio-grid">{visibleItems.map((entry, index) => { const imageSrc = entry.coverUrl || '/images/hero-car.jpg'; return <button key={entry.id} onClick={(event) => { triggerRef.current = event.currentTarget; setExpanded(index) }} className={`portfolio-card portfolio-card-${(index % 4) + 1}`} data-cursor="VIEW" aria-label={`Vezi proiectul ${entry.title || entry.vehicle}`}>
          <Image src={imageSrc} alt={entry.title || entry.vehicle} fill sizes="(max-width: 768px) 100vw, 50vw" unoptimized={/^https?:\/\//i.test(imageSrc)} className="object-cover" />
          <div className="portfolio-overlay" /><div className="portfolio-meta"><span>{entry.service}</span><strong>{entry.title}</strong><small>{entry.finish || entry.material}</small></div><ArrowUpRight className="portfolio-icon" size={18} aria-hidden="true" />
        </button> })}</div>
        <div className="section-cta-row"><span className="mono-note">SELECTED WORK / {String(visibleItems.length).padStart(2, '0')} PROJECTS</span><a href="#quote" className="text-link">Vreau ceva similar <ArrowUpRight size={14} /></a></div>
      </div>

      {item && <div className="modal-backdrop" role="presentation" onClick={() => setExpanded(null)}>
        <div ref={modalRef} className="portfolio-modal" role="dialog" aria-modal="true" aria-labelledby="portfolio-dialog-title" onClick={(e) => e.stopPropagation()}>
          <button ref={closeRef} className="modal-close" onClick={() => setExpanded(null)} aria-label="Închide proiectul"><X size={20} /></button>
          <div className="portfolio-modal-media">
            <Image key={activeGalleryImage} src={activeGalleryImage} alt={`${item.title} — ${galleryIndex + 1}`} fill sizes="90vw" unoptimized={/^https?:\/\//i.test(activeGalleryImage)} className="object-cover" />
            {gallery.length > 1 && <><button className="portfolio-gallery-arrow portfolio-gallery-prev" onClick={() => setGalleryIndex((current) => (current - 1 + gallery.length) % gallery.length)} aria-label="Imaginea anterioară"><ArrowLeft size={18} /></button><button className="portfolio-gallery-arrow portfolio-gallery-next" onClick={() => setGalleryIndex((current) => (current + 1) % gallery.length)} aria-label="Imaginea următoare"><ArrowRight size={18} /></button></>}
            {gallery.length > 1 && <div className="portfolio-gallery-counter" aria-live="polite">{String(galleryIndex + 1).padStart(2, '0')} / {String(gallery.length).padStart(2, '0')}</div>}
          </div>
          <div className="portfolio-modal-copy">
            <span className="eyebrow">{item.service}</span><h3 id="portfolio-dialog-title">{item.title}</h3>
            <div className="portfolio-data-grid"><div><span>Finisaj</span><strong>{item.finish || '—'}</strong></div><div><span>Material</span><strong>{item.material || '—'}</strong></div><div><span>Galerie</span><strong>{gallery.length}</strong></div><div><span>Vehicul</span><strong>{item.vehicle || '—'}</strong></div></div>
            {item.description && <p className="body-copy">{item.description}</p>}
            {gallery.length > 1 && <div className="portfolio-thumbs" aria-label="Galerie proiect">{gallery.map((src, index) => <button key={`${src}-${index}`} className={galleryIndex === index ? 'is-active' : ''} onClick={() => setGalleryIndex(index)} aria-label={`Imaginea ${index + 1}`} aria-current={galleryIndex === index ? 'true' : undefined}><Image src={src} alt="" fill sizes="90px" unoptimized={/^https?:\/\//i.test(src)} className="object-cover" /></button>)}</div>}
            <MagneticButton variant="accent" href="#quote" onClick={() => setExpanded(null)}>Solicită un proiect similar</MagneticButton>
          </div>
        </div>
      </div>}
    </section>
  )
}

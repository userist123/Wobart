'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'
import type { SiteContent } from '@/lib/site-content'

const fallback = { eyebrow: 'WOB ART / ATELIER DE CAR WRAPPING', title: 'MAȘINA TA.\nREINVENTATĂ.', description: 'Wrap premium, PPF și finisaje care schimbă complet prezența unei mașini — fără compromisuri la detalii.', primaryCtaLabel: 'Solicită ofertă', primaryCtaHref: '#quote', secondaryCtaLabel: 'Vezi transformările', secondaryCtaHref: '#portfolio', imageUrl: '/images/hero-car.jpg', videoUrl: '' }

export function HeroSection() {
  const [hero, setHero] = useState(fallback)
  const kickerRef = useReveal<HTMLParagraphElement>()
  const titleRef = useReveal<HTMLHeadingElement>({ delay: 90 })
  const copyRef = useReveal<HTMLDivElement>({ delay: 170 })
  const metaRef = useReveal<HTMLDivElement>({ delay: 260 })

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: SiteContent | null) => { if (data?.home?.hero) setHero({ ...fallback, ...data.home.hero }) })
      .catch(() => undefined)
  }, [])

  return <section className="hero-shell">
    <div className="hero-media" aria-hidden="true"><Image src={hero.imageUrl || fallback.imageUrl} alt="" fill priority sizes="100vw" className="object-cover hero-image" /><div className="hero-vignette" /><div className="hero-scanline" /></div>
    <div className="section-shell hero-inner"><div className="hero-copy"><p ref={kickerRef} className="reveal eyebrow hero-kicker">{hero.eyebrow}</p><h1 ref={titleRef} className="reveal hero-title">{hero.title.split('\n').map((line) => <span key={line} className="block">{line}</span>)}</h1><div ref={copyRef} className="reveal hero-copy-row"><p className="body-copy hero-description">{hero.description}</p><div className="hero-actions"><MagneticButton variant="accent" size="lg" href={hero.primaryCtaHref}>{hero.primaryCtaLabel}</MagneticButton><a className="text-link" href={hero.secondaryCtaHref}>{hero.secondaryCtaLabel} <ArrowUpRight size={14} /></a></div></div></div><div ref={metaRef} className="reveal hero-meta"><div className="hero-meta-block"><span>Locație</span><strong>Configurable</strong></div><div className="hero-meta-block"><span>Brand</span><strong>WOB ART</strong></div><div className="hero-meta-block hero-meta-last"><span>Scroll pentru</span><a href="#services">servicii <ArrowDownRight size={13} /></a></div></div></div>
    <div className="hero-index" aria-hidden="true">01</div><div className="hero-side-label" aria-hidden="true">PRECISION / MATERIAL / FINISH</div>
  </section>
}

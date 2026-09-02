'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'
import type { SiteContent } from '@/lib/site-content'

const fallback = {
  eyebrow: 'WOB ART / ATELIER DE CAR WRAPPING',
  title: 'MAȘINA TA.\nREINVENTATĂ.',
  description: 'Wrap premium, PPF și finisaje care schimbă complet prezența unei mașini — fără compromisuri la detalii.',
  primaryCtaLabel: 'Solicită ofertă',
  primaryCtaHref: '#quote',
  secondaryCtaLabel: 'Vezi transformările',
  secondaryCtaHref: '#portfolio',
  imageUrl: '/images/hero-car.jpg',
  videoUrl: '',
}

type Pointer = { x: number; y: number }

export function HeroSection() {
  const [hero, setHero] = useState(fallback)
  const [identity, setIdentity] = useState({ city: '', brandName: 'WOB ART' })
  const [pointer, setPointer] = useState<Pointer>({ x: 0, y: 0 })
  const [scrollProgress, setScrollProgress] = useState(0)
  const heroRef = useRef<HTMLElement>(null)
  const pointerFrame = useRef<number | null>(null)
  const pointerTarget = useRef<Pointer>({ x: 0, y: 0 })
  const kickerRef = useReveal<HTMLParagraphElement>()
  const titleRef = useReveal<HTMLHeadingElement>({ delay: 90 })
  const copyRef = useReveal<HTMLDivElement>({ delay: 170 })
  const metaRef = useReveal<HTMLDivElement>({ delay: 260 })

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : null)
      .then((data: SiteContent | null) => {
        if (!data) return
        if (data.home?.hero) setHero({ ...fallback, ...data.home.hero })
        if (data.global) setIdentity({ city: data.global.city || '', brandName: data.global.brandName || 'WOB ART' })
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const move = (event: PointerEvent) => {
      if (window.matchMedia('(pointer: coarse)').matches) return
      pointerTarget.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      }
      if (pointerFrame.current !== null) return
      pointerFrame.current = requestAnimationFrame(() => {
        pointerFrame.current = null
        setPointer(pointerTarget.current)
      })
    }
    const scroll = () => setScrollProgress(Math.min(1, Math.max(0, window.scrollY / Math.max(window.innerHeight, 1))))
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('scroll', scroll, { passive: true })
    scroll()
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', scroll)
      if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current)
    }
  }, [])

  const imageSrc = hero.imageUrl || fallback.imageUrl
  const videoSrc = hero.videoUrl?.trim()
  const isRemoteImage = /^https?:\/\//i.test(imageSrc)
  const titleLines = useMemo(() => hero.title.split('\n').filter(Boolean), [hero.title])

  return (
    <section ref={heroRef} className="hero-shell" style={{ '--hero-x': `${pointer.x}px`, '--hero-y': `${pointer.y}px`, '--hero-progress': scrollProgress } as React.CSSProperties}>
      <div className="hero-media" aria-hidden="true">
        {videoSrc ? (
          <video className="hero-video" autoPlay muted loop playsInline poster={imageSrc} preload="metadata" style={{ transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -7 + scrollProgress * 15}px, 0) scale(1.06)` }}>
            <source src={videoSrc} />
          </video>
        ) : (
          <Image src={imageSrc} alt="" fill priority sizes="100vw" unoptimized={isRemoteImage} className="object-cover hero-image" style={{ transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -7 + scrollProgress * 15}px, 0) scale(1.035)` }} />
        )}
        <div className="hero-vignette" />
        <div className="hero-light-sweep" style={{ transform: `translate3d(${pointer.x * 24}px, ${pointer.y * 10}px, 0)` }} />
        <div className="hero-scanline" />
      </div>
      <div className="hero-engineering-grid" aria-hidden="true" />
      <div className="hero-field-index" aria-hidden="true">WOB / 001</div>
      <div className="hero-field-word" aria-hidden="true">ART</div>
      <div className="section-shell hero-inner" style={{ transform: `translate3d(0, ${scrollProgress * -32}px, 0)`, opacity: Math.max(0.18, 1 - scrollProgress * 0.62) }}>
        <div className="hero-copy">
          <p ref={kickerRef} className="reveal eyebrow hero-kicker">{hero.eyebrow}</p>
          <h1 ref={titleRef} className="reveal hero-title">
            {titleLines.map((line, index) => <span key={`${line}-${index}`} className={index === titleLines.length - 1 ? 'hero-title-line hero-title-line-offset' : 'hero-title-line'}>{line}</span>)}
          </h1>
          <div ref={copyRef} className="reveal hero-copy-row">
            <p className="body-copy hero-description">{hero.description}</p>
            <div className="hero-actions">
              <MagneticButton variant="accent" size="lg" href={hero.primaryCtaHref}>{hero.primaryCtaLabel}</MagneticButton>
              <a className="text-link" href={hero.secondaryCtaHref}>{hero.secondaryCtaLabel} <ArrowUpRight size={14} /></a>
            </div>
          </div>
        </div>
        <div ref={metaRef} className="reveal hero-meta">
          <div className="hero-meta-block"><span>Locație</span><strong>{identity.city || 'București'}</strong></div>
          <div className="hero-meta-block"><span>Brand</span><strong>{identity.brandName}</strong></div>
          <div className="hero-meta-block hero-meta-last"><span>Scroll pentru</span><a href="#services">servicii <ArrowDownRight size={13} /></a></div>
        </div>
      </div>
      <div className="hero-index" aria-hidden="true">01</div>
      <div className="hero-side-label" aria-hidden="true">PRECISION / MATERIAL / FINISH</div>
      <div className="hero-scroll-rail" aria-hidden="true"><span style={{ transform: `scaleY(${Math.max(.06, 1 - scrollProgress)})` }} /></div>
    </section>
  )
}

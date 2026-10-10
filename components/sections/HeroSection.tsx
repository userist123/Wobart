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
  const pointerFrame = useRef<number | null>(null)
  const pointerTarget = useRef<Pointer>({ x: 0, y: 0 })
  const kickerRef = useReveal<HTMLParagraphElement>()
  const titleRef = useReveal<HTMLHeadingElement>({ delay: 80 })
  const subRef = useReveal<HTMLParagraphElement>({ delay: 160 })
  const copyRef = useReveal<HTMLDivElement>({ delay: 240 })
  const metaRef = useReveal<HTMLDivElement>({ delay: 320 })
  const metaRef2 = useReveal<HTMLDivElement>({ delay: 400 })
  const metaRef3 = useReveal<HTMLDivElement>({ delay: 480 })

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
    <section className="v2-hero" style={{ '--hero-x': `${pointer.x}px`, '--hero-y': `${pointer.y}px`, '--hero-progress': scrollProgress } as React.CSSProperties}>
      <div className="v2-hero-media" aria-hidden="true">
        {videoSrc ? (
          <video className="v2-hero-img" autoPlay muted loop playsInline poster={imageSrc} preload="metadata" style={{ transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -7 + scrollProgress * 15}px, 0) scale(1.06)` }}>
            <source src={videoSrc} />
          </video>
        ) : (
          <Image src={imageSrc} alt="" fill priority sizes="100vw" unoptimized={isRemoteImage} className="object-cover v2-hero-img" style={{ transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -7 + scrollProgress * 15}px, 0) scale(1.035)` }} />
        )}
        <div className="v2-hero-overlay" />
        <div className="v2-hero-glow" />
      </div>
      <div className="v2-hero-coord" aria-hidden="true">WOB / 001</div>
      <div className="section-shell v2-hero-inner" style={{ transform: `translate3d(0, ${scrollProgress * -32}px, 0)`, opacity: Math.max(0.18, 1 - scrollProgress * 0.62) }}>
        <div className="v2-hero-copy">
          <p ref={kickerRef} className="reveal eyebrow v2-hero-eyebrow">{hero.eyebrow}</p>
          <h1 ref={titleRef} className="reveal v2-hero-title">
            {titleLines.map((line, index) => <span key={`${line}-${index}`} className={titleLines.length > 1 && index === titleLines.length - 1 ? 'v2-hero-line v2-hero-line-accent' : 'v2-hero-line'}>{line}</span>)}
          </h1>
          <p ref={subRef} className="reveal v2-hero-sub">{hero.description}</p>
          <div ref={copyRef} className="reveal v2-hero-actions">
            <MagneticButton variant="accent" size="lg" href={hero.primaryCtaHref}>{hero.primaryCtaLabel}</MagneticButton>
            <MagneticButton variant="ghost" size="lg" href={hero.secondaryCtaHref}>{hero.secondaryCtaLabel} <ArrowUpRight size={14} aria-hidden="true" /></MagneticButton>
          </div>
        </div>
        <div className="v2-hero-stats">
          <div ref={metaRef} className="reveal glass v2-hero-chip"><span>Locație</span><strong>{identity.city || 'București'}</strong></div>
          <div ref={metaRef2} className="reveal glass v2-hero-chip"><span>Brand</span><strong>{identity.brandName}</strong></div>
          <div ref={metaRef3} className="reveal glass glass-hover v2-hero-chip"><span>Scroll pentru</span><a href="#services">servicii <ArrowDownRight size={13} aria-hidden="true" /></a></div>
        </div>
      </div>
      <div className="v2-hero-cue" aria-hidden="true"><span /></div>
    </section>
  )
}

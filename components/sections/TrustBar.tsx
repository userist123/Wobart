'use client'

import { useEffect, useRef } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'

function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const elRef = useRef<HTMLSpanElement>(null)
  const didRun = useRef(false)

  useEffect(() => {
    const el = elRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || didRun.current) return
      didRun.current = true
      observer.disconnect()
      const duration = 1400
      const start = performance.now()
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - t, 3)
        el.textContent = Math.round(ease * target).toString()
        if (t < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target])

  return <span className="tabular-nums"><span ref={elRef}>0</span>{suffix}</span>
}

function TrustItem({ item, index }: { item: string; index: number }) {
  const ref = useReveal<HTMLLIElement>({ delay: index * 80 })
  const match = item.match(/^(\d+)(.*)$/)
  const target = match ? Number(match[1]) : null
  const suffix = match?.[2]?.trim() ? ` ${match[2].trim()}` : ''
  return (
    <li ref={ref} className="reveal flex items-center gap-4 sm:gap-6">
      {index > 0 && <span aria-hidden="true" className="hidden size-1 shrink-0 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF] sm:block" />}
      <span className="font-mono text-[11px] font-medium uppercase leading-none tracking-[.12em] text-white/80">
        {target !== null ? <CountUp target={target} suffix={suffix} /> : item}
      </span>
    </li>
  )
}

export function TrustBar() {
  const { content } = useSiteContent()
  const items = content.home.trustItems

  if (!items.length) return null

  return (
    <section className="section-shell relative z-10 py-6 md:py-10" aria-label="WOB ART în cifre">
      <ul className="glass m-0 flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-4 px-6 py-5 sm:gap-x-6 md:px-10 md:py-6">
        {items.map((item, index) => <TrustItem key={`${item}-${index}`} item={item} index={index} />)}
      </ul>
    </section>
  )
}

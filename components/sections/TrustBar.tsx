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

export function TrustBar() {
  const ref = useReveal<HTMLElement>()
  const { content } = useSiteContent()
  const items = content.home.trustItems

  if (!items.length) return null

  return (
    <section ref={ref} className="reveal bg-[#111111] border-y border-white/[0.07] py-12 md:py-16" aria-label="WOB ART în cifre">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 md:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/[0.07]">
          {items.map((item, index) => {
            const match = item.match(/^(\d+)(.*)$/)
            const target = match ? Number(match[1]) : null
            const suffix = match?.[2]?.trim() ?? ''
            return (
              <div key={`${item}-${index}`} className="flex flex-col items-center text-center px-4 md:px-8 py-4">
                <div className="font-display text-[clamp(44px,6vw,72px)] leading-none text-[#E8FF00]">
                  {target !== null ? <CountUp target={target} suffix={suffix} /> : item}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

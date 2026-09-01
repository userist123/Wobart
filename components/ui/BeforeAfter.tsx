'use client'

import { useCallback, useRef, useState } from 'react'
import Image from 'next/image'

interface BeforeAfterProps {
  before: string
  after: string
  label?: string
}

export function BeforeAfter({ before, after, label }: BeforeAfterProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [pct, setPct] = useState(50)
  const dragging = useRef(false)

  const update = useCallback((clientX: number) => {
    const el = containerRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    setPct(x * 100)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[560/380] overflow-hidden select-none cursor-ew-resize border border-white/[0.08]"
      data-cursor="DRAG"
      role="slider"
      aria-label={label || 'Înainte și după'}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowLeft') { event.preventDefault(); setPct(p => Math.max(0, p - 5)) }
        if (event.key === 'ArrowRight') { event.preventDefault(); setPct(p => Math.min(100, p + 5)) }
        if (event.key === 'Home') { event.preventDefault(); setPct(0) }
        if (event.key === 'End') { event.preventDefault(); setPct(100) }
      }}
      onPointerDown={event => {
        dragging.current = true
        event.currentTarget.setPointerCapture(event.pointerId)
        update(event.clientX)
      }}
      onPointerMove={event => {
        if (dragging.current) update(event.clientX)
      }}
      onPointerUp={event => {
        dragging.current = false
        event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onClick={event => update(event.clientX)}
    >
      <Image src={after} alt={label ? `${label} — după` : 'După'} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <Image src={before} alt={label ? `${label} — înainte` : 'Înainte'} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="absolute top-0 bottom-0 w-px bg-[#E8FF00] pointer-events-none" style={{ left: `${pct}%` }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-9 border border-[#E8FF00] bg-[#0A0A0A] grid place-items-center text-[#E8FF00]">
          <span className="text-[10px] font-mono" aria-hidden="true">↔</span>
        </div>
      </div>
      <span className="absolute top-3 left-3 text-[9px] font-label tracking-[.18em] text-white/70 uppercase bg-black/45 border border-white/10 px-2 py-1">Before</span>
      <span className="absolute top-3 right-3 text-[9px] font-label tracking-[.18em] text-[#E8FF00] uppercase bg-black/45 border border-white/10 px-2 py-1">After</span>
      {label && <span className="absolute left-3 right-3 bottom-3 text-[10px] font-label tracking-[.12em] text-white/70 uppercase">{label}</span>}
    </div>
  )
}

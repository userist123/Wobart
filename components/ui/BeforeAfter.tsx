'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
  const pointerFrame = useRef<number | null>(null)
  const pointerX = useRef<number | null>(null)

  const commitPointerPosition = useCallback(() => {
    pointerFrame.current = null
    const clientX = pointerX.current
    const el = containerRef.current
    if (clientX === null || !el) return
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / Math.max(rect.width, 1)))
    setPct(x * 100)
  }, [])

  const update = useCallback((clientX: number) => {
    pointerX.current = clientX
    if (pointerFrame.current !== null) return
    pointerFrame.current = requestAnimationFrame(commitPointerPosition)
  }, [commitPointerPosition])

  useEffect(() => () => {
    if (pointerFrame.current !== null) cancelAnimationFrame(pointerFrame.current)
  }, [])

  return (
    <div
      ref={containerRef}
      className="before-after-card relative w-full aspect-[560/380] overflow-hidden select-none cursor-ew-resize"
      data-cursor="DRAG"
      role="slider"
      aria-label={label || 'Comparație înainte și după'}
      aria-valuetext={`${Math.round(pct)}% înainte`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-orientation="horizontal"
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
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={() => { dragging.current = false }}
      onClick={event => update(event.clientX)}
    >
      <Image src={after} alt={label ? `${label} — după` : 'După'} fill className="object-cover before-after-image" sizes="(max-width: 768px) 100vw, 33vw" />
      <div className="absolute inset-0 overflow-hidden before-after-before" style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}>
        <Image src={before} alt={label ? `${label} — înainte` : 'Înainte'} fill className="object-cover before-after-image" sizes="(max-width: 768px) 100vw, 33vw" />
      </div>
      <div className="before-after-divider absolute top-0 bottom-0 w-px pointer-events-none" style={{ left: `${pct}%` }}>
        <div className="before-after-handle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span aria-hidden="true">↔</span>
        </div>
      </div>
      <div className="before-after-corner before-after-corner-tl" aria-hidden="true" />
      <div className="before-after-corner before-after-corner-br" aria-hidden="true" />
      <span className="before-after-label before-after-label-before">Before</span>
      <span className="before-after-label before-after-label-after">After</span>
      {label && <span className="before-after-caption">{label}</span>}
      <span className="before-after-hint" aria-hidden="true">DRAG</span>
    </div>
  )
}

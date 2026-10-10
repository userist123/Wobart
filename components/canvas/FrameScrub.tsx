'use client'

/**
 * Scroll-scrubbed image sequence on a <canvas> (the Apple / Terminal Industries technique): pre-rendered Blender
 * frames are drawn with drawImage as the scroll progress moves, cover-fitted with no layout work.
 * - Frames load coarse-to-fine (every 16th, 8th, 4th, 2nd, then all) so scrubbing works from the first second;
 *   the nearest loaded frame is drawn until the exact one arrives.
 * - On narrow screens the cover crop follows the car, which the render frames left/right of centre per chapter.
 */
import { useEffect, useRef, type MutableRefObject } from 'react'

type Props = {
  progress: MutableRefObject<number>
  /** URL of frame i (0-based). */
  src: (i: number) => string
  count: number
  /** Horizontal position of the subject in the frame (0..1) at progress p, used when the crop is narrower than the frame. */
  focusX?: (p: number) => number
  onReady?: () => void
}

export function FrameScrub({ progress, src, count, focusX, onReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return
    const frames: (HTMLImageElement | null)[] = new Array(count).fill(null)
    let disposed = false
    let dirty = true
    let readyCalled = false

    // coarse-to-fine load order, a few requests at a time
    const order: number[] = []
    const seen = new Set<number>()
    for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < count; i += step) if (!seen.has(i)) { seen.add(i); order.push(i) }
    if (!seen.has(count - 1)) order.splice(1, 0, count - 1)
    let next = 0
    const pump = () => {
      if (disposed || next >= order.length) return
      const i = order[next++]
      const img = new Image()
      img.decoding = 'async'
      img.src = src(i)
      img.decode().then(() => {
        if (disposed) return
        frames[i] = img
        if (!readyCalled) { readyCalled = true; onReady?.() }
        dirty = true
      }).catch(() => {}).finally(pump)
    }
    for (let k = 0; k < 6; k++) pump()

    const nearest = (i: number) => {
      if (frames[i]) return frames[i]
      for (let d = 1; d < count; d++) {
        const a = frames[i - d], b = frames[i + d]
        if (a) return a
        if (b) return b
      }
      return null
    }

    let w = 0, h = 0, dpr = 1, shown = -1, cur = progress.current * (count - 1)
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth; h = canvas.clientHeight
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr)
      dirty = true
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    let raf = 0
    const tick = () => {
      raf = requestAnimationFrame(tick)
      const target = progress.current * (count - 1)
      cur += (target - cur) * 0.22
      if (Math.abs(target - cur) < 0.01) cur = target
      const i = Math.min(count - 1, Math.max(0, Math.round(cur)))
      const img = nearest(i)
      if (!img || (!dirty && i === shown && img === frames[shown])) return
      dirty = false
      shown = frames[i] ? i : -1
      const cw = canvas.width, ch = canvas.height
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const dw = img.naturalWidth * s, dh = img.naturalHeight * s
      const fx = focusX ? focusX(progress.current) : 0.5
      // keep the subject centred when the frame is cropped horizontally, never past the frame edges
      const dx = Math.min(0, Math.max(cw - dw, cw / 2 - fx * dw))
      ctx.drawImage(img, dx, (ch - dh) / 2, dw, dh)
    }
    raf = requestAnimationFrame(tick)

    return () => { disposed = true; cancelAnimationFrame(raf); ro.disconnect() }
  }, [count, src, focusX, onReady, progress])

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} aria-hidden="true" />
}

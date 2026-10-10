'use client'

/**
 * Smooth inertial scroll (Lenis) driven by the GSAP ticker, so ScrollTrigger and the WebGL scenes read the
 * same lerped scroll position every frame (no jitter between DOM and canvas).
 * - Off for prefers-reduced-motion (native scroll, instant anchors).
 * - Touch keeps native momentum (syncTouch off): Lenis only smooths wheel/trackpad.
 * - Anchor links (#quote, #services…) scroll smoothly through Lenis.
 */
import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function LenisProvider() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true, syncTouch: false, anchors: { offset: -80 } })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    document.documentElement.classList.add('lenis-on')
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      document.documentElement.classList.remove('lenis-on')
    }
  }, [])
  return null
}

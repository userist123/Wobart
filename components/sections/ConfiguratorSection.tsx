'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Move3d } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'
import { defaultSiteContent, type WrapFinish } from '@/lib/site-content'

const WrapConfigurator = dynamic(() => import('@/components/canvas/WrapConfigurator'), { ssr: false, loading: () => null })

const FINISH_LABEL: Record<WrapFinish, string> = {
  gloss: 'Gloss',
  matte: 'Matte',
  satin: 'Satin',
  chrome: 'Crom',
  'color-shift': 'Color-Shift',
}
const FINISH_DESC: Record<WrapFinish, string> = {
  gloss: 'Luciu adânc, reflexii clare, cel mai apropiat de vopseaua originală.',
  satin: 'Reflexii difuze, aspect mat-mătăsos, ascunde micile imperfecțiuni.',
  matte: 'Fără luciu, prezență dramatică, necesită îngrijire atentă.',
  chrome: 'Oglindă metalică, efect maxim, montaj pretențios.',
  'color-shift': 'Culoarea se schimbă cu unghiul de vedere și lumina.',
}
const FACTS = ['VIZUALIZARE ORIENTATIVĂ', 'CULORI DIN CATALOGUL CMS', 'OFERTA DUPĂ EVALUARE']
const FINISH_ORDER: WrapFinish[] = ['gloss', 'matte', 'satin', 'chrome', 'color-shift']

const FALLBACK_TITLE = 'ALEGE FINISAJUL.\nVEZI-L LIVE.'
const FALLBACK_BODY = 'Schimbă culoarea și finisajul pe un model generic ca să îți formezi direcția. Finisajul final se stabilește împreună, la evaluarea vehiculului.'

function swatchBackground(hex: string, finish: WrapFinish): string {
  if (finish === 'chrome') return `linear-gradient(135deg, #ffffff 0%, ${hex} 38%, #3a3a3a 62%, #f2f2f2 100%)`
  if (finish === 'color-shift') return `conic-gradient(from 200deg, ${hex}, #00F5FF, #00F0FF, ${hex})`
  return hex
}

function webglAvailable(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

export function ConfiguratorSection() {
  const { content } = useSiteContent()
  const cfg = content.home.configurator ?? defaultSiteContent.home.configurator
  const headingRef = useReveal<HTMLDivElement>()
  const stageRef = useRef<HTMLDivElement>(null)
  const [selectedId, setSelectedId] = useState('')
  const [filter, setFilter] = useState<WrapFinish | 'all'>('all')
  const [canvasOn, setCanvasOn] = useState(false)
  const [visible, setVisible] = useState(false)
  const [interacted, setInteracted] = useState(false)

  const colors = useMemo(
    () => (cfg?.colors ?? []).filter((c) => c.active).sort((a, b) => a.sortOrder - b.sortOrder),
    [cfg],
  )
  const hasColors = colors.length > 0

  useEffect(() => {
    const el = stageRef.current
    if (!el || !hasColors) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        near.disconnect()
        if (!mq.matches && window.innerWidth >= 768 && webglAvailable()) setCanvasOn(true)
      },
      { rootMargin: '240px' },
    )
    const live = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.1 })
    const onMotion = (e: MediaQueryListEvent) => { if (e.matches) setCanvasOn(false) }
    near.observe(el)
    live.observe(el)
    mq.addEventListener('change', onMotion)
    return () => {
      near.disconnect()
      live.disconnect()
      mq.removeEventListener('change', onMotion)
    }
  }, [hasColors])

  if (!hasColors || !cfg) return null

  const selected = colors.find((c) => c.id === selectedId) ?? colors[0]
  const finishes = FINISH_ORDER.filter((f) => colors.some((c) => c.finish === f))
  const shown = filter === 'all' ? colors : colors.filter((c) => c.finish === filter)
  const finishLabel = FINISH_LABEL[selected.finish]
  const titleLines = (cfg.title || FALLBACK_TITLE).split('\n')

  const applyFilter = (next: WrapFinish | 'all') => {
    setFilter(next)
    const pool = next === 'all' ? colors : colors.filter((c) => c.finish === next)
    if (!pool.some((c) => c.id === selected.id) && pool[0]) setSelectedId(pool[0].id)
  }

  return (
    <section id="configurator" className="section section-carbon configurator-section">
      <div className="section-shell">
        <div ref={headingRef} className="section-heading reveal">
          <p className="eyebrow">{cfg.eyebrow || '02B / CONFIGURATOR'}</p>
          <h2 className="section-title">
            {titleLines.map((line, i) => (
              <Fragment key={i}>
                {i > 0 && <br />}
                {i === titleLines.length - 1 ? <span>{line}</span> : line}
              </Fragment>
            ))}
          </h2>
          <p className="body-copy max-w-2xl">{cfg.body || FALLBACK_BODY}</p>
        </div>

        <div className="configurator-layout">
          <div
            ref={stageRef}
            className="configurator-stage"
            role="img"
            aria-label={`Model generic în ${selected.name}, finisaj ${finishLabel}`}
            onPointerDown={() => setInteracted(true)}
          >
            {canvasOn ? (
              <WrapConfigurator color={selected} active={visible} label={`Model generic în ${selected.name}`} />
            ) : (
              <>
                <Image
                  src={cfg.posterUrl || '/images/hero-car.jpg'}
                  alt="Previzualizare statică a configuratorului"
                  fill
                  sizes="(max-width: 900px) 100vw, 60vw"
                  unoptimized={/^https?:\/\//i.test(cfg.posterUrl)}
                  className="configurator-poster"
                />
                <div className="configurator-tint" style={{ backgroundColor: selected.hex }} />
                <span className="configurator-static-label">PREVIEW STATIC</span>
              </>
            )}
            {canvasOn && (
              <>
                <span className="configurator-caption" aria-hidden="true">MODEL GENERIC / 3D LIVE</span>
                <span className="configurator-hint" data-hidden={interacted} aria-hidden="true">
                  <Move3d size={14} strokeWidth={1.75} />
                  Trage pentru a roti
                </span>
              </>
            )}
            <span className="configurator-stage-frame" aria-hidden="true" />
          </div>

          <div className="configurator-controls">
            <fieldset className="configurator-fieldset">
              <legend className="eyebrow">Culoare și finisaj</legend>

              <p className="eyebrow configurator-sublabel" aria-hidden="true">FINISAJ</p>
              <div className="configurator-filters">
                {(['all', ...finishes] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    className="configurator-filter"
                    aria-pressed={filter === f}
                    onClick={() => applyFilter(f)}
                  >
                    {f === 'all' ? 'Toate' : FINISH_LABEL[f]}
                  </button>
                ))}
              </div>

              <div className="configurator-swatches">
                {shown.map((c) => (
                  <span key={c.id} className="configurator-swatch-item">
                    <input
                      type="radio"
                      name="wrap-color"
                      id={`wrap-color-${c.id}`}
                      className="sr-only configurator-radio"
                      value={c.id}
                      checked={selected.id === c.id}
                      onChange={() => setSelectedId(c.id)}
                    />
                    <label
                      htmlFor={`wrap-color-${c.id}`}
                      className="configurator-swatch"
                      style={{ background: swatchBackground(c.hex, c.finish) }}
                      title={`${c.name} · ${FINISH_LABEL[c.finish]}`}
                    >
                      <span className="sr-only">{`${c.name}, ${FINISH_LABEL[c.finish]}`}</span>
                    </label>
                    {selected.id === c.id && <span className="configurator-swatch-name" aria-hidden="true">{c.name}</span>}
                  </span>
                ))}
              </div>
            </fieldset>

            <div className="configurator-readout" aria-live="polite">
              <strong className="configurator-name">{selected.name}</strong>
              <div className="configurator-specs">
                <span>FINISAJ · <b>{finishLabel}</b></span>
                <span>COD · <b>{selected.hex.toUpperCase()}</b></span>
              </div>
              <p className="configurator-desc">{FINISH_DESC[selected.finish]}</p>
            </div>

            <div className="section-cta-row configurator-cta">
              <MagneticButton href="#quote">Cere ofertă pentru acest finisaj</MagneticButton>
              <MagneticButton href="#portfolio" variant="ghost">Vezi lucrări reale</MagneticButton>
            </div>

            <ul className="configurator-facts">
              {FACTS.map((f) => <li key={f}>{f}</li>)}
            </ul>

            <p className="body-copy configurator-disclaimer">
              Randare orientativă pe un model generic — nu reprezintă un vehicul sau o folie anume. Model 3D: „Car Concept” © 2024 Darmstadt Graphics Group GmbH / Eric Chadwick,{' '}
              <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a> (bază CC0 de Unity Fan), via Khronos glTF-Sample-Assets.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'

const MARCI = ['BMW', 'Mercedes', 'Audi', 'Porsche', 'Range Rover', 'Tesla', 'Ferrari', 'Lamborghini', 'Volkswagen', 'Skoda']
const SERVICII = ['Wrap Complet', 'PPF', 'Wrap Parțial', 'Accente'] as const
const FINISAJE = [
  { label: 'Gloss', color: '#1a1a1a', border: '#444' },
  { label: 'Matte', color: '#2d2d2d', border: '#555' },
  { label: 'Satin', color: '#3a3a3a', border: '#666' },
  { label: 'Crom', color: '#a0a0a0', border: '#ccc' },
  { label: 'Color-Shift', color: 'linear-gradient(135deg,#9B00FF,#00F5FF,#00F0FF)', border: '#00F0FF' },
]
const BAZA: Record<string, number> = { 'Wrap Complet': 2800, PPF: 2000, 'Wrap Parțial': 1200, Accente: 500 }
const MULT: Record<string, number> = { Gloss: 1, Matte: 1.05, Satin: 1.1, Crom: 1.35, 'Color-Shift': 1.5 }

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useReveal<HTMLDivElement>({ delay })
  return <div ref={ref} className={`reveal ${className}`.trim()}>{children}</div>
}

const ALL_MIN = Math.min(...Object.values(BAZA)) * Math.min(...Object.values(MULT))
const ALL_MAX = Math.max(...Object.values(BAZA)) * Math.max(...Object.values(MULT)) * 1.45

export function EstimatorSection() {
  const [marca, setMarca] = useState('')
  const [serviciu, setServiciu] = useState<typeof SERVICII[number]>('Wrap Complet')
  const [finisaj, setFinisaj] = useState('Gloss')

  const range = useMemo(() => {
    const base = BAZA[serviciu]
    const multiplier = MULT[finisaj]
    return {
      min: Math.round(base * multiplier),
      max: Math.round(base * multiplier * 1.45),
    }
  }, [serviciu, finisaj])

  const barStart = ((range.min - ALL_MIN) / (ALL_MAX - ALL_MIN)) * 100
  const barWidth = Math.max(((range.max - range.min) / (ALL_MAX - ALL_MIN)) * 100, 4)

  return (
    <section id="estimator" className="section section-carbon estimator-section">
      <div className="section-shell">
        <Reveal className="section-heading">
          <p className="eyebrow">06 / ESTIMATOR</p>
          <h2 className="section-title">VEZI DIRECȚIA<br /><span>DE BUGET.</span></h2>
          <p className="body-copy max-w-2xl">Alege o configurație de bază pentru a vedea o plajă orientativă. Oferta finală se stabilește după evaluarea vehiculului.</p>
        </Reveal>

        <Reveal delay={80} className="estimator-reveal">
        <div className="estimator-layout glass">
          <div className="estimator-controls">
            <label className="estimator-field">Marca vehiculului
              <select className="solid" value={marca} onChange={e => setMarca(e.target.value)}>
                <option value="">Selectează marca</option>
                {MARCI.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>

            <fieldset>
              <legend>Serviciu</legend>
              <div className="choice-grid">
                {SERVICII.map(s => <button type="button" key={s} onClick={() => setServiciu(s)} className={serviciu === s ? 'chip choice is-active' : 'chip choice'} aria-pressed={serviciu === s}>{s}</button>)}
              </div>
            </fieldset>

            <fieldset>
              <legend>Finisaj</legend>
              <div className="finish-grid">
                {FINISAJE.map(f => <button type="button" key={f.label} onClick={() => setFinisaj(f.label)} className={finisaj === f.label ? 'chip finish-choice is-active' : 'chip finish-choice'} aria-pressed={finisaj === f.label}><span style={{ background: f.color, borderColor: f.border }} />{f.label}</button>)}
              </div>
            </fieldset>
          </div>

          <aside className="estimator-summary">
            <div className="summary-top"><span>WOB / ESTIMATE</span><Info size={14} /></div>
            <div>
              <span className="summary-label">Configurație</span>
              <strong className="summary-config">{serviciu}</strong>
              <span className="summary-sub">{marca || 'Marca neselectată'} · {finisaj}</span>
            </div>
            <div className="summary-price">
              <span>Plajă orientativă</span>
              <strong><i>€</i>{range.min.toLocaleString('ro-RO')} — <i>€</i>{range.max.toLocaleString('ro-RO')}</strong>
              <div className="summary-bar" aria-hidden="true"><span style={{ left: `${barStart}%`, width: `${barWidth}%` }} /></div>
            </div>
            <p className="summary-note">Calculul este orientativ și nu înlocuiește inspecția vehiculului.</p>
            <MagneticButton variant="accent" size="lg" href="#quote">Cere oferta exactă <ArrowRight size={15} /></MagneticButton>
          </aside>
        </div>
        </Reveal>
      </div>
    </section>
  )
}

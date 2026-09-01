'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Info } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'

const MARCI = ['BMW', 'Mercedes', 'Audi', 'Porsche', 'Range Rover', 'Tesla', 'Ferrari', 'Lamborghini', 'Volkswagen', 'Skoda']
const SERVICII = ['Wrap Complet', 'PPF', 'Wrap Parțial', 'Accente'] as const
const FINISAJE = [
  { label: 'Gloss', color: '#1a1a1a', border: '#444' },
  { label: 'Matte', color: '#2d2d2d', border: '#555' },
  { label: 'Satin', color: '#3a3a3a', border: '#666' },
  { label: 'Crom', color: '#a0a0a0', border: '#ccc' },
  { label: 'Color-Shift', color: 'linear-gradient(135deg,#9B00FF,#00F5FF,#E8FF00)', border: '#E8FF00' },
]
const BAZA: Record<string, number> = { 'Wrap Complet': 2800, PPF: 2000, 'Wrap Parțial': 1200, Accente: 500 }
const MULT: Record<string, number> = { Gloss: 1, Matte: 1.05, Satin: 1.1, Crom: 1.35, 'Color-Shift': 1.5 }

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

  return (
    <section id="estimator" className="section section-carbon estimator-section">
      <div className="section-shell">
        <div className="section-heading">
          <p className="eyebrow">06 / ESTIMATOR</p>
          <h2 className="section-title">VEZI DIRECȚIA<br /><span>DE BUGET.</span></h2>
          <p className="body-copy max-w-2xl">Alege o configurație de bază pentru a vedea o plajă orientativă. Oferta finală se stabilește după evaluarea vehiculului.</p>
        </div>

        <div className="estimator-layout">
          <div className="estimator-controls">
            <label>Marca vehiculului
              <select value={marca} onChange={e => setMarca(e.target.value)}>
                <option value="">Selectează marca</option>
                {MARCI.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>

            <fieldset>
              <legend>Serviciu</legend>
              <div className="choice-grid">
                {SERVICII.map(s => <button type="button" key={s} onClick={() => setServiciu(s)} className={serviciu === s ? 'choice is-active' : 'choice'} aria-pressed={serviciu === s}>{s}</button>)}
              </div>
            </fieldset>

            <fieldset>
              <legend>Finisaj</legend>
              <div className="finish-grid">
                {FINISAJE.map(f => <button type="button" key={f.label} onClick={() => setFinisaj(f.label)} className={finisaj === f.label ? 'finish-choice is-active' : 'finish-choice'} aria-pressed={finisaj === f.label}><span style={{ background: f.color, borderColor: f.border }} />{f.label}</button>)}
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
              <strong>€{range.min.toLocaleString('ro-RO')} — €{range.max.toLocaleString('ro-RO')}</strong>
            </div>
            <p className="summary-note">Calculul este orientativ și nu înlocuiește inspecția vehiculului.</p>
            <MagneticButton variant="accent" size="lg" href="#quote">Cere oferta exactă <ArrowRight size={15} /></MagneticButton>
          </aside>
        </div>
      </div>
    </section>
  )
}

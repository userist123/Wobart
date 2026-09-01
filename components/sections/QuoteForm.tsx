'use client'

import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'

const SERVICII_LISTA = ['Wrap Complet', 'PPF', 'Wrap Parțial', 'Cromate & Accente', 'Wrap Interior']
const FINISAJE_LISTA = ['Gloss Negru', 'Matte Midnight Blue', 'Satin Oțel Periat', 'Ștergere Crom', 'Color-Shift Cameleon']
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serviciu, setServiciu] = useState('')
  const [finisaj, setFinisaj] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState('')
  const [photoNames, setPhotoNames] = useState<string[]>([])

  const validate = (form: HTMLFormElement) => {
    const data = new FormData(form)
    const errs: Record<string, string> = {}
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    if (!name) errs.name = 'Numele este obligatoriu'
    if (!email) errs.email = 'Email-ul este obligatoriu'
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Introdu un email valid'
    if (!phone) errs.phone = 'Numărul de telefon este obligatoriu'
    if (!serviciu) errs.serviciu = 'Alege un serviciu'
    return errs
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setServerError('')
    const form = e.currentTarget
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSubmitting(true)
    try {
      const data = new FormData(form)
      const payload = {
        name: String(data.get('name') ?? '').trim(), email: String(data.get('email') ?? '').trim(), phone: String(data.get('phone') ?? '').trim(),
        car_brand: String(data.get('car_brand') ?? '').trim() || null, car_model: String(data.get('car_model') ?? '').trim() || null, car_year: String(data.get('car_year') ?? '').trim() || null,
        service_type: serviciu, finish_type: finisaj || null, message: String(data.get('message') ?? '').trim() || null, photo_urls: [],
      }
      const response = await fetch(`${API_BASE_URL}/api/contact`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.detail || 'Cererea nu a putut fi trimisă.')
      setSubmitted(true); form.reset(); setServiciu(''); setFinisaj(''); setPhotoNames([])
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Cererea nu a putut fi trimisă.')
    } finally { setSubmitting(false) }
  }

  const Camp = ({ name, label, type = 'text', placeholder = '' }: { name: string; label: string; type?: string; placeholder?: string }) => (
    <div className="quote-field">
      <label htmlFor={name}>{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder} onChange={() => errors[name] && setErrors(prev => { const next = { ...prev }; delete next[name]; return next })} />
      {errors[name] && <p className="quote-error">{errors[name]}</p>}
    </div>
  )

  return (
    <section id="quote" className="quote-section-premium">
      <div className="quote-gridline" aria-hidden="true" />
      <div className="section-shell quote-layout-premium">
        <div className="quote-intro">
          <span className="quote-index">07 / PROJECT BRIEF</span>
          <p className="eyebrow">Contact</p>
          <h2>GATA SĂ<br /><span>TRANSFORMI?</span></h2>
          <p className="body-copy">Trimite-ne direcția proiectului. Îți răspundem cu pașii potriviți pentru mașina ta.</p>
          <ul>{['Consultație gratuită', 'Răspuns în aceeași zi', 'Fără angajament'].map(t => <li key={t}><span aria-hidden="true"><Check size={12} /></span>{t}</li>)}</ul>
          <div className="quote-contact-meta"><span>BUCHAREST / RO</span><span>contact@wobart.ro</span></div>
        </div>

        <div className="quote-form-panel">
          {submitted ? (
            <div className="quote-success" role="status" aria-live="polite">
              <div className="quote-success-mark" aria-hidden="true"><Check size={25} /></div>
              <span className="eyebrow">07 / RECEIVED</span>
              <h3>CERERE<br /><span>ÎNREGISTRATĂ.</span></h3>
              <p>Cererea a ajuns în sistem și poate fi preluată din administrare.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate>
              <div className="quote-form-header"><span>WOB / PROJECT DATA</span><span>01—04</span></div>
              <div className="quote-form-grid"><Camp name="name" label="Nume complet" placeholder="Ion Popescu" /><Camp name="email" label="Email" type="email" placeholder="ion@email.ro" /><Camp name="phone" label="Telefon" type="tel" placeholder="+40 7xx xxx xxx" /></div>
              <div className="quote-form-grid quote-form-grid-car"><Camp name="car_brand" label="Marcă" placeholder="BMW" /><Camp name="car_model" label="Model" placeholder="M4" /><Camp name="car_year" label="An" placeholder="2024" /></div>
              <fieldset><legend>Serviciu dorit</legend><div className="quote-choice-grid">{SERVICII_LISTA.map(s => <button key={s} type="button" onClick={() => { setServiciu(s); setErrors(prev => { const next = { ...prev }; delete next.serviciu; return next }) }} className={serviciu === s ? 'quote-choice is-active' : 'quote-choice'} aria-pressed={serviciu === s}>{s}</button>)}</div>{errors.serviciu && <p className="quote-error">{errors.serviciu}</p>}</fieldset>
              <fieldset><legend>Finisaj dorit</legend><div className="quote-choice-grid quote-finish-grid">{FINISAJE_LISTA.map(f => <button key={f} type="button" onClick={() => setFinisaj(f)} className={finisaj === f ? 'quote-choice is-active' : 'quote-choice'} aria-pressed={finisaj === f}>{f}</button>)}</div></fieldset>
              <div className="quote-field quote-message"><label htmlFor="message">Mesaj</label><textarea id="message" name="message" rows={3} placeholder="Detalii despre vehicul sau direcția dorită..." /></div>
              <div className="quote-upload"><label htmlFor="photos">Fotografii <span>OPȚIONAL</span></label><input id="photos" type="file" accept="image/*" multiple onChange={e => setPhotoNames(Array.from(e.target.files ?? []).map(file => file.name))} />{photoNames.length > 0 && <p>{photoNames.length} fișier(e) selectat(e). Storage-ul foto va fi conectat separat.</p>}</div>
              {serverError && <p className="quote-error" role="alert">{serverError}</p>}
              <div className="quote-submit-row"><span>DATELE SUNT TRATATE CA BRIEF DE PROIECT.</span><MagneticButton variant="accent" size="lg" type="submit" disabled={submitting}>{submitting ? 'SE TRIMITE...' : <>TRIMITE CEREREA <ArrowUpRight size={15} /></>}</MagneticButton></div>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

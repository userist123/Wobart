'use client'

import { useRef, useState } from 'react'
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
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<File[]>([])

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
    if (Object.keys(errs).length > 0) return

    setSubmitting(true)

    try {
      const data = new FormData(form)
      data.set('service_type', serviciu)
      if (finisaj) data.set('finish_type', finisaj)
      files.forEach((file) => data.append('photos', file, file.name))

      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        body: data,
        credentials: 'include',
      })

      const payload = await response.json().catch(() => null)
      if (!response.ok) {
        throw new Error(payload?.detail || 'Cererea nu a putut fi trimisă.')
      }

      setSubmitted(true)
      setErrors({})
      form.reset()
      setServiciu('')
      setFinisaj('')
      setFiles([])
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Cererea nu a putut fi trimisă.')
    } finally {
      setSubmitting(false)
    }
  }

  const addFiles = (incoming: FileList | File[]) => {
    const imageFiles = Array.from(incoming).filter((file) => file.type.startsWith('image/'))
    setFiles((current) => [...current, ...imageFiles].slice(0, 8))
  }

  const Camp = ({ name, label, type = 'text', placeholder = '' }: {
    name: string; label: string; type?: string; placeholder?: string
  }) => (
    <div>
      <label htmlFor={name} className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-2">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-white/10 text-[#F0F0F0] font-sans text-sm py-2.5 focus:outline-none focus:border-[#E8FF00]/60 transition-colors placeholder:text-[#555555]/50"
        onChange={() => errors[name] && setErrors(prev => { const next = { ...prev }; delete next[name]; return next })}
      />
      {errors[name] && <p className="text-[#FF3B30] text-[11px] mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <section id="quote" className="bg-[#111111] py-20 md:py-28 px-5 sm:px-8 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div>
          <p className="font-label text-[11px] tracking-[0.4em] text-[#555555] uppercase mb-4">Contact</p>
          <h2 className="font-display text-[clamp(36px,5vw,72px)] text-[#F0F0F0] leading-[0.9] mb-8 md:mb-10">
            GATA SĂ TRANSFORMI MAȘINA?
          </h2>
          <ul className="space-y-4">
            {['Consultație gratuită', 'Răspuns în aceeași zi', 'Fără angajament', 'Garanție 5 ani la instalare'].map(t => (
              <li key={t} className="flex items-center gap-3 font-sans text-sm text-[#555555]">
                <span className="w-5 h-5 rounded-full bg-[#E8FF00]/10 border border-[#E8FF00]/30 flex items-center justify-center shrink-0" aria-hidden="true">
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#E8FF00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
          <div className="mt-10 md:mt-12 pt-7 md:pt-8 border-t border-white/[0.07]">
            <p className="font-sans text-sm text-[#555555] mb-1">Locație atelier</p>
            <p className="font-label text-sm text-[#F0F0F0] tracking-wide">București, România</p>
            <p className="font-mono text-xs text-[#555555] mt-1">contact@wobart.ro</p>
          </div>
        </div>

        <div>
          {submitted ? (
            <div className="py-16 md:py-20 text-center" role="status" aria-live="polite">
              <div className="w-16 h-16 rounded-full border-2 border-[#E8FF00] flex items-center justify-center mb-6 mx-auto" aria-hidden="true">
                <svg width="28" height="22" viewBox="0 0 28 22" fill="none"><path d="M2 11L10 19L26 3" stroke="#E8FF00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h3 className="font-display text-[40px] text-[#F0F0F0] mb-3">CERERE TRIMISĂ</h3>
              <p className="font-sans text-sm text-[#555555]">Cererea a fost înregistrată și poate fi preluată din zona de administrare.</p>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-6" noValidate>
              <div className="grid grid-cols-1 gap-6">
                <Camp name="name" label="Nume Complet" placeholder="Ion Popescu" />
                <Camp name="email" label="Email" type="email" placeholder="ion@email.ro" />
                <Camp name="phone" label="Telefon" type="tel" placeholder="+40 7xx xxx xxx" />
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <Camp name="car_brand" label="Marcă" placeholder="BMW" />
                <Camp name="car_model" label="Model" placeholder="M4" />
                <Camp name="car_year" label="An" placeholder="2024" />
              </div>

              <div>
                <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-3">Serviciu Dorit</label>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICII_LISTA.map(s => (
                    <button key={s} type="button" onClick={() => { setServiciu(s); setErrors(prev => { const next = { ...prev }; delete next.serviciu; return next }) }} className={`py-2.5 px-3 rounded border font-label text-xs tracking-widest uppercase transition-all ${serviciu === s ? 'border-[#E8FF00] text-[#E8FF00] bg-[#E8FF00]/5' : 'border-white/10 text-[#555555] hover:border-white/20'}`} aria-pressed={serviciu === s}>{s}</button>
                  ))}
                </div>
                {errors.serviciu && <p className="text-[#FF3B30] text-[11px] mt-1">{errors.serviciu}</p>}
              </div>

              <div>
                <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-3">Finisaj Dorit</label>
                <div className="flex flex-wrap gap-2">
                  {FINISAJE_LISTA.map(f => (
                    <button key={f} type="button" onClick={() => setFinisaj(f)} className={`py-2 px-3 rounded border font-label text-xs tracking-widest uppercase transition-all ${finisaj === f ? 'border-[#E8FF00] text-[#E8FF00]' : 'border-white/10 text-[#555555]'}`} aria-pressed={finisaj === f}>{f}</button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-2">Mesaj</label>
                <textarea id="message" name="message" rows={3} placeholder="Detalii suplimentare despre vehicul sau dorințe specifice..." className="w-full bg-transparent border-b border-white/10 text-[#F0F0F0] font-sans text-sm py-2.5 focus:outline-none focus:border-[#E8FF00]/60 transition-colors placeholder:text-[#555555]/50 resize-none" />
              </div>

              <div>
                <label className="block font-label text-[11px] tracking-widest text-[#555555] uppercase mb-2">Fotografii (opțional)</label>
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={e => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }}
                  onClick={() => fileRef.current?.click()}
                  className={`border border-dashed rounded p-5 md:p-6 text-center cursor-pointer transition-colors ${dragging ? 'border-[#E8FF00]/60 bg-[#E8FF00]/5' : 'border-white/10 hover:border-white/20'}`}
                >
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => e.target.files && addFiles(e.target.files)} />
                  <p className="font-sans text-sm text-[#555555]">{files.length ? `${files.length} fotografie${files.length === 1 ? '' : 'i'} selectată${files.length === 1 ? '' : 'e'}` : 'Trage fotografii aici sau apasă pentru a selecta'}</p>
                </div>
              </div>

              {serverError && <p className="text-[#FF3B30] text-sm" role="alert">{serverError}</p>}

              <MagneticButton variant="accent" size="lg" type="submit" className="w-full justify-center" disabled={submitting}>
                {submitting ? 'SE TRIMITE...' : 'TRIMITE CEREREA'}
              </MagneticButton>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

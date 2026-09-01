'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, ChevronLeft, Check } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const benefits = ['Cereri de ofertă online', 'Urmărire status comandă', 'Istoric al lucrărilor']

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((current) => ({ ...current, [key]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.detail || 'Contul nu a putut fi creat.')
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Contul nu a putut fi creat.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#05050A] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_70%_50%,rgba(78,110,255,0.07)_0%,rgba(200,255,0,0.04)_50%,transparent_70%)]" />
        <div className="relative z-10 px-16">
          <Link href="/" className="font-display text-4xl tracking-widest text-[#EEEEFC] block mb-12 text-center">WOB<span className="text-[#C8FF00]">.</span>ART</Link>
          <div className="font-display text-3xl text-[#EEEEFC] mb-6">CONTUL TĂU WOB ART</div>
          <div className="space-y-4">{benefits.map((benefit) => <div key={benefit} className="flex items-center gap-3"><div className="w-5 h-5 rounded-sm bg-[#C8FF00]/10 flex items-center justify-center"><Check size={12} className="text-[#C8FF00]" /></div><span className="text-[#EEEEFC] text-sm">{benefit}</span></div>)}</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-1.5 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors text-sm font-label uppercase tracking-widest mb-10"><ChevronLeft size={14} /> Înapoi la site</Link>
          <div className="flex items-center gap-3 mb-2"><div className="w-6 h-px bg-[#C8FF00]" /><span className="font-label text-xs tracking-[0.3em] uppercase text-[#C8FF00]">Cont nou</span></div>
          <h1 className="font-display text-5xl text-[#EEEEFC] mb-2">ÎNREGISTRARE</h1>
          <p className="text-[#6B6B8A] text-sm mb-8">Ai deja cont? <Link href="/login" className="text-[#C8FF00] hover:underline">Autentifică-te</Link></p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              ['name', 'Nume complet', 'text', 'Ion Popescu'],
              ['email', 'Email', 'email', 'email@exemplu.ro'],
              ['phone', 'Telefon', 'tel', '+40 7xx xxx xxx'],
            ].map(([key, label, type, placeholder]) => <div key={key}><label htmlFor={key} className="font-label text-xs tracking-[0.2em] uppercase text-[#6B6B8A] block mb-2">{label}</label><input id={key} name={key} type={type} value={form[key as keyof typeof form]} onChange={update(key as keyof typeof form)} required={key !== 'phone'} autoComplete={key} placeholder={placeholder} className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors" /></div>)}

            <div>
              <label htmlFor="password" className="font-label text-xs tracking-[0.2em] uppercase text-[#6B6B8A] block mb-2">Parolă</label>
              <div className="relative"><input id="password" name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={update('password')} required minLength={8} autoComplete="new-password" placeholder="Minim 8 caractere" className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors pr-12" /><button type="button" aria-label={showPass ? 'Ascunde parola' : 'Arată parola'} onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B8A]"><>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</></button></div>
            </div>
            {error && <p className="border border-red-400/30 bg-red-400/5 px-3 py-2 text-sm text-red-200" role="alert">{error}</p>}
            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#C8FF00] text-[#05050A] font-label font-bold uppercase tracking-widest text-sm py-4 rounded-sm hover:bg-white transition-all duration-300 disabled:opacity-60">{loading ? <span className="w-4 h-4 border-2 border-[#05050A]/30 border-t-[#05050A] rounded-full animate-spin" /> : <>Creează cont <ArrowRight size={16} /></>}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

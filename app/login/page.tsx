'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowRight, ChevronLeft } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ email: email.trim(), password }) })
      const result = await response.json().catch(() => null)
      if (!response.ok) throw new Error(result?.detail || 'Autentificarea a eșuat.')
      window.location.href = result?.role === 'admin' ? '/admin' : '/dashboard'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Autentificarea a eșuat.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#05050A] flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_70%_at_30%_50%,rgba(200,255,0,0.06)_0%,rgba(78,110,255,0.04)_50%,transparent_70%)]" />
        <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <defs><pattern id="grid-login" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0L0 0 0 40" fill="none" stroke="#C8FF00" strokeWidth="0.5" /></pattern></defs>
          <rect width="100%" height="100%" fill="url(#grid-login)" />
        </svg>
        <div className="relative z-10 px-16 text-center">
          <Link href="/" className="font-display text-4xl tracking-widest text-[#EEEEFC] block mb-12">WOB<span className="text-[#C8FF00]">.</span>ART</Link>
          <div className="relative w-72 h-72 mx-auto mb-12">
            <div className="absolute inset-0 rounded-full border border-[rgba(200,255,0,0.15)] animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute inset-8 rounded-full border border-[rgba(78,110,255,0.12)] animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
            <div className="absolute inset-16 rounded-full border border-[rgba(200,255,0,0.2)]" />
            <div className="absolute inset-0 flex items-center justify-center"><span className="font-display text-7xl text-[#C8FF00]/30">W</span></div>
          </div>
          <p className="text-[#6B6B8A] text-sm leading-relaxed max-w-xs mx-auto">Accesează contul pentru a vedea cererile și comenzile asociate contului tău.</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="w-full max-w-md">
          <Link href="/" className="flex items-center gap-1.5 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors text-sm font-label uppercase tracking-widest mb-10"><ChevronLeft size={14} /> Înapoi la site</Link>
          <div>
            <div className="flex items-center gap-3 mb-2"><div className="w-6 h-px bg-[#C8FF00]" /><span className="font-label text-xs tracking-[0.3em] uppercase text-[#C8FF00]">Autentificare</span></div>
            <h1 className="font-display text-5xl text-[#EEEEFC] mb-2">BUN VENIT</h1>
            <p className="text-[#6B6B8A] text-sm mb-8">Nu ai cont? <Link href="/register" className="text-[#C8FF00] hover:underline">Înregistrează-te</Link></p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="font-label text-xs tracking-[0.2em] uppercase text-[#6B6B8A] block mb-2">Email</label>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" placeholder="email@exemplu.ro" className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors" />
              </div>
              <div>
                <label htmlFor="password" className="font-label text-xs tracking-[0.2em] uppercase text-[#6B6B8A] block mb-2">Parolă</label>
                <div className="relative">
                  <input id="password" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" placeholder="••••••••" className="w-full bg-[#0C0C14] border border-[rgba(255,255,255,0.07)] rounded-sm px-4 py-3.5 text-[#EEEEFC] placeholder-[#6B6B8A] text-sm focus:outline-none focus:border-[#C8FF00]/40 transition-colors pr-12" />
                  <button type="button" aria-label={showPass ? 'Ascunde parola' : 'Arată parola'} onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B8A] hover:text-[#EEEEFC] transition-colors">{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div className="flex justify-end"><span className="font-label text-xs tracking-wider text-[#6B6B8A] uppercase">Resetarea parolei necesită configurarea serviciului de email.</span></div>
              {error && <p className="border border-red-400/30 bg-red-400/5 px-3 py-2 text-sm text-red-200" role="alert">{error}</p>}
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#C8FF00] text-[#05050A] font-label font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm hover:bg-white transition-all duration-300 disabled:opacity-60">{loading ? <span className="w-4 h-4 border-2 border-[#05050A]/30 border-t-[#05050A] rounded-full animate-spin" /> : <>Intră în cont <ArrowRight size={16} /></>}</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

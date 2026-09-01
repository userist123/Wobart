'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Check, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SiteContent, TransformationContent } from '@/lib/site-content'

async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.error || body?.detail || `Request failed (${response.status})`)
  return body as T
}

export default function TransformationsStudioPage() {
  const router = useRouter()
  const [content, setContent] = useState<SiteContent | null>(null)
  const [busy, setBusy] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    void api<SiteContent>('/api/admin/content')
      .then(setContent)
      .catch((e: unknown) => {
        const text = e instanceof Error ? e.message : 'Nu s-a putut încărca conținutul.'
        setError(text)
        if (/unauthorized|authenticated/i.test(text)) router.replace('/login')
      })
      .finally(() => setBusy(false))
  }, [router])

  function update(items: TransformationContent[]) {
    setContent(current => current ? { ...current, home: { ...current.home, transformations: items } } : current)
  }

  async function save() {
    if (!content) return
    setSaving(true); setError(''); setMessage('')
    try {
      const result = await api<{ version: number }>('/api/admin/content', {
        method: 'PUT',
        body: JSON.stringify(content),
      })
      setMessage(`Draft salvat · versiunea ${result.version}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Salvarea a eșuat.')
    } finally { setSaving(false) }
  }

  if (busy) return <main className="min-h-screen grid place-items-center bg-[#070812] text-white/50"><Loader2 className="animate-spin" /></main>
  if (!content) return <main className="min-h-screen grid place-items-center bg-[#070812] text-red-300">{error || 'Indisponibil.'}</main>

  const items = [...(content.home.transformations ?? [])].sort((a, b) => a.sortOrder - b.sortOrder)

  return <main className="min-h-screen bg-[#070812] text-white">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#070812]/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-4 md:px-8">
        <button onClick={() => router.push('/admin/website')} className="rounded-xl border border-white/10 p-2 text-white/55 hover:text-white" aria-label="Înapoi">
          <ArrowLeft size={17} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-[.24em] text-[#E8FF00]/60">WOB ART / WEBSITE / CMS</div>
          <h1 className="font-display text-2xl tracking-wide">Before / After</h1>
        </div>
        <button disabled={saving} onClick={() => void save()} className="flex items-center gap-2 rounded-xl bg-[#E8FF00] px-4 py-2.5 text-xs font-semibold text-black disabled:opacity-50">
          <Save size={14} /> Save draft
        </button>
      </div>
    </header>

    <div className="mx-auto max-w-[1400px] p-4 md:p-8">
      {(message || error) && <div className={`mb-6 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/20 bg-red-400/5 text-red-300' : 'border-[#E8FF00]/20 bg-[#E8FF00]/5 text-[#E8FF00]'}`}>
        {error ? error : <><Check size={15} />{message}</>}
      </div>}

      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[.24em] text-[#E8FF00]/60">03 / TRANSFORMARE</p>
        <h2 className="mt-2 font-display text-4xl md:text-5xl">Transformări vizuale</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45">Gestionează perechile Before / After care apar pe homepage. Modificările sunt salvate ca draft și intră în producție doar după Publish.</p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => <article key={item.id} className="rounded-2xl border border-white/10 bg-[#0D0F17] p-5 md:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="font-mono text-xs text-white/30">#{index + 1}</span>
            <input value={item.label} onChange={e => update(items.map(x => x.id === item.id ? { ...x, label: e.target.value } : x))} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5 text-sm outline-none focus:border-[#E8FF00]/50" aria-label="Etichetă transformare" />
            <button onClick={() => update(items.filter(x => x.id !== item.id))} className="rounded-lg p-2 text-white/30 hover:text-red-300" aria-label="Șterge transformarea"><Trash2 size={16} /></button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2"><span className="text-[10px] uppercase tracking-[.22em] text-white/35">Before image URL</span><input value={item.before} onChange={e => update(items.map(x => x.id === item.id ? { ...x, before: e.target.value } : x))} className="w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm outline-none focus:border-[#E8FF00]/50" /></label>
            <label className="space-y-2"><span className="text-[10px] uppercase tracking-[.22em] text-white/35">After image URL</span><input value={item.after} onChange={e => update(items.map(x => x.id === item.id ? { ...x, after: e.target.value } : x))} className="w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm outline-none focus:border-[#E8FF00]/50" /></label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-2 gap-3">
              <div className="overflow-hidden rounded-xl border border-white/8 bg-black"><img src={item.before} alt={`Before: ${item.label}`} className="aspect-video h-full w-full object-cover" loading="lazy" /></div>
              <div className="overflow-hidden rounded-xl border border-white/8 bg-black"><img src={item.after} alt={`After: ${item.label}`} className="aspect-video h-full w-full object-cover" loading="lazy" /></div>
            </div>
            <label className="flex items-center gap-2 self-start rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50"><input type="checkbox" checked={item.active} onChange={e => update(items.map(x => x.id === item.id ? { ...x, active: e.target.checked } : x))} /> Activ
            </label>
          </div>
        </article>)}
      </div>

      <button onClick={() => update([...items, { id: `transformation-${Date.now()}`, before: '', after: '', label: 'Transformare nouă', active: true, sortOrder: items.length }])} className="mt-5 flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-xs text-white/60 hover:border-[#E8FF00]/30 hover:text-[#E8FF00]">
        <Plus size={14} /> Adaugă transformare
      </button>
    </div>
  </main>
}

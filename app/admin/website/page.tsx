'use client'

import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Check, Clock3, ExternalLink, Image as ImageIcon, Loader2, RotateCcw, Save, Search, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { SiteContent } from '@/lib/site-content'

type Version = { version: number; status: 'draft' | 'published'; createdAt: string; createdBy?: string; publishedAt?: string; publishedBy?: string; restoredFrom?: number }
type MediaAsset = { _id: string; name: string; url: string; alt: string; createdAt?: string; createdBy?: string }

async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) } })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.error || body?.detail || `Request failed (${response.status})`)
  return body as T
}

function Field({ label, value, onChange, area = false }: { label: string; value: string; onChange: (value: string) => void; area?: boolean }) {
  return <label className="block space-y-2"><span className="text-[10px] uppercase tracking-[.22em] text-white/35">{label}</span>{area ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={5} className="w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm text-white outline-none focus:border-[#E8FF00]/50" /> : <input value={value} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm text-white outline-none focus:border-[#E8FF00]/50" />}</label>
}

export default function WebsiteStudioPage() {
  const router = useRouter()
  const [content, setContent] = useState<SiteContent | null>(null)
  const [versions, setVersions] = useState<Version[]>([])
  const [media, setMedia] = useState<MediaAsset[]>([])
  const [tab, setTab] = useState<'content' | 'history' | 'media'>('content')
  const [section, setSection] = useState<'global' | 'hero' | 'statement' | 'process' | 'reviews' | 'cta' | 'seo'>('global')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [mediaQuery, setMediaQuery] = useState('')
  const [mediaForm, setMediaForm] = useState({ name: '', url: '', alt: '' })

  async function load() {
    setLoading(true); setError('')
    try {
      const [site, history, assets] = await Promise.all([
        api<SiteContent>('/api/admin/content'),
        api<{ versions: Version[] }>('/api/admin/content/history'),
        api<{ assets: MediaAsset[] }>('/api/admin/media'),
      ])
      setContent(site); setVersions(history.versions); setMedia(assets.assets)
    } catch (e) {
      const text = e instanceof Error ? e.message : 'Nu s-a putut încărca Website Studio.'
      setError(text)
      if (/unauthorized|authenticated/i.test(text)) router.replace('/login')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])
  const filteredMedia = useMemo(() => { const q = mediaQuery.trim().toLowerCase(); return q ? media.filter(x => `${x.name} ${x.alt} ${x.url}`.toLowerCase().includes(q)) : media }, [media, mediaQuery])

  const patchHome = (patch: Partial<SiteContent['home']>) => setContent(v => v ? { ...v, home: { ...v.home, ...patch } } : v)
  const patchGlobal = (patch: Partial<SiteContent['global']>) => setContent(v => v ? { ...v, global: { ...v.global, ...patch } } : v)
  const patchSeo = (patch: Partial<SiteContent['seo']>) => setContent(v => v ? { ...v, seo: { ...v.seo, ...patch } } : v)

  async function save() {
    if (!content) return; setBusy(true); setError(''); setMessage('')
    try { const result = await api<{ version: number }>('/api/admin/content', { method: 'PUT', body: JSON.stringify(content) }); setMessage(`Draft salvat · versiunea ${result.version}`); await load() }
    catch (e) { setError(e instanceof Error ? e.message : 'Salvarea a eșuat.') } finally { setBusy(false) }
  }
  async function publish() {
    setBusy(true); setError(''); setMessage('')
    try { await api('/api/admin/content', { method: 'POST', body: JSON.stringify({ action: 'publish' }) }); setMessage('Versiunea curentă este publicată.'); await load() }
    catch (e) { setError(e instanceof Error ? e.message : 'Publicarea a eșuat.') } finally { setBusy(false) }
  }
  async function restore(version: number) {
    if (!confirm(`Restaurezi versiunea ${version} ca draft nou?`)) return
    setBusy(true); setError(''); setMessage('')
    try { const result = await api<{ version: number }>('/api/admin/content/history', { method: 'POST', body: JSON.stringify({ version }) }); setMessage(`Versiunea ${version} a fost restaurată ca draft ${result.version}.`); setTab('content'); await load() }
    catch (e) { setError(e instanceof Error ? e.message : 'Restaurarea a eșuat.') } finally { setBusy(false) }
  }
  async function addMedia() {
    if (!mediaForm.name.trim() || !mediaForm.url.trim()) return
    setBusy(true); setError('')
    try { await api('/api/admin/media', { method: 'POST', body: JSON.stringify(mediaForm) }); setMediaForm({ name: '', url: '', alt: '' }); setMessage('Asset media adăugat.'); await load() }
    catch (e) { setError(e instanceof Error ? e.message : 'Asset-ul nu a putut fi adăugat.') } finally { setBusy(false) }
  }

  if (loading && !content) return <main className="min-h-screen grid place-items-center bg-[#070812] text-white/50"><Loader2 className="animate-spin" /></main>
  if (!content) return <main className="min-h-screen grid place-items-center bg-[#070812] text-red-300">{error || 'Website Studio indisponibil.'}</main>

  const sections = [
    ['global', 'Identitate'], ['hero', 'Hero'], ['statement', 'Statement'], ['process', 'Proces'], ['reviews', 'Reviews'], ['cta', 'CTA'], ['seo', 'SEO'],
  ] as const

  return <main className="min-h-screen bg-[#070812] text-white"><header className="sticky top-0 z-20 border-b border-white/10 bg-[#070812]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-4 md:px-8"><button onClick={() => router.push('/admin')} className="rounded-xl border border-white/10 p-2 text-white/55 hover:text-white"><ArrowLeft size={17} /></button><div className="min-w-0 flex-1"><div className="text-[10px] uppercase tracking-[.24em] text-[#E8FF00]/60">WOB ART / WEBSITE</div><h1 className="font-display text-2xl tracking-wide">Website Studio</h1></div><a href="/" target="_blank" rel="noreferrer" className="hidden items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/55 hover:text-white md:flex">Preview <ExternalLink size={14} /></a><button disabled={busy} onClick={() => void save()} className="flex items-center gap-2 rounded-xl border border-[#E8FF00]/25 bg-[#E8FF00]/10 px-3 py-2 text-xs text-[#E8FF00] disabled:opacity-50"><Save size={14} /> Save draft</button><button disabled={busy} onClick={() => void publish()} className="rounded-xl bg-[#E8FF00] px-3 py-2 text-xs font-semibold text-black disabled:opacity-50">Publish</button></div></header>
    <div className="mx-auto max-w-[1600px] p-4 md:p-8">{(error || message) && <div className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/20 bg-red-400/5 text-red-300' : 'border-[#E8FF00]/20 bg-[#E8FF00]/5 text-[#E8FF00]'}`}>{error || message}<button onClick={() => { setError(''); setMessage('') }}><X size={15} /></button></div>}
      <div className="mb-6 flex gap-2 overflow-x-auto border-b border-white/10 pb-3"><button onClick={() => setTab('content')} className={`px-3 py-2 text-sm ${tab === 'content' ? 'text-[#E8FF00]' : 'text-white/45'}`}>Content</button><button onClick={() => setTab('history')} className={`px-3 py-2 text-sm ${tab === 'history' ? 'text-[#E8FF00]' : 'text-white/45'}`}>History ({versions.length})</button><button onClick={() => setTab('media')} className={`px-3 py-2 text-sm ${tab === 'media' ? 'text-[#E8FF00]' : 'text-white/45'}`}>Media ({media.length})</button></div>
      {tab === 'history' && <section className="rounded-2xl border border-white/10 bg-[#0D0F17] p-5"><div className="mb-5 flex items-center gap-2"><Clock3 size={17} className="text-[#E8FF00]" /><h2 className="font-display text-2xl">Version history</h2></div><div className="space-y-2">{versions.map(v => <div key={v.version} className="flex flex-wrap items-center gap-4 rounded-xl border border-white/8 bg-white/[.02] p-4"><span className="font-mono text-xs text-white/40">v{v.version}</span><span className={`rounded-full px-2 py-1 text-[10px] uppercase ${v.status === 'published' ? 'bg-[#E8FF00]/10 text-[#E8FF00]' : 'bg-white/8 text-white/45'}`}>{v.status}</span><span className="text-sm text-white/60">{new Date(v.createdAt).toLocaleString('ro-RO')}</span><span className="text-xs text-white/30">{v.createdBy || 'system'}{v.restoredFrom ? ` · restored from v${v.restoredFrom}` : ''}</span><button onClick={() => void restore(v.version)} disabled={busy} className="ml-auto flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/60 hover:text-white"><RotateCcw size={13} /> Restore draft</button></div>)}</div></section>}
      {tab === 'media' && <section className="space-y-5"><div className="rounded-2xl border border-white/10 bg-[#0D0F17] p-5"><h2 className="font-display text-2xl">Media library</h2><p className="mt-1 text-sm text-white/40">Metadata și URL-uri gestionate din CMS. Upload binary rămâne separat până la alegerea storage-ului.</p><div className="mt-5 grid gap-3 md:grid-cols-3"><Field label="Nume" value={mediaForm.name} onChange={v => setMediaForm(x => ({ ...x, name: v }))} /><Field label="URL" value={mediaForm.url} onChange={v => setMediaForm(x => ({ ...x, url: v }))} /><Field label="Alt text" value={mediaForm.alt} onChange={v => setMediaForm(x => ({ ...x, alt: v }))} /></div><button onClick={() => void addMedia()} disabled={busy} className="mt-4 flex items-center gap-2 rounded-xl bg-[#E8FF00] px-4 py-2.5 text-xs font-semibold text-black"><Upload size={14} /> Add asset</button></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0D0F17] px-3"><Search size={15} className="text-white/30" /><input value={mediaQuery} onChange={e => setMediaQuery(e.target.value)} placeholder="Caută în media..." className="w-full bg-transparent py-3 text-sm outline-none" /></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{filteredMedia.map(asset => <article key={asset._id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D0F17]"><div className="aspect-[4/3] bg-black"><img src={asset.url} alt={asset.alt} className="h-full w-full object-cover" loading="lazy" onError={e => { e.currentTarget.style.display = 'none' }} /></div><div className="p-3"><div className="truncate text-sm">{asset.name}</div><div className="mt-1 truncate text-xs text-white/35">{asset.url}</div></div></article>)}</div></section>}
      {tab === 'content' && <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"><aside className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">{sections.map(([id, label]) => <button key={id} onClick={() => setSection(id)} className={`whitespace-nowrap rounded-xl px-3 py-2.5 text-left text-sm lg:block lg:w-full ${section === id ? 'bg-[#E8FF00]/10 text-[#E8FF00]' : 'text-white/45 hover:bg-white/[.04] hover:text-white'}`}>{label}</button>)}</aside><section className="rounded-2xl border border-white/10 bg-[#0D0F17] p-5 md:p-7">
        {section === 'global' && <div className="grid gap-5 md:grid-cols-2"><Field label="Brand name" value={content.global.brandName} onChange={v => patchGlobal({ brandName: v })} /><Field label="Tagline" value={content.global.tagline} onChange={v => patchGlobal({ tagline: v })} /><Field label="Telefon" value={content.global.phone} onChange={v => patchGlobal({ phone: v })} /><Field label="Email" value={content.global.email} onChange={v => patchGlobal({ email: v })} /><Field label="Adresă" value={content.global.address} onChange={v => patchGlobal({ address: v })} /><Field label="Oraș" value={content.global.city} onChange={v => patchGlobal({ city: v })} /><Field label="Instagram" value={content.global.instagramUrl} onChange={v => patchGlobal({ instagramUrl: v })} /><Field label="Facebook" value={content.global.facebookUrl} onChange={v => patchGlobal({ facebookUrl: v })} /><Field label="Program" value={content.global.openingHours} onChange={v => patchGlobal({ openingHours: v })} /></div>}
        {section === 'hero' && <div className="space-y-5"><Field label="Eyebrow" value={content.home.hero.eyebrow} onChange={v => patchHome({ hero: { ...content.home.hero, eyebrow: v } })} /><Field label="Titlu" value={content.home.hero.title} onChange={v => patchHome({ hero: { ...content.home.hero, title: v } })} area /><Field label="Descriere" value={content.home.hero.description} onChange={v => patchHome({ hero: { ...content.home.hero, description: v } })} area /><div className="grid gap-5 md:grid-cols-2"><Field label="CTA principal" value={content.home.hero.primaryCtaLabel} onChange={v => patchHome({ hero: { ...content.home.hero, primaryCtaLabel: v } })} /><Field label="CTA principal href" value={content.home.hero.primaryCtaHref} onChange={v => patchHome({ hero: { ...content.home.hero, primaryCtaHref: v } })} /><Field label="CTA secundar" value={content.home.hero.secondaryCtaLabel} onChange={v => patchHome({ hero: { ...content.home.hero, secondaryCtaLabel: v } })} /><Field label="CTA secundar href" value={content.home.hero.secondaryCtaHref} onChange={v => patchHome({ hero: { ...content.home.hero, secondaryCtaHref: v } })} /><Field label="Imagine hero" value={content.home.hero.imageUrl} onChange={v => patchHome({ hero: { ...content.home.hero, imageUrl: v } })} /><Field label="Video hero" value={content.home.hero.videoUrl} onChange={v => patchHome({ hero: { ...content.home.hero, videoUrl: v } })} /></div></div>}
        {section === 'statement' && <div className="space-y-5"><Field label="Eyebrow" value={content.home.statement.eyebrow} onChange={v => patchHome({ statement: { ...content.home.statement, eyebrow: v } })} /><Field label="Titlu" value={content.home.statement.title} onChange={v => patchHome({ statement: { ...content.home.statement, title: v } })} area /><Field label="Body" value={content.home.statement.body} onChange={v => patchHome({ statement: { ...content.home.statement, body: v } })} area /></div>}
        {section === 'process' && <div className="space-y-5"><Field label="Eyebrow" value={content.home.processIntro.eyebrow} onChange={v => patchHome({ processIntro: { ...content.home.processIntro, eyebrow: v } })} /><Field label="Titlu" value={content.home.processIntro.title} onChange={v => patchHome({ processIntro: { ...content.home.processIntro, title: v } })} /><Field label="Descriere" value={content.home.processIntro.body} onChange={v => patchHome({ processIntro: { ...content.home.processIntro, body: v } })} area /><div><div className="mb-2 text-[10px] uppercase tracking-[.22em] text-white/35">Etape</div>{content.home.processSteps.map((step, i) => <div key={i} className="mb-2 flex gap-2"><input value={step} onChange={e => patchHome({ processSteps: content.home.processSteps.map((x, j) => j === i ? e.target.value : x) })} className="w-full rounded-xl border border-white/10 bg-white/[.03] p-3 text-sm" /><button onClick={() => patchHome({ processSteps: content.home.processSteps.filter((_, j) => j !== i) })} className="px-2 text-white/30"><X size={15} /></button></div>)}<button onClick={() => patchHome({ processSteps: [...content.home.processSteps, 'Etapă nouă'] })} className="text-xs text-[#E8FF00]">+ Adaugă etapă</button></div></div>}
        {section === 'reviews' && <div className="space-y-3">{content.home.reviews.map((review, i) => <div key={i} className="grid gap-3 rounded-xl border border-white/8 p-4 md:grid-cols-2"><Field label="Nume" value={review.name} onChange={v => patchHome({ reviews: content.home.reviews.map((x,j) => j===i ? {...x,name:v} : x) })} /><Field label="Mașină" value={review.car} onChange={v => patchHome({ reviews: content.home.reviews.map((x,j) => j===i ? {...x,car:v} : x) })} /><Field label="Dată" value={review.date} onChange={v => patchHome({ reviews: content.home.reviews.map((x,j) => j===i ? {...x,date:v} : x) })} /><Field label="Stars" value={String(review.stars)} onChange={v => patchHome({ reviews: content.home.reviews.map((x,j) => j===i ? {...x,stars:Number(v)} : x) })} /><Field label="Review" value={review.quote} onChange={v => patchHome({ reviews: content.home.reviews.map((x,j) => j===i ? {...x,quote:v} : x) })} area /><button onClick={() => patchHome({ reviews: content.home.reviews.filter((_,j) => j!==i) })} className="text-left text-xs text-red-300">Șterge review</button></div>)}<button onClick={() => patchHome({ reviews: [...content.home.reviews, { name: '', car: '', date: '', quote: '', stars: 5 }] })} className="text-xs text-[#E8FF00]">+ Adaugă review</button></div>}
        {section === 'cta' && <div className="space-y-5"><Field label="Eyebrow" value={content.home.cta.eyebrow} onChange={v => patchHome({ cta: { ...content.home.cta, eyebrow: v } })} /><Field label="Titlu" value={content.home.cta.title} onChange={v => patchHome({ cta: { ...content.home.cta, title: v } })} area /><Field label="Body" value={content.home.cta.body} onChange={v => patchHome({ cta: { ...content.home.cta, body: v } })} area /><div className="grid gap-5 md:grid-cols-2"><Field label="Buton" value={content.home.cta.buttonLabel} onChange={v => patchHome({ cta: { ...content.home.cta, buttonLabel: v } })} /><Field label="Buton href" value={content.home.cta.buttonHref} onChange={v => patchHome({ cta: { ...content.home.cta, buttonHref: v } })} /></div></div>}
        {section === 'seo' && <div className="space-y-5"><Field label="Title" value={content.seo.title} onChange={v => patchSeo({ title: v })} /><Field label="Description" value={content.seo.description} onChange={v => patchSeo({ description: v })} area /><Field label="Canonical URL" value={content.seo.canonicalUrl} onChange={v => patchSeo({ canonicalUrl: v })} /><Field label="OG image" value={content.seo.ogImageUrl} onChange={v => patchSeo({ ogImageUrl: v })} /></div>}
      </section></div>}
    </div></main>
}

'use client'

import { useEffect, useRef, useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Bell, CheckCircle2, ChevronRight, ClipboardList, Globe2, LayoutDashboard, LogOut, Menu, Palette, PenSquare, Plus, RefreshCw, Save, Search, Settings2, ShieldCheck, Trash2, Users, X, Image as ImageIcon } from 'lucide-react'
import type { PortfolioContent, ServiceContent, SiteContent } from '@/lib/site-content'

type OrderStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'COMPLETED'
type ContactStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST' | 'ARCHIVED'
type Tab = 'overview' | 'leads' | 'orders' | 'clients' | 'website' | 'settings'
type WebsiteSection = 'global' | 'hero' | 'services' | 'portfolio' | 'seo' | 'theme'

type Order = { id: string; order_number: string; user_name: string; user_email: string; car_brand: string; car_model: string; car_year: number; car_plate?: string | null; service_type: string; finish_type?: string | null; description?: string | null; preferred_date?: string | null; status: OrderStatus; estimated_price?: number | null; notes?: string | null; created_at: string; updated_at: string }
type ContactRequest = { id: string; name: string; email: string; phone: string; car_brand?: string | null; car_model?: string | null; car_year?: string | null; service_type: string; finish_type?: string | null; message?: string | null; status: ContactStatus; created_at: string }
type User = { id: string; name: string; email: string; phone?: string; role: string; created_at: string }
type Stats = { total_orders: number; pending_orders: number; total_users: number; total_contacts: number }

const emptyService: ServiceContent = { id: '', name: '', slug: '', eyebrow: '', description: '', benefits: [], process: [], materials: [], imageUrl: '', active: true, sortOrder: 0 }
const emptyPortfolio: PortfolioContent = { id: '', title: '', slug: '', vehicle: '', service: '', material: '', finish: '', description: '', coverUrl: '', gallery: [], featured: false, active: true, sortOrder: 0 }

async function api<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(path, { ...options, credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) } })
  const body = await response.json().catch(() => null)
  if (!response.ok) throw new Error(body?.detail || body?.error || `Request failed (${response.status})`)
  return body as T
}

function Field({ label, value, onChange, multiline = false }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
  return <label className="block space-y-2"><span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{label}</span>{multiline ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={5} className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 text-sm leading-6 text-white outline-none focus:border-[#E8FF00]/50" /> : <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-3.5 py-3 text-sm text-white outline-none focus:border-[#E8FF00]/50" />}</label>
}

function ArrayEditor({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')
  return <div className="space-y-3"><div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-[0.22em] text-white/35">{label}</span><span className="font-mono text-[10px] text-white/20">{values.length}</span></div><div className="flex gap-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = draft.trim(); if (v) onChange([...values, v]); setDraft('') } }} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2.5 text-sm text-white outline-none focus:border-[#E8FF00]/50" placeholder="Adaugă..." /><button type="button" onClick={() => { const v = draft.trim(); if (!v) return; onChange([...values, v]); setDraft('') }} className="rounded-xl border border-[#E8FF00]/20 bg-[#E8FF00]/10 px-3 text-[#E8FF00]"><Plus size={14} /></button></div>{values.map((v, i) => <div key={`${v}-${i}`} className="group flex items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-3 py-2"><span className="font-mono text-[10px] text-white/20">{i + 1}</span><span className="flex-1 text-sm text-white/70">{v}</span><button type="button" onClick={() => onChange(values.filter((_, x) => x !== i))} className="text-white/20 opacity-0 group-hover:opacity-100 hover:text-red-300"><Trash2 size={13} /></button></div>)}</div>
}

function Panel({ eyebrow, title, action, children }: { eyebrow: string; title: string; action?: ReactNode; children: ReactNode }) {
  return <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0D0F17]/90 shadow-[0_22px_70px_rgba(0,0,0,0.25)]"><div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4 md:px-6"><div><div className="text-[10px] uppercase tracking-[0.24em] text-[#E8FF00]/65">{eyebrow}</div><h2 className="mt-1 font-display text-2xl tracking-wide text-white">{title}</h2></div>{action}</div><div className="p-5 md:p-6">{children}</div></section>
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [websiteSection, setWebsiteSection] = useState<WebsiteSection>('global')
  const [mobileNav, setMobileNav] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [query, setQuery] = useState('')
  const [stats, setStats] = useState<Stats>({ total_orders: 0, pending_orders: 0, total_users: 0, total_contacts: 0 })
  const [orders, setOrders] = useState<Order[]>([])
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [content, setContent] = useState<SiteContent | null>(null)
  const [selectedService, setSelectedService] = useState(0)
  const [selectedPortfolio, setSelectedPortfolio] = useState(0)

  async function load() {
    setLoading(true); setError('')
    try {
      const [s, o, c, u, site] = await Promise.all([
        api<Stats>('/api/admin/stats'), api<Order[]>('/api/admin/orders'), api<ContactRequest[]>('/api/admin/contact-requests'), api<User[]>('/api/admin/users'), api<SiteContent>('/api/admin/content'),
      ])
      setStats(s); setOrders(o); setContacts(c); setUsers(u); setContent(site)
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Nu s-au putut încărca datele.'
      setError(message)
      if (message.toLowerCase().includes('unauthorized') || message.toLowerCase().includes('authenticated')) router.replace('/login')
    } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [])

  const filteredOrders = useMemo(() => { const n = query.trim().toLowerCase(); return !n ? orders : orders.filter((o) => [o.order_number, o.user_name, o.user_email, o.car_brand, o.car_model, o.service_type].join(' ').toLowerCase().includes(n)) }, [orders, query])
  const filteredContacts = useMemo(() => { const n = query.trim().toLowerCase(); return !n ? contacts : contacts.filter((c) => [c.name, c.email, c.phone, c.car_brand, c.car_model, c.service_type].join(' ').toLowerCase().includes(n)) }, [contacts, query])

  function setSite(patch: Partial<SiteContent>) { setContent((prev) => prev ? { ...prev, ...patch } : prev) }
  async function saveContent() {
    if (!content) return
    setSaving(true); setError(''); setNotice('')
    try { const r = await api<{ ok: boolean; updatedAt: string }>('/api/admin/content', { method: 'PUT', body: JSON.stringify(content) }); setNotice(`Draft salvat · ${new Date(r.updatedAt).toLocaleString('ro-RO')}`) }
    catch (e) { setError(e instanceof Error ? e.message : 'Salvarea a eșuat.') }
    finally { setSaving(false) }
  }
  async function updateContact(item: ContactRequest, status: ContactStatus) {
    try { await api(`/api/admin/contact-requests/${item.id}?status=${encodeURIComponent(status)}`, { method: 'PATCH' }); setContacts((v) => v.map((x) => x.id === item.id ? { ...x, status } : x)) } catch (e) { setError(e instanceof Error ? e.message : 'Actualizarea a eșuat.') }
  }
  async function updateOrder(order: Order, patch: { status?: OrderStatus; estimated_price?: number | null }) {
    try { const updated = await api<Order>(`/api/admin/orders/${encodeURIComponent(order.order_number)}`, { method: 'PATCH', body: JSON.stringify(patch) }); setOrders((v) => v.map((x) => x.order_number === updated.order_number ? updated : x)) } catch (e) { setError(e instanceof Error ? e.message : 'Actualizarea a eșuat.') }
  }
  async function logout() { try { await api('/api/auth/logout', { method: 'POST' }) } finally { router.replace('/login') } }

  if (loading && !content) return <div className="min-h-screen bg-[#070812] text-white grid place-items-center"><div className="flex items-center gap-3 text-white/50"><RefreshCw size={16} className="animate-spin" /> Se încarcă WOB ART Control...</div></div>

  const nav: Array<{ id: Tab; label: string; icon: typeof LayoutDashboard }> = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard }, { id: 'leads', label: 'Lead-uri', icon: Bell }, { id: 'orders', label: 'Comenzi', icon: ClipboardList }, { id: 'clients', label: 'Clienți', icon: Users }, { id: 'website', label: 'Website Studio', icon: Globe2 }, { id: 'settings', label: 'Sistem', icon: Settings2 },
  ]
  const websiteNav: Array<{ id: WebsiteSection; label: string; icon: typeof PenSquare }> = [
    { id: 'global', label: 'Identitate & Contact', icon: PenSquare }, { id: 'hero', label: 'Homepage / Hero', icon: ImageIcon }, { id: 'services', label: 'Servicii', icon: ClipboardList }, { id: 'portfolio', label: 'Portfolio', icon: Globe2 }, { id: 'seo', label: 'SEO & Sharing', icon: Activity }, { id: 'theme', label: 'Theme & Motion', icon: Palette },
  ]
  const currentService = content?.services[selectedService] ?? emptyService
  const currentPortfolio = content?.portfolio[selectedPortfolio] ?? emptyPortfolio

  return <div className="min-h-screen bg-[#070812] text-white"><div className="pointer-events-none fixed inset-0 opacity-60 [background:radial-gradient(circle_at_top_right,rgba(232,255,0,0.045),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(79,70,229,0.06),transparent_34%)]" /><div className="relative flex min-h-screen">
    <aside className={`fixed inset-y-0 left-0 z-40 w-[280px] border-r border-white/8 bg-[#080A12]/95 backdrop-blur-2xl transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${mobileNav ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-full flex-col"><div className="flex items-center justify-between border-b border-white/8 px-5 py-5"><span className="font-display text-2xl tracking-[0.12em]">WOB<span className="text-[#E8FF00]">.</span>ART</span><button className="lg:hidden text-white/50" onClick={() => setMobileNav(false)}><X size={18} /></button></div><div className="px-4 py-4"><div className="rounded-2xl border border-[#E8FF00]/12 bg-[#E8FF00]/[0.03] p-3"><div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#E8FF00]"><ShieldCheck size={13} /> Production Control</div><div className="mt-2 text-sm text-white/60">Administrare reală pentru conținut și operațiuni.</div></div></div><nav className="flex-1 px-3">{nav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => { if (id === 'website') { router.push('/admin/website'); return }; setTab(id); setMobileNav(false); setError(''); setNotice('') }} className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${tab === id ? 'bg-[#E8FF00]/10 text-[#E8FF00]' : 'text-white/50 hover:bg-white/[0.04] hover:text-white'}`}><Icon size={17} /><span className="text-sm">{label}</span>{id === 'leads' && stats.total_contacts > 0 && <span className="ml-auto rounded-full bg-white/8 px-2 py-0.5 font-mono text-[10px]">{stats.total_contacts}</span>}</button>)}</nav><div className="border-t border-white/8 p-3"><button onClick={() => void logout()} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/45 hover:bg-red-400/5 hover:text-red-300"><LogOut size={17} /> Ieșire</button></div></div>
    </aside>
    <main className="min-w-0 flex-1"><header className="sticky top-0 z-30 border-b border-white/8 bg-[#070812]/80 backdrop-blur-2xl"><div className="flex items-center gap-3 px-4 py-3 md:px-6"><button className="lg:hidden rounded-xl border border-white/10 p-2 text-white/60" onClick={() => setMobileNav(true)}><Menu size={18} /></button><div className="min-w-0 flex-1"><div className="text-[10px] uppercase tracking-[0.22em] text-white/25">WOB ART CONTROL</div><div className="truncate font-display text-xl tracking-wide">{nav.find((x) => x.id === tab)?.label}</div></div><button onClick={() => void load()} className="rounded-xl border border-white/10 p-2 text-white/45 hover:text-white"><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button></div></header>
      <div className="mx-auto max-w-[1750px] space-y-6 p-4 md:p-6 lg:p-8">{(error || notice) && <div className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-400/20 bg-red-400/5 text-red-300' : 'border-[#E8FF00]/20 bg-[#E8FF00]/5 text-[#E8FF00]'}`}><span>{error || notice}</span><button onClick={() => { setError(''); setNotice('') }}><X size={15} /></button></div>}
      {tab === 'overview' && <><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Panel eyebrow="OPERATIONS" title="Comenzi"><div className="text-4xl font-display">{stats.total_orders}</div><div className="mt-2 text-sm text-white/40">{stats.pending_orders} în așteptare</div></Panel><Panel eyebrow="CRM" title="Lead-uri"><div className="text-4xl font-display">{stats.total_contacts}</div><div className="mt-2 text-sm text-white/40">Cereri de contact</div></Panel><Panel eyebrow="CLIENTS" title="Clienți"><div className="text-4xl font-display">{stats.total_users}</div><div className="mt-2 text-sm text-white/40">Conturi înregistrate</div></Panel><Panel eyebrow="WEBSITE" title="Studio"><button onClick={() => router.push('/admin/website')} className="flex w-full items-center justify-between rounded-xl border border-[#E8FF00]/15 bg-[#E8FF00]/5 px-4 py-3 text-sm text-[#E8FF00]">Deschide Website Studio <ChevronRight size={15} /></button></Panel></div><Panel eyebrow="COMMAND CENTER" title="Activitate recentă"><div className="space-y-3">{[...contacts.slice(0, 4).map((c) => ({ key: `c-${c.id}`, title: c.name, detail: c.service_type, date: c.created_at })), ...orders.slice(0, 4).map((o) => ({ key: `o-${o.id}`, title: o.order_number, detail: `${o.user_name} · ${o.service_type}`, date: o.created_at }))].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, 8).map((item) => <div key={item.key} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[.02] px-4 py-3"><Activity size={15} className="text-[#E8FF00]/70" /><div className="min-w-0 flex-1"><div className="truncate text-sm text-white/80">{item.title}</div><div className="truncate text-xs text-white/35">{item.detail}</div></div><time className="text-xs text-white/25">{new Date(item.date).toLocaleString('ro-RO')}</time></div>)}</div></Panel></>}
      {tab === 'leads' && <Panel eyebrow="CRM" title="Lead-uri"><div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.02] px-3"><Search size={15} className="text-white/30" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută lead..." className="w-full bg-transparent py-3 text-sm outline-none" /></div><div className="space-y-2">{filteredContacts.map((c) => <div key={c.id} className="grid gap-3 rounded-xl border border-white/8 p-4 md:grid-cols-[1fr_1fr_auto]"><div><div className="font-medium">{c.name}</div><div className="text-xs text-white/35">{c.email} · {c.phone}</div></div><div className="text-sm text-white/55">{c.car_brand} {c.car_model} · {c.service_type}</div><select value={c.status} onChange={(e) => void updateContact(c, e.target.value as ContactStatus)} className="rounded-lg border border-white/10 bg-[#11131c] px-3 py-2 text-xs"><option>NEW</option><option>CONTACTED</option><option>QUOTED</option><option>WON</option><option>LOST</option><option>ARCHIVED</option></select></div>)}</div></Panel>}
      {tab === 'orders' && <Panel eyebrow="OPERATIONS" title="Comenzi"><div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.02] px-3"><Search size={15} className="text-white/30" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută comandă..." className="w-full bg-transparent py-3 text-sm outline-none" /></div><div className="space-y-2">{filteredOrders.map((o) => <div key={o.id} className="grid gap-3 rounded-xl border border-white/8 p-4 md:grid-cols-[1fr_1fr_auto]"><div><div className="font-medium">{o.order_number}</div><div className="text-xs text-white/35">{o.user_name} · {o.user_email}</div></div><div className="text-sm text-white/55">{o.car_brand} {o.car_model} · {o.service_type}</div><select value={o.status} onChange={(e) => void updateOrder(o, { status: e.target.value as OrderStatus })} className="rounded-lg border border-white/10 bg-[#11131c] px-3 py-2 text-xs"><option>PENDING</option><option>APPROVED</option><option>IN_PROGRESS</option><option>QUALITY_CHECK</option><option>COMPLETED</option></select></div>)}</div></Panel>}
      {tab === 'clients' && <Panel eyebrow="CRM" title="Clienți"><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{users.map((u) => <article key={u.id} className="rounded-xl border border-white/8 p-4"><div className="font-medium">{u.name}</div><div className="mt-1 text-sm text-white/45">{u.email}</div><div className="mt-3 text-xs text-white/25">{u.role} · {new Date(u.created_at).toLocaleDateString('ro-RO')}</div></article>)}</div></Panel>}
      {tab === 'settings' && <Panel eyebrow="SYSTEM" title="Sistem"><div className="grid gap-4 md:grid-cols-2"><div className="rounded-xl border border-white/8 p-4"><CheckCircle2 size={17} className="text-[#E8FF00]" /><div className="mt-2 font-medium">API flows</div><div className="mt-1 text-sm text-white/40">Conectarea la backend este păstrată prin API-urile existente.</div></div><div className="rounded-xl border border-white/8 p-4"><ShieldCheck size={17} className="text-[#E8FF00]" /><div className="mt-2 font-medium">Admin auth</div><div className="mt-1 text-sm text-white/40">Accesul este verificat server-side înaintea operațiilor CMS.</div></div></div></Panel>}
      {tab === 'website' && <Panel eyebrow="WEBSITE" title="Website Studio"><div className="grid gap-3 md:grid-cols-2"><button onClick={() => router.push('/admin/website')} className="rounded-xl border border-[#E8FF00]/20 bg-[#E8FF00]/5 p-5 text-left"><div className="text-sm text-[#E8FF00]">Open Studio</div><div className="mt-1 text-xs text-white/40">Editare, history, restore și media.</div></button><a href="/" target="_blank" rel="noreferrer" className="rounded-xl border border-white/10 p-5 text-left"><div className="text-sm">Preview public</div><div className="mt-1 text-xs text-white/40">Deschide site-ul într-un tab nou.</div></a></div></Panel>}
      </div>
    </main>
  </div></div>
}

'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Clock3, LogOut, RefreshCw, Search, Users, ClipboardList, MessageSquare, Save, AlertCircle } from 'lucide-react'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

type OrderStatus = 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'QUALITY_CHECK' | 'COMPLETED'
type ContactStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST' | 'ARCHIVED'

interface Order {
  id: string
  order_number: string
  user_name: string
  user_email: string
  car_brand: string
  car_model: string
  car_year: number
  car_plate?: string | null
  service_type: string
  finish_type?: string | null
  description?: string | null
  preferred_date?: string | null
  status: OrderStatus
  estimated_price?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

interface ContactRequest {
  id: string
  name: string
  email: string
  phone: string
  car_brand?: string | null
  car_model?: string | null
  car_year?: string | null
  service_type: string
  finish_type?: string | null
  message?: string | null
  status: ContactStatus
  created_at: string
}

interface Stats {
  total_orders: number
  pending_orders: number
  total_users: number
  total_contacts: number
}

const orderStatusLabels: Record<OrderStatus, string> = {
  PENDING: 'În așteptare',
  APPROVED: 'Aprobat',
  IN_PROGRESS: 'În lucru',
  QUALITY_CHECK: 'Control calitate',
  COMPLETED: 'Finalizat',
}

const contactStatusLabels: Record<ContactStatus, string> = {
  NEW: 'Nouă',
  CONTACTED: 'Contactat',
  QUOTED: 'Ofertat',
  WON: 'Câștigat',
  LOST: 'Pierdut',
  ARCHIVED: 'Arhivat',
}

async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.detail || `Request failed (${response.status})`)
  }
  return response.json()
}

export default function AdminPage() {
  const router = useRouter()
  const [tab, setTab] = useState<'orders' | 'contacts'>('orders')
  const [orders, setOrders] = useState<Order[]>([])
  const [contacts, setContacts] = useState<ContactRequest[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [orderData, contactData, statData] = await Promise.all([
        api<Order[]>('/api/admin/orders'),
        api<ContactRequest[]>('/api/admin/contact-requests'),
        api<Stats>('/api/admin/stats'),
      ])
      setOrders(orderData)
      setContacts(contactData)
      setStats(statData)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nu s-au putut încărca datele.'
      setError(message)
      if (message.includes('authenticated') || message.includes('Admin access')) router.replace('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filteredOrders = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return orders
    return orders.filter((order) => [order.order_number, order.user_name, order.user_email, order.car_brand, order.car_model, order.service_type].join(' ').toLowerCase().includes(needle))
  }, [orders, query])

  const filteredContacts = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return contacts
    return contacts.filter((item) => [item.name, item.email, item.phone, item.car_brand, item.car_model, item.service_type].join(' ').toLowerCase().includes(needle))
  }, [contacts, query])

  const updateOrder = async (order: Order, patch: { status?: OrderStatus; estimated_price?: number | null; notes?: string | null }) => {
    setSaving(order.order_number)
    setError('')
    try {
      const updated = await api<Order>(`/api/admin/orders/${encodeURIComponent(order.order_number)}`, { method: 'PATCH', body: JSON.stringify(patch) })
      setOrders((current) => current.map((item) => item.order_number === updated.order_number ? updated : item))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu s-a putut salva comanda.')
    } finally {
      setSaving(null)
    }
  }

  const updateContact = async (item: ContactRequest, status: ContactStatus) => {
    setSaving(item.id)
    setError('')
    try {
      const updated = await api<{ id: string; status: ContactStatus }>(`/api/admin/contact-requests/${item.id}?status=${encodeURIComponent(status)}`, { method: 'PATCH' })
      setContacts((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: updated.status } : entry))
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nu s-a putut actualiza cererea.')
    } finally {
      setSaving(null)
    }
  }

  const logout = async () => {
    try { await api('/api/auth/logout', { method: 'POST' }) } finally { router.replace('/login') }
  }

  return (
    <main className="min-h-screen bg-[#090909] text-[#F0F0F0]">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#090909]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-6 px-5 py-4 md:px-8">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#E8FF00]">WOB ART / ADMIN</p>
            <h1 className="font-display text-3xl tracking-wide">OPERATIONS</h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => void load()} className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs uppercase tracking-wider text-white/60 transition hover:border-white/20 hover:text-white" disabled={loading}>
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualizează
            </button>
            <button type="button" onClick={() => void logout()} className="inline-flex items-center gap-2 border border-white/10 px-3 py-2 text-xs uppercase tracking-wider text-white/60 transition hover:border-red-400/40 hover:text-white">
              <LogOut size={14} /> Ieșire
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 md:py-10">
        {error && <div role="alert" className="mb-6 flex items-center gap-3 border border-red-400/30 bg-red-400/5 px-4 py-3 text-sm text-red-200"><AlertCircle size={16} />{error}</div>}

        <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: 'Comenzi', value: stats?.total_orders ?? '—', icon: ClipboardList },
            { label: 'În așteptare', value: stats?.pending_orders ?? '—', icon: Clock3 },
            { label: 'Utilizatori', value: stats?.total_users ?? '—', icon: Users },
            { label: 'Cereri contact', value: stats?.total_contacts ?? '—', icon: MessageSquare },
          ].map((card) => { const Icon = card.icon; return <div key={card.label} className="border border-white/10 bg-white/[0.02] p-4 md:p-5"><Icon size={16} className="text-[#E8FF00]" /><p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">{card.label}</p><strong className="mt-1 block font-display text-4xl">{card.value}</strong></div> })}
        </section>

        <section className="mt-8 border-b border-white/10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-1">
              <button type="button" onClick={() => setTab('orders')} className={`border-b-2 px-4 py-3 text-xs uppercase tracking-[0.2em] ${tab === 'orders' ? 'border-[#E8FF00] text-white' : 'border-transparent text-white/35'}`}>Comenzi</button>
              <button type="button" onClick={() => setTab('contacts')} className={`border-b-2 px-4 py-3 text-xs uppercase tracking-[0.2em] ${tab === 'contacts' ? 'border-[#E8FF00] text-white' : 'border-transparent text-white/35'}`}>Cereri ofertă</button>
            </div>
            <label className="flex items-center gap-2 border border-white/10 px-3 py-2 md:min-w-[320px]">
              <Search size={15} className="text-white/30" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Caută..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/20" />
            </label>
          </div>
        </section>

        {loading ? <div className="py-16 text-center font-mono text-xs uppercase tracking-[0.2em] text-white/30">Se încarcă datele...</div> : tab === 'orders' ? (
          <section className="mt-6 overflow-x-auto border border-white/10">
            <table className="w-full min-w-[1100px] border-collapse text-left">
              <thead><tr className="border-b border-white/10 text-[10px] uppercase tracking-[0.2em] text-white/30"><th className="px-4 py-4">Comandă</th><th>Client</th><th>Vehicul</th><th>Serviciu</th><th>Status</th><th>Preț</th><th>Acțiune</th></tr></thead>
              <tbody>{filteredOrders.map((order) => <tr key={order.order_number} className="border-b border-white/5 align-top">
                <td className="px-4 py-5"><strong className="font-mono text-xs text-[#E8FF00]">{order.order_number}</strong><p className="mt-1 text-xs text-white/35">{new Date(order.created_at).toLocaleString('ro-RO')}</p></td>
                <td className="py-5 pr-4"><p className="text-sm">{order.user_name}</p><p className="text-xs text-white/35">{order.user_email}</p></td>
                <td className="py-5 pr-4"><p className="text-sm">{order.car_brand} {order.car_model}</p><p className="text-xs text-white/35">{order.car_year} {order.car_plate ? `· ${order.car_plate}` : ''}</p></td>
                <td className="py-5 pr-4"><p className="text-xs uppercase tracking-wider">{order.service_type}</p><p className="text-xs text-white/35">{order.finish_type || '—'}</p></td>
                <td className="py-5 pr-4"><select value={order.status} onChange={(e) => void updateOrder(order, { status: e.target.value as OrderStatus })} className="border border-white/10 bg-[#111] px-2 py-2 text-xs"><option value="PENDING">{orderStatusLabels.PENDING}</option><option value="APPROVED">{orderStatusLabels.APPROVED}</option><option value="IN_PROGRESS">{orderStatusLabels.IN_PROGRESS}</option><option value="QUALITY_CHECK">{orderStatusLabels.QUALITY_CHECK}</option><option value="COMPLETED">{orderStatusLabels.COMPLETED}</option></select></td>
                <td className="py-5 pr-4"><input defaultValue={order.estimated_price ?? ''} inputMode="decimal" placeholder="—" className="w-24 border border-white/10 bg-transparent px-2 py-2 text-sm" onBlur={(e) => { const raw = e.target.value.trim(); const value = raw ? Number(raw) : null; if (value !== order.estimated_price) void updateOrder(order, { estimated_price: value }) }} /></td>
                <td className="py-5 pr-4">{saving === order.order_number ? <span className="text-xs text-white/35">Salvez...</span> : <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-white/25"><Save size={12}/> sincronizat</span>}</td>
              </tr>)}</tbody>
            </table>
            {filteredOrders.length === 0 && <div className="p-8 text-center text-sm text-white/30">Nu există comenzi pentru filtrul curent.</div>}
          </section>
        ) : (
          <section className="mt-6 space-y-3">
            {filteredContacts.map((item) => <article key={item.id} className="border border-white/10 bg-white/[0.02] p-5 md:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div><div className="flex flex-wrap items-center gap-3"><h2 className="font-display text-2xl">{item.name}</h2><span className="border border-[#E8FF00]/30 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#E8FF00]">{contactStatusLabels[item.status]}</span></div><p className="mt-2 text-sm text-white/50">{item.email} · {item.phone}</p><p className="mt-1 text-xs text-white/30">{item.car_brand || 'Vehicul nespecificat'} {item.car_model || ''} {item.car_year ? `· ${item.car_year}` : ''} · {item.service_type}{item.finish_type ? ` · ${item.finish_type}` : ''}</p></div>
                <select value={item.status} onChange={(e) => void updateContact(item, e.target.value as ContactStatus)} className="border border-white/10 bg-[#111] px-3 py-2 text-xs"><option value="NEW">{contactStatusLabels.NEW}</option><option value="CONTACTED">{contactStatusLabels.CONTACTED}</option><option value="QUOTED">{contactStatusLabels.QUOTED}</option><option value="WON">{contactStatusLabels.WON}</option><option value="LOST">{contactStatusLabels.LOST}</option><option value="ARCHIVED">{contactStatusLabels.ARCHIVED}</option></select>
              </div>
              {item.message && <p className="mt-5 max-w-4xl border-l border-white/10 pl-4 text-sm leading-6 text-white/60">{item.message}</p>}
              <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-white/20">{new Date(item.created_at).toLocaleString('ro-RO')}</p>
            </article>)}
            {filteredContacts.length === 0 && <div className="border border-white/10 p-8 text-center text-sm text-white/30">Nu există cereri pentru filtrul curent.</div>}
          </section>
        )}
      </div>
    </main>
  )
}

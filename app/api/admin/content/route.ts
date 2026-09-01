import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import { defaultSiteContent } from '@/lib/site-content'
import { siteContentSchema } from '@/lib/cms-schema'

export const runtime = 'nodejs'

const CONTENT_KEY = 'site-content'
type ContentStatus = 'draft' | 'published'
type StoredSiteContent = typeof defaultSiteContent & { _id: string; updatedAt?: string; updatedBy?: string; version?: number; status?: ContentStatus; publishedAt?: string; publishedBy?: string }

async function requireAdmin(request: Request) {
  const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL
  if (!backendUrl) throw new Error('BACKEND_URL is not configured')
  const cookie = request.headers.get('cookie') ?? ''
  const response = await fetch(`${backendUrl}/api/auth/me`, { headers: { cookie }, cache: 'no-store' })
  if (!response.ok) return null
  const user = await response.json()
  return user?.role === 'admin' ? user : null
}

async function loadCurrent() {
  const db = await getMongoDb()
  return { db, current: await db.collection<StoredSiteContent>('site_content').findOne({ _id: CONTENT_KEY }) }
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { current } = await loadCurrent()
    return NextResponse.json(current ?? { ...defaultSiteContent, _id: CONTENT_KEY, version: 0, status: 'draft' })
  } catch (error) {
    console.error('GET /api/admin/content failed', error)
    return NextResponse.json({ error: 'Content service unavailable' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const parsed = siteContentSchema.safeParse(await request.json())
    if (!parsed.success) return NextResponse.json({ error: 'Invalid site content schema', issues: parsed.error.flatten() }, { status: 400 })
    const { db, current } = await loadCurrent()
    const now = new Date().toISOString()
    const version = (current?.version ?? 0) + 1
    const document: StoredSiteContent = { ...parsed.data, _id: CONTENT_KEY, updatedAt: now, updatedBy: admin.email, version, status: 'draft', publishedAt: current?.publishedAt, publishedBy: current?.publishedBy }
    await db.collection<StoredSiteContent>('site_content').replaceOne({ _id: CONTENT_KEY }, document, { upsert: true })
    await db.collection('content_versions').insertOne({ contentKey: CONTENT_KEY, version, status: 'draft', content: parsed.data, createdAt: now, createdBy: admin.email })
    await db.collection('audit_log').insertOne({ action: 'content.saved', resource: 'site_content', resourceId: CONTENT_KEY, version, actor: admin.email, createdAt: now })
    return NextResponse.json({ ok: true, updatedAt: now, version, status: 'draft' })
  } catch (error) {
    console.error('PUT /api/admin/content failed', error)
    return NextResponse.json({ error: 'Content save failed' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    if (body?.action !== 'publish') return NextResponse.json({ error: 'Unsupported action' }, { status: 400 })
    const { db, current } = await loadCurrent()
    if (!current || current.status !== 'draft') return NextResponse.json({ error: 'No draft available to publish' }, { status: 409 })
    const now = new Date().toISOString()
    await db.collection<StoredSiteContent>('site_content').updateOne({ _id: CONTENT_KEY }, { $set: { status: 'published', publishedAt: now, publishedBy: admin.email } })
    await db.collection('content_versions').updateOne({ contentKey: CONTENT_KEY, version: current.version }, { $set: { status: 'published', publishedAt: now, publishedBy: admin.email } })
    await db.collection('audit_log').insertOne({ action: 'content.published', resource: 'site_content', resourceId: CONTENT_KEY, version: current.version, actor: admin.email, createdAt: now })
    return NextResponse.json({ ok: true, version: current.version, status: 'published', publishedAt: now })
  } catch (error) {
    console.error('POST /api/admin/content failed', error)
    return NextResponse.json({ error: 'Content publish failed' }, { status: 500 })
  }
}

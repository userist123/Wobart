import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import { defaultSiteContent, type SiteContent } from '@/lib/site-content'

export const runtime = 'nodejs'

const CONTENT_KEY = 'site-content'

async function requireAdmin(request: Request) {
  const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL
  if (!backendUrl) throw new Error('BACKEND_URL is not configured')
  const cookie = request.headers.get('cookie') ?? ''
  const response = await fetch(`${backendUrl}/api/auth/me`, {
    headers: { cookie },
    cache: 'no-store',
  })
  if (!response.ok) return null
  const user = await response.json()
  return user?.role === 'admin' ? user : null
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const db = await getMongoDb()
    const stored = await db.collection<SiteContent & { _id: string; updatedAt?: string; updatedBy?: string }>('site_content').findOne({ _id: CONTENT_KEY })
    return NextResponse.json(stored ?? defaultSiteContent)
  } catch (error) {
    console.error('GET /api/admin/content failed', error)
    return NextResponse.json({ error: 'Content service unavailable' }, { status: 503 })
  }
}

export async function PUT(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = (await request.json()) as SiteContent
    if (!body || typeof body !== 'object' || !body.global || !body.home || !Array.isArray(body.services) || !Array.isArray(body.portfolio) || !body.seo || !body.theme) {
      return NextResponse.json({ error: 'Invalid site content schema' }, { status: 400 })
    }
    const db = await getMongoDb()
    const now = new Date().toISOString()
    await db.collection('site_content').replaceOne(
      { _id: CONTENT_KEY },
      { ...body, _id: CONTENT_KEY, updatedAt: now, updatedBy: admin.email },
      { upsert: true },
    )
    return NextResponse.json({ ok: true, updatedAt: now })
  } catch (error) {
    console.error('PUT /api/admin/content failed', error)
    return NextResponse.json({ error: 'Content save failed' }, { status: 500 })
  }
}

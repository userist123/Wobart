import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'

export const runtime = 'nodejs'

const CONTENT_KEY = 'site-content'

type StoredContent = { _id: string; version?: number; status?: 'draft' | 'published'; updatedAt?: string; updatedBy?: string; publishedAt?: string; publishedBy?: string; [key: string]: unknown }

async function requireAdmin(request: Request) {
  const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL
  if (!backendUrl) throw new Error('BACKEND_URL is not configured')
  const cookie = request.headers.get('cookie') ?? ''
  const response = await fetch(`${backendUrl}/api/auth/me`, { headers: { cookie }, cache: 'no-store' })
  if (!response.ok) return null
  const user = await response.json()
  return user?.role === 'admin' ? user : null
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const db = await getMongoDb()
    const current = await db.collection<StoredContent>('site_content').findOne({ _id: CONTENT_KEY })
    if (!current) return NextResponse.json({ error: 'No draft content exists' }, { status: 404 })
    const now = new Date().toISOString()
    await db.collection<StoredContent>('site_content').updateOne(
      { _id: CONTENT_KEY },
      { $set: { status: 'published', publishedAt: now, publishedBy: admin.email } },
    )
    await db.collection('content_versions').updateOne(
      { contentKey: CONTENT_KEY, version: current.version ?? 0 },
      { $set: { status: 'published', publishedAt: now, publishedBy: admin.email } },
    )
    await db.collection('audit_log').insertOne({ action: 'content.publish', resource: CONTENT_KEY, version: current.version ?? 0, actor: admin.email, createdAt: now })
    return NextResponse.json({ ok: true, version: current.version ?? 0, publishedAt: now })
  } catch (error) {
    console.error('POST /api/admin/content/publish failed', error)
    return NextResponse.json({ error: 'Content publish failed' }, { status: 500 })
  }
}

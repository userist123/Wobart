import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import { defaultSiteContent } from '@/lib/site-content'
import { siteContentSchema } from '@/lib/cms-schema'

export const runtime = 'nodejs'
const CONTENT_KEY = 'site-content'

type StoredVersion = {
  contentKey: string
  version: number
  status: 'draft' | 'published'
  content: typeof defaultSiteContent
  createdAt: string
  createdBy?: string
  publishedAt?: string
  publishedBy?: string
}

type SiteContentDocument = {
  _id?: string
  version?: number
  updatedAt?: string
  updatedBy?: string
  status?: 'draft' | 'published'
  [key: string]: unknown
}

async function requireAdmin(request: Request) {
  const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL
  if (!backendUrl) throw new Error('BACKEND_URL is not configured')
  const cookie = request.headers.get('cookie') ?? ''
  const response = await fetch(`${backendUrl}/api/auth/me`, { headers: { cookie }, cache: 'no-store' })
  if (!response.ok) return null
  const user = await response.json()
  return user?.role === 'admin' ? user : null
}

export async function GET(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const db = await getMongoDb()
    const versions = await db.collection<StoredVersion>('content_versions')
      .find({ contentKey: CONTENT_KEY })
      .sort({ version: -1 })
      .limit(50)
      .project({ _id: 0, content: 0 })
      .toArray()
    return NextResponse.json({ versions })
  } catch (error) {
    console.error('GET /api/admin/content/history failed', error)
    return NextResponse.json({ error: 'Content history unavailable' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAdmin(request)
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json().catch(() => ({}))
    const requestedVersion = Number(body?.version)
    if (!Number.isInteger(requestedVersion) || requestedVersion < 1) {
      return NextResponse.json({ error: 'A valid version is required' }, { status: 400 })
    }

    const db = await getMongoDb()
    const source = await db.collection<StoredVersion>('content_versions').findOne({ contentKey: CONTENT_KEY, version: requestedVersion })
    if (!source) return NextResponse.json({ error: 'Version not found' }, { status: 404 })

    const parsed = siteContentSchema.safeParse(source.content)
    if (!parsed.success) return NextResponse.json({ error: 'Stored version is invalid', issues: parsed.error.flatten() }, { status: 409 })

    const siteContent = db.collection<SiteContentDocument>('site_content')
    const current = await siteContent.findOne({ _id: { $eq: CONTENT_KEY } })
    const version = (current?.version ?? 0) + 1
    const now = new Date().toISOString()
    const restoredDocument = {
      ...parsed.data,
      _id: CONTENT_KEY,
      updatedAt: now,
      updatedBy: admin.email,
      version,
      status: 'draft' as const,
    }

    await siteContent.replaceOne(
      { _id: { $eq: CONTENT_KEY } },
      restoredDocument,
      { upsert: true },
    )
    await db.collection('content_versions').insertOne({ contentKey: CONTENT_KEY, version, status: 'draft', content: parsed.data, createdAt: now, createdBy: admin.email, restoredFrom: requestedVersion })
    await db.collection('audit_log').insertOne({ action: 'content.restored', resource: 'site_content', resourceId: CONTENT_KEY, version, restoredFrom: requestedVersion, actor: admin.email, createdAt: now })

    return NextResponse.json({ ok: true, version, status: 'draft', restoredFrom: requestedVersion })
  } catch (error) {
    console.error('POST /api/admin/content/history failed', error)
    return NextResponse.json({ error: 'Content restore failed' }, { status: 500 })
  }
}

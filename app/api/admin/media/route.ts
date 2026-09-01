import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'

export const runtime = 'nodejs'

type MediaAsset = {
  _id?: string
  name: string
  url: string
  alt: string
  type: 'image' | 'video'
  width?: number
  height?: number
  mimeType?: string
  size?: number
  tags: string[]
  createdAt: string
  createdBy: string
}

async function requireAdmin(request: Request) {
  const backendUrl = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_API_URL
  if (!backendUrl) return null
  const cookie = request.headers.get('cookie') ?? ''
  const response = await fetch(`${backendUrl}/api/auth/me`, { headers: { cookie }, cache: 'no-store' })
  if (!response.ok) return null
  const user = await response.json()
  return user?.role === 'admin' ? user : null
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const db = await getMongoDb()
    const assets = await db.collection<MediaAsset>('media_assets').find({}).sort({ createdAt: -1 }).limit(500).toArray()
    return NextResponse.json(assets)
  } catch (error) {
    console.error('GET /api/admin/media failed', error)
    return NextResponse.json({ error: 'Media service unavailable' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const body = await request.json()
    if (!body?.name || !body?.url || !body?.alt) return NextResponse.json({ error: 'name, url and alt are required' }, { status: 400 })
    const asset: MediaAsset = {
      name: String(body.name).trim(), url: String(body.url).trim(), alt: String(body.alt).trim(),
      type: body.type === 'video' ? 'video' : 'image', width: Number.isFinite(body.width) ? body.width : undefined,
      height: Number.isFinite(body.height) ? body.height : undefined, mimeType: body.mimeType ? String(body.mimeType) : undefined,
      size: Number.isFinite(body.size) ? body.size : undefined, tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      createdAt: new Date().toISOString(), createdBy: admin.email,
    }
    const db = await getMongoDb()
    const result = await db.collection<MediaAsset>('media_assets').insertOne(asset)
    await db.collection('audit_log').insertOne({ action: 'media.created', resource: 'media_asset', resourceId: String(result.insertedId), actor: admin.email, createdAt: asset.createdAt })
    return NextResponse.json({ ...asset, _id: String(result.insertedId) }, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/media failed', error)
    return NextResponse.json({ error: 'Media asset creation failed' }, { status: 500 })
  }
}

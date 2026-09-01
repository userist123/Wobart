import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import { defaultSiteContent, type SiteContent } from '@/lib/site-content'

export const runtime = 'nodejs'

const CONTENT_KEY = 'site-content'

export async function GET() {
  try {
    const db = await getMongoDb()
    const stored = await db.collection<SiteContent & { _id: string }>('site_content').findOne({ _id: CONTENT_KEY })
    return NextResponse.json(stored ?? defaultSiteContent, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('GET /api/content failed', error)
    return NextResponse.json({ error: 'Content service unavailable' }, { status: 503 })
  }
}

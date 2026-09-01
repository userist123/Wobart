import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import { defaultSiteContent, type SiteContent } from '@/lib/site-content'

export const runtime = 'nodejs'

const CONTENT_KEY = 'site-content'

type StoredSiteContent = SiteContent & { _id: string; status?: 'draft' | 'published'; version?: number; publishedAt?: string }

export async function GET() {
  try {
    const db = await getMongoDb()
    const stored = await db.collection<StoredSiteContent>('site_content').findOne({ _id: CONTENT_KEY, status: 'published' })
    return NextResponse.json(stored ?? defaultSiteContent, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('GET /api/content failed', error)
    return NextResponse.json({ error: 'Content service unavailable' }, { status: 503 })
  }
}

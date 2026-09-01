import { NextResponse } from 'next/server'
import { getMongoDb } from '@/lib/mongodb'
import { defaultSiteContent, type SiteContent } from '@/lib/site-content'

export const runtime = 'nodejs'

const CONTENT_KEY = 'site-content'

type StoredVersion = {
  contentKey: string
  version: number
  status: 'draft' | 'published'
  content: SiteContent
  publishedAt?: string
}

export async function GET() {
  try {
    const db = await getMongoDb()
    const published = await db.collection<StoredVersion>('content_versions')
      .findOne(
        { contentKey: CONTENT_KEY, status: 'published' },
        { sort: { version: -1 }, projection: { _id: 0, content: 1, version: 1, publishedAt: 1 } },
      )

    return NextResponse.json(published?.content ?? defaultSiteContent, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch (error) {
    console.error('GET /api/content failed', error)
    return NextResponse.json({ error: 'Content service unavailable' }, { status: 503 })
  }
}

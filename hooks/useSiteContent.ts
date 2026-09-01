'use client'

import { useEffect, useState } from 'react'
import { defaultSiteContent, type SiteContent } from '@/lib/site-content'

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetch('/api/content', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('CMS unavailable')
        return response.json() as Promise<SiteContent>
      })
      .then((data) => { if (!cancelled) setContent(data) })
      .catch(() => { /* Keep the safe local defaults when the CMS is not configured. */ })
      .finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [])

  return { content, ready }
}

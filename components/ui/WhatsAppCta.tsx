'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

export function WhatsAppCta() {
  const { content, ready } = useSiteContent()
  const [hidden, setHidden] = useState(false)

  useEffect(() => {
    const target = document.getElementById('quote')
    if (!target) return
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) setHidden(entry.isIntersecting)
    })
    observer.observe(target)
    return () => observer.disconnect()
  }, [ready])

  const digits = content.global.phone.replace(/\D/g, '')
  if (!ready || digits.length < 8) return null

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scrie-ne pe WhatsApp"
      className={`whatsapp-cta${hidden ? ' whatsapp-cta--hidden' : ''}`}
    >
      <MessageCircle size={24} aria-hidden="true" />
      <span className="whatsapp-cta__label">WhatsApp</span>
    </a>
  )
}

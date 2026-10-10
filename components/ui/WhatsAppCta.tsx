'use client'

import { useEffect, useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

/** wa.me needs the international number without '+': a Romanian local number (07xx…) gets the 40 prefix. */
export function toWhatsAppNumber(phone: string): string {
  let digits = phone.replace(/\D/g, '')
  if (digits.startsWith('00')) digits = digits.slice(2)
  else if (digits.startsWith('0')) digits = `40${digits.slice(1)}`
  return digits
}

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

  const digits = toWhatsAppNumber(content.global.phone)
  if (!ready || digits.length < 8) return null

  return (
    <a
      href={`https://wa.me/${digits}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Scrie-ne pe WhatsApp"
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`whatsapp-cta${hidden ? ' whatsapp-cta--hidden' : ''}`}
    >
      <MessageCircle size={24} aria-hidden="true" />
      <span className="whatsapp-cta__label">WhatsApp</span>
    </a>
  )
}

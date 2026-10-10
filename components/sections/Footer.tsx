'use client'

import { ArrowUpRight } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'

export function Footer() {
  const { content } = useSiteContent()
  const { global } = content
  const panelRef = useReveal<HTMLDivElement>()
  const brandRef = useReveal<HTMLDivElement>({ delay: 80 })
  const navRef = useReveal<HTMLDivElement>({ delay: 160 })
  const contactRef = useReveal<HTMLDivElement>({ delay: 240 })
  const socialRef = useReveal<HTMLDivElement>({ delay: 320 })
  const links = [
    ['Servicii', '#services'],
    ['Transformări', '#transformation'],
    ['Portofoliu', '#portfolio'],
    ['Proces', '#process'],
    ['Estimare', '#estimator'],
    ['Ofertă', '#quote'],
  ] as const
  const social = [
    ['Instagram', global.instagramUrl],
    ['Facebook', global.facebookUrl],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]))

  return (
    <footer className="v2-footer">
      <div className="section-shell">
        <div ref={panelRef} className="reveal glass v2-footer-panel">
          <div>
            <span className="v2-footer-index">09 / CONTACT</span>
            <p className="v2-footer-cta-line">{global.tagline || 'Automotive wrapping studio'}</p>
          </div>
          <MagneticButton variant="accent" size="lg" href="#quote">Începe un proiect <ArrowUpRight size={14} aria-hidden="true" /></MagneticButton>
        </div>

        <div className="v2-footer-grid">
          <div ref={brandRef} className="reveal v2-footer-col">
            <div className="v2-footer-brand">{global.brandName || 'WOB ART'}</div>
            <p className="v2-footer-text">{global.tagline || 'Automotive wrapping studio'}<br />{global.city || 'București'}, România</p>
          </div>
          <div ref={navRef} className="reveal v2-footer-col"><p className="eyebrow">Navigare</p>{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</div>
          <div ref={contactRef} className="reveal v2-footer-col"><p className="eyebrow">Contact</p>{global.email && <a href={`mailto:${global.email}`}>{global.email}</a>}{global.phone && <a href={`tel:${global.phone.replace(/\s+/g, '')}`}>{global.phone}</a>}{global.address && <span className="v2-footer-text">{global.address}</span>}{global.openingHours && <span className="v2-footer-text">{global.openingHours}</span>}</div>
          <div ref={socialRef} className="reveal v2-footer-col"><p className="eyebrow">Social</p>{social.map(([label, href]) => <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}<ArrowUpRight size={12} aria-hidden="true" /></a>)}</div>
        </div>

        <div className="v2-footer-bottom"><span>© 2026 {global.brandName || 'WOB ART'}</span><span>BUCHAREST · RO</span><span><a href="#">Politică de confidențialitate</a></span></div>
      </div>
    </footer>
  )
}

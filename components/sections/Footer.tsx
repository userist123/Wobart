'use client'

import { ArrowUpRight } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

export function Footer() {
  const { content } = useSiteContent()
  const { global } = content
  const links = [
    ['Servicii', '#services'],
    ['Transformări', '#transformation'],
    ['Portofoliu', '#portfolio'],
    ['Proces', '#process'],
    ['Estimare', '#estimator'],
    ['Ofertă', '#quote'],
  ] as const

  return (
    <footer className="site-footer site-footer-premium">
      <div className="footer-gridline" aria-hidden="true" />
      <div className="section-shell">
        <div className="footer-top">
          <div className="footer-brand-block">
            <span className="footer-index">09 / CONTACT</span>
            <div className="footer-brand">{global.brandName || 'WOB ART'}</div>
            <p className="body-copy">{global.tagline || 'Automotive wrapping studio'}<br />{global.city || 'București'}, România</p>
            <a className="footer-start-link" href="#quote">Începe un proiect <ArrowUpRight size={14} /></a>
          </div>
          <div className="footer-nav"><p className="eyebrow">Explorează</p>{links.map(([label, href]) => <a key={href} href={href}>{label}<ArrowUpRight size={12} /></a>)}</div>
          <div className="footer-contact"><p className="eyebrow">Contact</p>{global.email && <a href={`mailto:${global.email}`}>{global.email}</a>}{global.phone && <a href={`tel:${global.phone.replace(/\s+/g, '')}`}>{global.phone}</a>}{global.address && <span className="body-copy">{global.address}</span>}</div>
        </div>
        <div className="footer-bottom"><span>© 2026 {global.brandName || 'WOB ART'}</span><span>BUCHAREST · RO / BUILT WITH INTENT</span><span><a href="#">Politică de confidențialitate</a></span></div>
      </div>
      <div className="footer-mark" aria-hidden="true">WØB</div>
    </footer>
  )
}

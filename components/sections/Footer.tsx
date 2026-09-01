'use client'

import { ArrowUpRight } from 'lucide-react'
import { useSiteContent } from '@/hooks/useSiteContent'

export function Footer() {
  const { content } = useSiteContent()
  const contact = content.global.contact
  const links = [
    ['Servicii', '#services'],
    ['Transformări', '#transformation'],
    ['Portofoliu', '#portfolio'],
    ['Proces', '#process'],
    ['Estimare', '#estimator'],
    ['Ofertă', '#quote'],
  ] as const

  return (
    <footer className="site-footer">
      <div className="section-shell">
        <div className="footer-top">
          <div><div className="footer-brand">WOB<span>ART</span></div><p className="body-copy">Automotive wrapping studio<br />{content.global.city}</p></div>
          <div className="footer-nav"><p className="eyebrow">Explorează</p>{links.map(([label, href]) => <a key={href} href={href}>{label}<ArrowUpRight size={12} /></a>)}</div>
          <div className="footer-contact"><p className="eyebrow">Contact</p><a href={`mailto:${contact.email}`}>{contact.email}</a>{contact.phone && <a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a>}<a href="#quote">Începe un proiect</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 WOB ART</span><span>Built with intent.</span><span><a href="#">Politică de confidențialitate</a></span></div>
      </div>
    </footer>
  )
}

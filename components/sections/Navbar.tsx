'use client'

import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { MagneticButton } from '@/components/ui/MagneticButton'

const LINKS = [
  { label: 'Servicii', href: '#services' },
  { label: 'Transformări', href: '#transformation' },
  { label: 'Portofoliu', href: '#portfolio' },
  { label: 'Proces', href: '#process' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <header className={`site-header ${scrolled ? 'site-header-scrolled' : ''}`}>
        <div className="section-shell header-inner">
          <a href="#top" className="brand-lockup" aria-label="WOB ART — acasă">
            <span>WOB</span>
            <small>ART</small>
          </a>

          <nav className="desktop-nav" aria-label="Principal">
            {LINKS.map(link => <a key={link.href} href={link.href}>{link.label}</a>)}
          </nav>

          <div className="header-actions">
            <a href="#estimator" className="header-estimate">Estimează</a>
            <MagneticButton variant="accent" size="sm" href="#quote">Ofertă</MagneticButton>
            <button className="menu-button" onClick={() => setMenuOpen(v => !v)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <div className={`mobile-menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="mobile-menu-inner">
          <p className="eyebrow">Navigare</p>
          <nav aria-label="Mobil">
            {LINKS.map((link, i) => (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                <span>0{i + 1}</span>{link.label}
              </a>
            ))}
          </nav>
          <a className="mobile-cta" href="#quote" onClick={() => setMenuOpen(false)}>Solicită ofertă →</a>
        </div>
      </div>
    </>
  )
}

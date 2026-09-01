import { ArrowUpRight } from 'lucide-react'

export function Footer() {
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
          <div><div className="footer-brand">WOB<span>ART</span></div><p className="body-copy">Automotive wrapping studio<br />București, România</p></div>
          <div className="footer-nav"><p className="eyebrow">Explorează</p>{links.map(([label, href]) => <a key={href} href={href}>{label}<ArrowUpRight size={12} /></a>)}</div>
          <div className="footer-contact"><p className="eyebrow">Contact</p><a href="mailto:contact@wobart.ro">contact@wobart.ro</a><a href="#quote">Începe un proiect</a></div>
        </div>
        <div className="footer-bottom"><span>© 2026 WOB ART</span><span>Built with intent.</span><span><a href="#">Politică de confidențialitate</a></span></div>
      </div>
    </footer>
  )
}

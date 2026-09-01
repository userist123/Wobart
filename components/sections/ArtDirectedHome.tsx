'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowDown, ArrowUpRight, Check, Menu, X } from 'lucide-react'
import { PORTFOLIO, REVIEWS, SERVICES } from '@/lib/constants'
import { defaultSiteContent, type SiteContent } from '@/lib/site-content'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { Footer } from '@/components/sections/Footer'

type Point = { x: number; y: number }

export function ArtDirectedHome() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeService, setActiveService] = useState(0)
  const [cursor, setCursor] = useState<Point>({ x: -100, y: -100 })
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    fetch('/api/content', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data: SiteContent | null) => data && setContent({ ...defaultSiteContent, ...data, global: { ...defaultSiteContent.global, ...data.global }, home: { ...defaultSiteContent.home, ...data.home }, theme: { ...defaultSiteContent.theme, ...data.theme } }))
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32)
    const onMove = (event: MouseEvent) => setCursor({ x: event.clientX, y: event.clientY })
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('mousemove', onMove) }
  }, [])

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-in')), { threshold: 0.12 })
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  const hero = { ...defaultSiteContent.home.hero, ...content.home.hero }
  const services = useMemo(() => content.services?.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder).length ? content.services.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder) : SERVICES.map((item, index) => ({ id: item.num, name: item.title, slug: item.title, eyebrow: item.tagline, description: item.tagline, benefits: [...item.inclusions], process: [], materials: [], imageUrl: item.image, active: true, sortOrder: index })), [content.services])
  const portfolio = useMemo(() => content.portfolio?.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder).length ? content.portfolio.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder) : PORTFOLIO.map((item, index) => ({ id: String(item.id), title: `${item.make} ${item.model}`, slug: item.model, vehicle: `${item.make} ${item.model}`, service: item.badge, material: item.wrap, finish: item.wrap, description: '', coverUrl: item.img, gallery: [], featured: index < 3, active: true, sortOrder: index })), [content.portfolio])
  const transformations = content.home.transformations?.filter((item) => item.active).sort((a, b) => a.sortOrder - b.sortOrder) ?? defaultSiteContent.home.transformations
  const active = services[Math.min(activeService, Math.max(services.length - 1, 0))]

  const closeMenu = () => setMenuOpen(false)

  return (
    <main id="top" className="art-site" style={{ '--mx': `${cursor.x}px`, '--my': `${cursor.y}px` } as React.CSSProperties}>
      <div className="art-cursor" aria-hidden="true"><span /></div>
      <div className="art-progress" aria-hidden="true" />

      <header className={`art-nav ${scrolled ? 'is-scrolled' : ''}`}>
        <a href="#top" className="art-wordmark" onClick={closeMenu}>WØB<span>ART</span></a>
        <nav className="art-nav-links" aria-label="Navigație principală">
          <a href="#services">SERVICII</a><a href="#portfolio">PROIECTE</a><a href="#process">PROCES</a><a href="#quote">CONTACT</a>
        </nav>
        <div className="art-nav-right"><span className="art-location">BUCHAREST / RO</span><a className="art-nav-cta" href="#quote">START PROJECT <ArrowUpRight size={13} /></a><button className="art-menu" aria-label={menuOpen ? 'Închide meniul' : 'Deschide meniul'} onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button></div>
      </header>

      <div className={`art-mobile-menu ${menuOpen ? 'is-open' : ''}`}>
        <div className="art-mobile-inner"><span className="art-kicker">WØB ART / AUTOMOTIVE ATELIER</span><nav><a href="#services" onClick={closeMenu}>SERVICII <b>01</b></a><a href="#portfolio" onClick={closeMenu}>PROIECTE <b>02</b></a><a href="#process" onClick={closeMenu}>PROCES <b>03</b></a><a href="#quote" onClick={closeMenu}>CONTACT <b>04</b></a></nav><span>BUCHAREST / RO — BY APPOINTMENT</span></div>
      </div>

      <section className="art-hero">
        <div className="art-hero-image"><Image src={hero.imageUrl || '/images/hero-car.jpg'} alt="" fill priority sizes="100vw" className="art-cover" unoptimized={/^https?:\/\//i.test(hero.imageUrl)} /><div className="art-hero-gradient" /><div className="art-hero-glow" /></div>
        <div className="art-hero-grid" aria-hidden="true" />
        <div className="art-hero-content">
          <div className="art-hero-top"><span className="art-kicker">{hero.eyebrow || 'AUTOMOTIVE WRAPPING / PPF / DETAILING'}</span><span className="art-hero-code">WOB—01 / 2026</span></div>
          <div className="art-hero-title-wrap"><p className="art-hero-side">PRECISION<br />MATERIAL<br />FINISH</p><h1><span>WRAP.</span><br />REIMAGINAT.</h1></div>
          <div className="art-hero-bottom"><p>{hero.description || 'Transformăm mașini prin material, proporție și execuție. Fiecare proiect începe cu o direcție clară.'}</p><div className="art-hero-actions"><a className="art-button art-button-solid" href={hero.primaryCtaHref || '#quote'}>{hero.primaryCtaLabel || 'SOLICITĂ OFERTĂ'} <ArrowUpRight size={15} /></a><a className="art-text-button" href="#portfolio">VEZI PROIECTELE <ArrowDown size={14} /></a></div><div className="art-hero-stamp"><span>01</span><span>SCROLL TO EXPLORE</span></div></div>
        </div>
      </section>

      <div className="art-marquee" aria-hidden="true"><div><span>WØB ART</span><i>✦</i><span>WRAP</span><i>✦</i><span>PPF</span><i>✦</i><span>DETAIL</span><i>✦</i><span>BUCHAREST</span><i>✦</i><span>WØB ART</span><i>✦</i><span>WRAP</span><i>✦</i></div></div>

      <section className="art-manifesto art-section">
        <div className="art-section-index">01 / POINT OF VIEW</div>
        <div className="art-manifesto-copy" data-reveal><p className="art-kicker">{content.home.statement.eyebrow || 'NU ESTE DOAR O FOLIE.'}</p><h2>{content.home.statement.title || <>MAȘINA DEVINE<br /><em>OBIECT.</em></>}</h2><p>{content.home.statement.body || 'Nu urmărim să facem o mașină să arate „diferit”. Urmărim să-i schimbăm prezența. Alegem finisajul, tăiem liniile și executăm fiecare muchie ca într-un atelier de design, nu ca într-un serviciu de volum.'}</p></div>
        <div className="art-manifesto-stat" data-reveal><span>01—04</span><strong>DESIGN<br />MATERIAL<br />FIT<br />FINISH</strong></div>
      </section>

      <section id="services" className="art-services art-section">
        <div className="art-section-head" data-reveal><div><span className="art-kicker">02 / MATERIAL LAB</span><h2>CE PUNEM<br /><em>PE MAȘINĂ.</em></h2></div><p>Patru direcții. Un singur standard: execuție care nu se vede ca montaj.</p></div>
        <div className="art-service-stage" data-reveal>
          <div className="art-service-list">{services.map((service, index) => <button key={service.id} className={activeService === index ? 'is-active' : ''} onMouseEnter={() => setActiveService(index)} onFocus={() => setActiveService(index)} onClick={() => setActiveService(index)}><span>0{index + 1}</span><strong>{service.name}</strong><small>{service.eyebrow}</small><ArrowUpRight size={17} /></button>)}</div>
          {active && <div className="art-service-visual"><Image src={active.imageUrl || '/images/hero-car.jpg'} alt="" fill sizes="(max-width: 900px) 100vw, 62vw" className="art-cover" unoptimized={/^https?:\/\//i.test(active.imageUrl)} /><div className="art-service-shade" /><div className="art-service-caption"><span>{String(activeService + 1).padStart(2, '0')} / {active.name}</span><ul>{active.benefits.slice(0, 3).map((benefit) => <li key={benefit}><Check size={12} />{benefit}</li>)}</ul></div></div>}
        </div>
      </section>

      <section id="transformation" className="art-transformation art-section">
        <div className="art-section-index">03 / TRANSFORMATION</div>
        <div className="art-transform-copy" data-reveal><span className="art-kicker">BEFORE / AFTER</span><h2>ÎNAINTE.<br /><em>DUPĂ.</em></h2><p>Diferența nu trebuie explicată. Trebuie văzută.</p></div>
        <div className="art-transform-grid" data-reveal>{transformations.slice(0, 2).map((item, index) => <article key={item.label} className="art-transform-card"><div className="art-transform-images"><div><Image src={item.before} alt={`${item.label} înainte`} fill sizes="50vw" className="art-cover" /></div><div><Image src={item.after} alt={`${item.label} după`} fill sizes="50vw" className="art-cover" /></div><span>0{index + 1}</span></div><div className="art-transform-label"><strong>{item.label}</strong><span>BEFORE <i>→</i> AFTER</span></div></article>)}</div>
      </section>

      <section id="portfolio" className="art-portfolio art-section">
        <div className="art-section-head" data-reveal><div><span className="art-kicker">04 / SELECTED WORK</span><h2>PROIECTE<br /><em>CU ATITUDINE.</em></h2></div><a className="art-text-button" href="#quote">START A PROJECT <ArrowUpRight size={14} /></a></div>
        <div className="art-project-grid">{portfolio.slice(0, 6).map((project, index) => <a className={`art-project art-project-${index + 1}`} href="#quote" key={project.id} data-reveal><div className="art-project-image"><Image src={project.coverUrl || '/images/hero-car.jpg'} alt={project.title || project.vehicle} fill sizes="(max-width: 800px) 100vw, 50vw" className="art-cover" unoptimized={/^https?:\/\//i.test(project.coverUrl)} /><div className="art-project-overlay" /></div><div className="art-project-meta"><span>0{index + 1} / {project.service}</span><strong>{project.title || project.vehicle}</strong><small>{project.finish || project.material}</small></div></a>)}</div>
      </section>

      <section id="process" className="art-process art-section">
        <div className="art-section-index">05 / HOW IT HAPPENS</div>
        <div className="art-process-head" data-reveal><span className="art-kicker">THE METHOD</span><h2>FĂRĂ<br /><em>SCURTĂTURI.</em></h2><p>{content.home.processIntro.body || 'Un proiect bun nu începe cu o folie. Începe cu o decizie corectă.'}</p></div>
        <div className="art-process-steps">{(content.home.processSteps.length ? content.home.processSteps : ['Consultație și direcție vizuală', 'Alegerea materialului și a finisajului', 'Pregătire, demontare și montaj', 'Control final și livrare']).slice(0, 4).map((step, index) => <div className="art-process-step" key={`${step}-${index}`} data-reveal><span>0{index + 1}</span><div><h3>{step}</h3><p>{['Înțelegem mașina, utilizarea și rezultatul urmărit.', 'Testăm combinația de culoare, textură și lumină.', 'Montajul este executat cu atenție pe fiecare muchie.', 'Predăm mașina doar când finisajul este la standard.'][index]}</p></div></div>)}</div>
      </section>

      <section className="art-proof art-section"><div className="art-proof-line" /><div className="art-proof-grid" data-reveal><div><span className="art-kicker">06 / CLIENT PROOF</span><strong>„{REVIEWS[0].quote}”</strong><span>{REVIEWS[0].name} — {REVIEWS[0].car}</span></div><div className="art-proof-numbers"><span>5.0</span><small>AVERAGE EXPERIENCE<br />RATED BY CLIENTS</small></div></div></section>

      <QuoteForm />
      <Footer />
    </main>
  )
}

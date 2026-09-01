'use client'

import { Star } from 'lucide-react'
import { REVIEWS } from '@/lib/constants'
import { useReveal } from '@/hooks/useReveal'

export function ReviewsSection() {
  const ref = useReveal<HTMLDivElement>()
  return (
    <section className="section section-carbon">
      <div className="section-shell">
        <div ref={ref} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">07 / FEEDBACK</p><h2 className="section-title">RESULTATUL<br /><span>SE VEDE.</span></h2></div>
          <p className="body-copy heading-note">În loc de promisiuni mari, lăsăm proiectele și experiența clienților să facă demonstrația.</p>
        </div>
        <div className="reviews-grid">
          {REVIEWS.map(r => (
            <article key={r.name} className="review-card">
              <div className="review-stars" aria-label={`${r.stars} din 5 stele`}>{Array.from({ length: r.stars }).map((_, i) => <Star key={i} size={13} fill="currentColor" />)}</div>
              <blockquote>“{r.quote}”</blockquote>
              <footer><strong>{r.name}</strong><span>{r.car}</span><small>{r.date}</small></footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

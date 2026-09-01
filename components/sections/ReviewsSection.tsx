'use client'

import { Star } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'
import { REVIEWS } from '@/lib/constants'
import type { ReviewContent } from '@/lib/site-content'

export function ReviewsSection() {
  const ref = useReveal<HTMLDivElement>()
  const { content } = useSiteContent()
  const reviews: ReviewContent[] = content.home.reviews.length ? content.home.reviews : [...REVIEWS]

  return (
    <section className="section section-carbon">
      <div className="section-shell">
        <div ref={ref} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">07 / FEEDBACK</p><h2 className="section-title">RESULTATUL<br /><span>SE VEDE.</span></h2></div>
          <p className="body-copy heading-note">În loc de promisiuni mari, lăsăm proiectele și experiența clienților să facă demonstrația.</p>
        </div>
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <article key={`${r.name}-${i}`} className="review-card">
              <div className="review-stars" aria-label={`${r.stars} din 5 stele`}>{Array.from({ length: r.stars }).map((_, index) => <Star key={index} size={13} fill="currentColor" />)}</div>
              <blockquote>“{r.quote}”</blockquote>
              <footer><strong>{r.name}</strong><span>{r.car}</span><small>{r.date}</small></footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

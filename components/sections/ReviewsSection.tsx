'use client'

import { useCallback, useRef, useState, type ReactNode } from 'react'
import { Star } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { useSiteContent } from '@/hooks/useSiteContent'
import { REVIEWS } from '@/lib/constants'
import type { ReviewContent } from '@/lib/site-content'

function RevealArticle({ children, delay, className }: { children: ReactNode; delay: number; className: string }) {
  const ref = useReveal<HTMLElement>({ delay })
  return <article ref={ref} className={`reveal ${className}`}>{children}</article>
}

export function ReviewsSection() {
  const ref = useReveal<HTMLDivElement>()
  const { content } = useSiteContent()
  const reviews: ReviewContent[] = content.home.reviews.length ? content.home.reviews : [...REVIEWS]
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  const carousel = reviews.length > 3

  const onScroll = useCallback(() => {
    const track = trackRef.current
    if (!track || track.children.length === 0) return
    const first = track.children[0] as HTMLElement
    const step = first.offsetWidth + 16
    setActive(Math.min(reviews.length - 1, Math.max(0, Math.round(track.scrollLeft / step))))
  }, [reviews.length])

  const goTo = (index: number) => {
    const track = trackRef.current
    const card = track?.children[index] as HTMLElement | undefined
    if (!track || !card) return
    track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
  }

  return (
    <section className="section section-carbon reviews-section">
      <div className="section-shell">
        <div ref={ref} className="reveal section-heading section-heading-split">
          <div><p className="eyebrow">07 / FEEDBACK</p><h2 className="section-title">RESULTATUL<br /><span>SE VEDE.</span></h2></div>
          <p className="body-copy heading-note">În loc de promisiuni mari, lăsăm proiectele și experiența clienților să facă demonstrația.</p>
        </div>
        <div ref={trackRef} onScroll={carousel ? onScroll : undefined} className={carousel ? 'reviews-grid reviews-carousel' : 'reviews-grid'}>
          {reviews.map((r, i) => (
            <RevealArticle key={`${r.name}-${i}`} delay={Math.min(i, 5) * 80} className="review-card glass glass-hover">
              <div className="review-stars" aria-label={`${r.stars} din 5 stele`}>{Array.from({ length: r.stars }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}</div>
              <blockquote>“{r.quote}”</blockquote>
              <footer><strong>{r.name}</strong><span>{r.car}</span><small>{r.date}</small></footer>
            </RevealArticle>
          ))}
        </div>
        {carousel && (
          <div className="reviews-dots" role="group" aria-label="Recenzii">
            {reviews.map((r, i) => (
              <button key={`${r.name}-dot-${i}`} type="button" className={i === active ? 'is-active' : undefined} aria-label={`Recenzia ${i + 1}`} aria-current={i === active || undefined} onClick={() => goTo(i)} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

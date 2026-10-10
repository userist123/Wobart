'use client'

import { useSiteContent } from '@/hooks/useSiteContent'
import { defaultSiteContent, type SiteContent } from '@/lib/site-content'

type JsonLd = Record<string, unknown>

export function buildStructuredData(content: SiteContent): object {
  const { global: g, seo, services, home } = content
  const canonical = seo.canonicalUrl || ''
  const businessId = `${canonical}#business`
  const graph: JsonLd[] = []

  const business: JsonLd = { '@type': 'AutomotiveBusiness', '@id': businessId }
  if (g.brandName) business.name = g.brandName
  if (g.phone) business.telephone = g.phone
  if (g.email) business.email = g.email
  if (g.address || g.city) {
    business.address = {
      '@type': 'PostalAddress',
      ...(g.address ? { streetAddress: g.address } : {}),
      ...(g.city ? { addressLocality: g.city } : {}),
      addressCountry: 'RO',
    }
  }
  if (seo.canonicalUrl) business.url = seo.canonicalUrl
  if (seo.ogImageUrl) business.image = seo.ogImageUrl
  const sameAs = [g.instagramUrl, g.facebookUrl].filter(Boolean)
  if (sameAs.length > 0) business.sameAs = sameAs
  if (g.openingHours) business.openingHours = g.openingHours
  if (seo.description) business.description = seo.description

  const reviews = home.reviews ?? []
  if (reviews.length > 0) {
    const mean = reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length
    business.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Math.round(mean * 10) / 10,
      reviewCount: reviews.length,
      bestRating: 5,
    }
  }
  graph.push(business)

  for (const service of services.filter((s) => s.active)) {
    const node: JsonLd = {
      '@type': 'Service',
      name: service.name,
      provider: { '@id': businessId },
      serviceType: service.eyebrow || service.name,
    }
    if (service.description) node.description = service.description
    if (service.imageUrl) node.image = service.imageUrl
    graph.push(node)
  }

  const faqItems = (home.faq ?? defaultSiteContent.home.faq)?.items.filter((i) => i.active) ?? []
  if (faqItems.length > 0) {
    graph.push({
      '@type': 'FAQPage',
      mainEntity: faqItems.map((i) => ({
        '@type': 'Question',
        name: i.question,
        acceptedAnswer: { '@type': 'Answer', text: i.answer },
      })),
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

export function StructuredData() {
  const { content, ready } = useSiteContent()
  if (!ready) return null
  const json = JSON.stringify(buildStructuredData(content)).replace(/</g, '\\u003c')
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />
}

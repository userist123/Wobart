import { z } from 'zod'

const stringArray = z.array(z.string().trim()).default([])

export const reviewContentSchema = z.object({
  name: z.string().trim(),
  car: z.string().trim(),
  date: z.string().trim(),
  quote: z.string().trim(),
  stars: z.number().int().min(1).max(5),
})

export const serviceContentSchema = z.object({
  id: z.string(), name: z.string(), slug: z.string(), eyebrow: z.string(), description: z.string(),
  benefits: stringArray, process: stringArray, materials: stringArray, imageUrl: z.string(),
  active: z.boolean(), sortOrder: z.number().int(),
})

export const portfolioContentSchema = z.object({
  id: z.string(), title: z.string(), slug: z.string(), vehicle: z.string(), service: z.string(),
  material: z.string(), finish: z.string(), description: z.string(), coverUrl: z.string(),
  gallery: stringArray, featured: z.boolean(), active: z.boolean(), sortOrder: z.number().int(),
})

export const siteContentSchema = z.object({
  global: z.object({
    brandName: z.string(), tagline: z.string(), phone: z.string(), email: z.string(), address: z.string(),
    city: z.string(), instagramUrl: z.string(), facebookUrl: z.string(), openingHours: z.string(),
  }),
  home: z.object({
    hero: z.object({
      eyebrow: z.string(), title: z.string(), description: z.string(), primaryCtaLabel: z.string(),
      primaryCtaHref: z.string(), secondaryCtaLabel: z.string(), secondaryCtaHref: z.string(),
      imageUrl: z.string(), videoUrl: z.string(),
    }),
    statement: z.object({ eyebrow: z.string(), title: z.string(), body: z.string() }),
    trustItems: stringArray,
    processIntro: z.object({ eyebrow: z.string(), title: z.string(), body: z.string() }),
    processSteps: stringArray,
    reviews: z.array(reviewContentSchema),
    cta: z.object({ eyebrow: z.string(), title: z.string(), body: z.string(), buttonLabel: z.string(), buttonHref: z.string() }),
  }),
  services: z.array(serviceContentSchema),
  portfolio: z.array(portfolioContentSchema),
  seo: z.object({ title: z.string(), description: z.string(), canonicalUrl: z.string(), ogImageUrl: z.string(), robotsIndex: z.boolean() }),
  theme: z.object({ accent: z.string(), background: z.string(), surface: z.string(), text: z.string(), motionLevel: z.enum(['restrained', 'expressive', 'immersive']) }),
})

export type ValidatedSiteContent = z.infer<typeof siteContentSchema>

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

export const transformationContentSchema = z.object({
  before: z.string().trim(),
  after: z.string().trim(),
  label: z.string().trim(),
  active: z.boolean(),
  sortOrder: z.number().int(),
})

export const wrapColorContentSchema = z.object({
  id: z.string().trim(),
  name: z.string().trim(),
  hex: z.string().trim().regex(/^#[0-9a-fA-F]{6}$/),
  finish: z.enum(['gloss', 'matte', 'satin', 'chrome', 'color-shift']),
  active: z.boolean(),
  sortOrder: z.number().int(),
})

export const faqItemContentSchema = z.object({
  question: z.string().trim(),
  answer: z.string().trim(),
  active: z.boolean(),
  sortOrder: z.number().int(),
})

/** Optional, backwards compatible: published documents without these keys still validate. */
export const configuratorContentSchema = z.object({
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  body: z.string().default(''),
  posterUrl: z.string().default(''),
  colors: z.array(wrapColorContentSchema).default([]),
}).default({ eyebrow: '', title: '', body: '', posterUrl: '', colors: [] })

export const faqContentSchema = z.object({
  eyebrow: z.string().default(''),
  title: z.string().default(''),
  body: z.string().default(''),
  items: z.array(faqItemContentSchema).default([]),
}).default({ eyebrow: '', title: '', body: '', items: [] })

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
    transformations: z.array(transformationContentSchema).default([]),
    reviews: z.array(reviewContentSchema),
    cta: z.object({ eyebrow: z.string(), title: z.string(), body: z.string(), buttonLabel: z.string(), buttonHref: z.string() }),
    configurator: configuratorContentSchema,
    faq: faqContentSchema,
  }),
  services: z.array(serviceContentSchema),
  portfolio: z.array(portfolioContentSchema),
  seo: z.object({ title: z.string(), description: z.string(), canonicalUrl: z.string(), ogImageUrl: z.string(), robotsIndex: z.boolean() }),
  theme: z.object({ accent: z.string(), background: z.string(), surface: z.string(), text: z.string(), motionLevel: z.enum(['restrained', 'expressive', 'immersive']) }),
})

export type ValidatedSiteContent = z.infer<typeof siteContentSchema>

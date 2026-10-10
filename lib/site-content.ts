export type ReviewContent = {
  name: string
  car: string
  date: string
  quote: string
  stars: number
}

export type ServiceContent = {
  id: string
  name: string
  slug: string
  eyebrow: string
  description: string
  benefits: string[]
  process: string[]
  materials: string[]
  imageUrl: string
  active: boolean
  sortOrder: number
}

export type PortfolioContent = {
  id: string
  title: string
  slug: string
  vehicle: string
  service: string
  material: string
  finish: string
  description: string
  coverUrl: string
  gallery: string[]
  featured: boolean
  active: boolean
  sortOrder: number
}

export type TransformationContent = {
  before: string
  after: string
  label: string
  active: boolean
  sortOrder: number
}

export type WrapFinish = 'gloss' | 'matte' | 'satin' | 'chrome' | 'color-shift'

export type WrapColorContent = {
  id: string
  name: string
  hex: string
  finish: WrapFinish
  active: boolean
  sortOrder: number
}

export type FaqItemContent = {
  question: string
  answer: string
  active: boolean
  sortOrder: number
}

export type ConfiguratorContent = {
  eyebrow: string
  title: string
  body: string
  posterUrl: string
  colors: WrapColorContent[]
}

export type FaqContent = {
  eyebrow: string
  title: string
  body: string
  items: FaqItemContent[]
}

export type SiteContent = {
  global: {
    brandName: string
    tagline: string
    phone: string
    email: string
    address: string
    city: string
    instagramUrl: string
    facebookUrl: string
    openingHours: string
  }
  home: {
    hero: {
      eyebrow: string
      title: string
      description: string
      primaryCtaLabel: string
      primaryCtaHref: string
      secondaryCtaLabel: string
      secondaryCtaHref: string
      imageUrl: string
      videoUrl: string
    }
    statement: { eyebrow: string; title: string; body: string }
    trustItems: string[]
    processIntro: { eyebrow: string; title: string; body: string }
    processSteps: string[]
    transformations: TransformationContent[]
    reviews: ReviewContent[]
    cta: { eyebrow: string; title: string; body: string; buttonLabel: string; buttonHref: string }
    /** Optional in stored documents published before 2026-10; readers must fall back to the defaults. */
    configurator?: ConfiguratorContent
    faq?: FaqContent
  }
  services: ServiceContent[]
  portfolio: PortfolioContent[]
  seo: { title: string; description: string; canonicalUrl: string; ogImageUrl: string; robotsIndex: boolean }
  theme: { accent: string; background: string; surface: string; text: string; motionLevel: 'restrained' | 'expressive' | 'immersive' }
}

export const defaultSiteContent: SiteContent = {
  global: { brandName: 'WOB ART', tagline: '', phone: '', email: '', address: '', city: '', instagramUrl: '', facebookUrl: '', openingHours: '' },
  home: {
    hero: { eyebrow: '', title: 'MAȘINA TA.\nREINVENTATĂ.', description: '', primaryCtaLabel: 'Solicită ofertă', primaryCtaHref: '#quote', secondaryCtaLabel: 'Vezi transformările', secondaryCtaHref: '#portfolio', imageUrl: '/images/hero-car.jpg', videoUrl: '' },
    statement: { eyebrow: '', title: '', body: '' },
    trustItems: [],
    processIntro: { eyebrow: '', title: '', body: '' },
    processSteps: [],
    transformations: [
      { before: '/images/ba-before-1.jpg', after: '/images/ba-after-1.jpg', label: 'BMW Seria 5 — Negru Mat', active: true, sortOrder: 0 },
      { before: '/images/ba-before-2.jpg', after: '/images/ba-after-2.jpg', label: 'Audi A4 — Satin Midnight Blue', active: true, sortOrder: 1 },
      { before: '/images/ba-before-3.jpg', after: '/images/ba-after-3.jpg', label: 'Porsche Cayenne — Gloss Auriu', active: true, sortOrder: 2 },
    ],
    reviews: [],
    cta: { eyebrow: '', title: '', body: '', buttonLabel: 'Solicită ofertă', buttonHref: '#quote' },
    configurator: {
      eyebrow: '',
      title: '',
      body: '',
      posterUrl: '/images/hero-car.jpg',
      colors: [
        { id: 'satin-black', name: 'Satin Black', hex: '#141414', finish: 'satin', active: true, sortOrder: 0 },
        { id: 'gloss-midnight-blue', name: 'Gloss Midnight Blue', hex: '#0B1F4D', finish: 'gloss', active: true, sortOrder: 1 },
        { id: 'matte-military-green', name: 'Matte Military Green', hex: '#3A4A2F', finish: 'matte', active: true, sortOrder: 2 },
        { id: 'gloss-pearl-white', name: 'Gloss Pearl White', hex: '#EDEDE6', finish: 'gloss', active: true, sortOrder: 3 },
        { id: 'chrome-silver', name: 'Brushed Chrome', hex: '#B9BEC4', finish: 'chrome', active: true, sortOrder: 4 },
        { id: 'color-shift-aurora', name: 'Color-Shift Aurora', hex: '#5B2BD9', finish: 'color-shift', active: true, sortOrder: 5 },
      ],
    },
    faq: { eyebrow: '', title: '', body: '', items: [] },
  },
  services: [],
  portfolio: [],
  seo: { title: '', description: '', canonicalUrl: '', ogImageUrl: '', robotsIndex: true },
  theme: { accent: '#E8FF00', background: '#0A0A0A', surface: '#111111', text: '#F0F0F0', motionLevel: 'restrained' },
}

/** Readers use this so a published document from before the configurator/FAQ keys still renders. */
export function withContentDefaults(content: SiteContent): SiteContent {
  return {
    ...content,
    home: {
      ...content.home,
      configurator: content.home.configurator ?? defaultSiteContent.home.configurator,
      faq: content.home.faq ?? defaultSiteContent.home.faq,
    },
  }
}

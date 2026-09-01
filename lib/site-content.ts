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
    reviews: ReviewContent[]
    cta: { eyebrow: string; title: string; body: string; buttonLabel: string; buttonHref: string }
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
    reviews: [],
    cta: { eyebrow: '', title: '', body: '', buttonLabel: 'Solicită ofertă', buttonHref: '#quote' },
  },
  services: [],
  portfolio: [],
  seo: { title: '', description: '', canonicalUrl: '', ogImageUrl: '', robotsIndex: true },
  theme: { accent: '#E8FF00', background: '#0A0A0A', surface: '#111111', text: '#F0F0F0', motionLevel: 'restrained' },
}

// WOB ART — Homepage — v8 clean
import { Navbar } from '@/components/sections/Navbar'
import { HeroSection } from '@/components/sections/HeroSection'
import { TrustBar } from '@/components/sections/TrustBar'
import { BrandStatementSection } from '@/components/sections/BrandStatementSection'
import { ServicesSection } from '@/components/sections/ServicesSection'
import { BeforeAfterSection } from '@/components/sections/BeforeAfterSection'
import { PortfolioSection } from '@/components/sections/PortfolioSection'
import { EstimatorSection } from '@/components/sections/EstimatorSection'
import { ProcessSection } from '@/components/sections/ProcessSection'
import { ReviewsSection } from '@/components/sections/ReviewsSection'
import { QuoteForm } from '@/components/sections/QuoteForm'
import { CtaSection } from '@/components/sections/CtaSection'
import { Footer } from '@/components/sections/Footer'
import { ConfiguratorSection } from '@/components/sections/ConfiguratorSection'
import { FaqSection } from '@/components/sections/FaqSection'
import { StructuredData } from '@/components/seo/StructuredData'
import { WhatsAppCta } from '@/components/ui/WhatsAppCta'
import { Cursor } from '@/components/ui/Cursor'

export default function HomePage() {
  return (
    <main id="top" className="site-main">
      <Cursor />
      <Navbar />
      <HeroSection />
      <TrustBar />
      <BrandStatementSection />
      <ServicesSection />
      <ConfiguratorSection />
      <BeforeAfterSection />
      <PortfolioSection />
      <ProcessSection />
      <EstimatorSection />
      <ReviewsSection />
      <FaqSection />
      <QuoteForm />
      <CtaSection />
      <Footer />
      <StructuredData />
      <WhatsAppCta />
    </main>
  )
}

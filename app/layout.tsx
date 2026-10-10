import type { Metadata, Viewport } from 'next'
import { Unbounded, Outfit, JetBrains_Mono } from 'next/font/google'
import { LenisProvider } from '@/components/LenisProvider'
import './globals.css'
import './wob-art-premium.css'
import './wob-art-hero.css'
import './wob-art-footer.css'
import './wob-art-conversion.css'
import './wob-art-navigation.css'
import './wob-art-composition.css'
import './wob-art-mobile.css'
import './wob-art-interactions.css'
import './wob-art-type-rhythm.css'
import './wob-art-portfolio.css'
import './wob-art-transformation.css'
import './wob-art-services.css'
import './wob-art-process.css'
import './wob-art-reviews.css'
import './wob-art-closing.css'
import './wob-art-quote-polish.css'
import './wob-art-configurator.css'
import './wob-art-faq.css'
import './wob-art-whatsapp.css'
import './wob-art-v2.css'
import './wob-art-particle-hero.css'

const unbounded = Unbounded({ weight: ['600', '700', '900'], subsets: ['latin'], variable: '--font-unbounded', display: 'swap' })
const outfit = Outfit({ weight: ['300', '400', '500', '600'], subsets: ['latin'], variable: '--font-outfit', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'WOB ART — Car Wrapping, PPF & Detailing | București',
  description: 'Atelier de car wrapping, PPF și detailing în București. Descoperă servicii de transformare și protecție pentru vehiculul tău, cu consultanță pentru alegerea finisajului potrivit.',
  keywords: 'car wrapping, PPF, detailing, folie auto, protecție vopsea, wrap mașină, WOB ART, București',
  openGraph: { title: 'WOB ART — Car Wrapping, PPF & Detailing', description: 'Transformare și protecție auto în București.', type: 'website' },
}

export const viewport: Viewport = { themeColor: '#050505' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" data-scroll-behavior="smooth" className={`${unbounded.variable} ${outfit.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#050505] text-white">
        <div className="holo-bg" aria-hidden="true" />
        <LenisProvider />
        {children}
      </body>
    </html>
  )
}

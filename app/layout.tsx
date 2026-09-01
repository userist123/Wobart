import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Barlow_Condensed, DM_Sans, JetBrains_Mono } from 'next/font/google'
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

const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas-neue', display: 'swap' })
const barlowCondensed = Barlow_Condensed({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-barlow-condensed', display: 'swap' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' })

export const metadata: Metadata = {
  title: 'WOB ART — Car Wrapping, PPF & Detailing | București',
  description: 'Atelier de car wrapping, PPF și detailing în București. Descoperă servicii de transformare și protecție pentru vehiculul tău, cu consultanță pentru alegerea finisajului potrivit.',
  keywords: 'car wrapping, PPF, detailing, folie auto, protecție vopsea, wrap mașină, WOB ART, București',
  openGraph: { title: 'WOB ART — Car Wrapping, PPF & Detailing', description: 'Transformare și protecție auto în București.', type: 'website' },
}

export const viewport: Viewport = { themeColor: '#0A0A0A' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" data-scroll-behavior="smooth" className={`${bebasNeue.variable} ${barlowCondensed.variable} ${dmSans.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased bg-[#0A0A0A] text-[#F0F0F0]">
        <LenisProvider />
        {children}
      </body>
    </html>
  )
}

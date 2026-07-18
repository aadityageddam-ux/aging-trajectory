import type { Metadata } from 'next'
import { Inter, Instrument_Serif, JetBrains_Mono } from 'next/font/google'
import EcosystemNav from '@/components/EcosystemNav'
import './globals.css'

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
})

const instrumentSerif = Instrument_Serif({
  variable: '--font-instrument-serif',
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'AgingTrajectory — Watch Two Aging Clocks Diverge',
  description:
    'A synthetic, pedagogical simulator that evolves a patient’s biomarkers over years and plots ' +
    'PhenoAge vs. an illustrative GrimAge proxy vs. chronological age. Not a diagnostic tool.',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#FAFAFA] text-[#18181B]">
        <EcosystemNav />
        {children}
      </body>
    </html>
  )
}

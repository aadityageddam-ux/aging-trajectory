import type { Metadata } from 'next'
import EcosystemNav from '@/components/EcosystemNav'
import './globals.css'

export const metadata: Metadata = {
  title: 'AgingTrajectory · Clinical Phenotypic Age sensitivity',
  description: 'An educational simulator showing how explicitly synthetic biomarker changes affect the published clinical Phenotypic Age equation.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="antialiased">
      <body className="min-h-screen bg-[#FAFAF9] text-zinc-950"><EcosystemNav />{children}</body>
    </html>
  )
}

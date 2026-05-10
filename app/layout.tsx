import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const instrumentSerif = Plus_Jakarta_Sans({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-instrument-serif',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.lexavo.fr'),
  title: {
    default: 'Lexavo — Publiez facilement pour faire entendre votre droit.',
    template: '%s | Lexavo',
  },
  description: 'Lexavo génère vos articles SEO et posts pour vos réseaux sociaux (LinkedIn et Facebook) conformes à la déontologie du barreau. Publiez facilement pour faire entendre votre droit. Essai gratuit sans carte bancaire.',
  keywords: ['avocat', 'contenu juridique', 'réseaux sociaux avocat', 'SEO cabinet avocat', 'publication automatique', 'LinkedIn avocat', 'Facebook avocat', 'marketing juridique', 'déontologie barreau'],
  authors: [{ name: 'Lexavo' }],
  creator: 'Lexavo',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.lexavo.fr',
    siteName: 'Lexavo',
    title: 'Lexavo — Publiez facilement pour faire entendre votre droit.',
    description: 'Lexavo génère vos articles SEO et posts pour vos réseaux sociaux (LinkedIn et Facebook) conformes à la déontologie du barreau. Publiez facilement pour faire entendre votre droit. Essai gratuit.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lexavo — Publiez facilement pour faire entendre votre droit.',
    description: 'Lexavo génère vos articles SEO et posts pour vos réseaux sociaux conformes à la déontologie du barreau. Publiez facilement pour faire entendre votre droit.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://www.lexavo.fr',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}>
        {children}
      </body>
    </html>
  )
}

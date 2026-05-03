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
    default: 'Lexavo — Contenu juridique automatisé pour avocats',
    template: '%s | Lexavo',
  },
  description: 'Lexavo génère vos articles SEO, posts Facebook et LinkedIn conformes à la déontologie du barreau. Publiez automatiquement en 3 minutes. Essai gratuit sans carte bancaire.',
  keywords: ['avocat', 'contenu juridique', 'réseaux sociaux avocat', 'SEO cabinet avocat', 'publication automatique', 'Facebook LinkedIn avocat', 'marketing juridique', 'déontologie barreau'],
  authors: [{ name: 'Lexavo' }],
  creator: 'Lexavo',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.lexavo.fr',
    siteName: 'Lexavo',
    title: 'Lexavo — Contenu juridique automatisé pour avocats',
    description: 'Lexavo génère vos articles SEO, posts Facebook et LinkedIn conformes à la déontologie du barreau. Publiez automatiquement en 3 minutes. Essai gratuit.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lexavo — Contenu juridique automatisé pour avocats',
    description: 'Lexavo génère vos articles SEO, posts Facebook et LinkedIn conformes à la déontologie du barreau. Publiez automatiquement en 3 minutes.',
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

import type { Metadata } from 'next'
import { Inter, Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
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
    default: 'Application avocat IA — contenu SEO & réseaux | Lexavo',
    template: '%s | Lexavo',
  },
  description: "Lexavo, l'application avocat IA qui génère articles SEO, posts LinkedIn et Facebook conformes à la déontologie. Essai gratuit, sans carte bancaire.",
  keywords: ['application avocat IA', 'avocat', 'IA pour avocat', 'contenu juridique', 'réseaux sociaux avocat', 'SEO cabinet avocat', 'publication automatique', 'LinkedIn avocat', 'Facebook avocat', 'marketing juridique', 'déontologie barreau'],
  authors: [{ name: 'Lexavo' }],
  creator: 'Lexavo',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.lexavo.fr',
    siteName: 'Lexavo',
    title: 'Application avocat IA — contenu SEO & réseaux | Lexavo',
    description: "Lexavo, l'application avocat IA qui génère articles SEO, posts LinkedIn et Facebook conformes à la déontologie. Essai gratuit, sans carte bancaire.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Application avocat IA — contenu SEO & réseaux | Lexavo',
    description: "Lexavo, l'application avocat IA qui génère articles SEO, posts LinkedIn et Facebook conformes à la déontologie du barreau.",
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
        <Analytics />
      </body>
    </html>
  )
}

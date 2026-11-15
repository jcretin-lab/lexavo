import type { Metadata } from 'next'
import { Bodoni_Moda, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

// Les noms de variables historiques (--font-inter, --font-instrument-serif) sont conservés
// pour que les pages existantes (contact, pages légales) héritent des nouvelles polices.
const inter = Hanken_Grotesk({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const instrumentSerif = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-instrument-serif',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.lexavo.fr'),
  title: {
    default: 'Site internet pour avocat, sans abonnement | Lexavo',
    template: '%s | Lexavo',
  },
  description: "Création du site de votre cabinet d'avocat, sans abonnement : module pour modifier vos textes, SEO et GEO pour Google et les IA. Dès 890 €, devis sous 48 h.",
  keywords: ['création site internet avocat', 'site avocat', 'site cabinet avocat', 'agence web avocat', 'refonte site avocat', 'référencement avocat', 'site avocat sans abonnement', 'GEO avocat'],
  authors: [{ name: 'Lexavo' }],
  creator: 'Lexavo',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.lexavo.fr',
    siteName: 'Lexavo',
    title: 'Le site de votre cabinet, sans abonnement | Lexavo',
    description: "Création du site de votre cabinet d'avocat, sans abonnement : module pour modifier vos textes, SEO et GEO pour Google et les IA. Dès 890 €, devis sous 48 h.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Le site de votre cabinet, sans abonnement | Lexavo',
    description: "Création du site de votre cabinet d'avocat, sans abonnement : module pour modifier vos textes, SEO et GEO pour Google et les IA. Dès 890 €, devis sous 48 h.",
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

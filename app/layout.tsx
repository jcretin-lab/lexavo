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
    default: 'Création de site internet pour avocat | Lexavo',
    template: '%s | Lexavo',
  },
  description: "Lexavo conçoit, rédige et met en ligne le site de votre cabinet d'avocats, dans le respect des règles de communication de la profession. Devis sous 48 h.",
  keywords: ['création site internet avocat', 'site avocat', 'site cabinet avocat', 'agence web avocat', 'refonte site avocat', 'référencement avocat', 'déontologie communication avocat'],
  authors: [{ name: 'Lexavo' }],
  creator: 'Lexavo',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://www.lexavo.fr',
    siteName: 'Lexavo',
    title: 'Création de site internet pour avocat | Lexavo',
    description: "Lexavo conçoit, rédige et met en ligne le site de votre cabinet d'avocats, dans le respect des règles de communication de la profession. Devis sous 48 h.",
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Création de site internet pour avocat | Lexavo',
    description: "Lexavo conçoit, rédige et met en ligne le site de votre cabinet d'avocats, dans le respect des règles de communication de la profession. Devis sous 48 h.",
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

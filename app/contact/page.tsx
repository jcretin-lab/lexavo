import Link from 'next/link'
import { ContactForm } from './contact-form'

export const metadata = {
  title: 'Contact — Lexavo',
}

const FAQ = [
  {
    q: 'Est-ce que Lexavo fonctionne sans site web ?',
    r: 'Oui. Lexavo génère du contenu pour vos réseaux sociaux et votre blog indépendamment de votre site web.',
  },
  {
    q: 'Puis-je annuler mon abonnement à tout moment ?',
    r: 'Oui, sans engagement ni frais. La résiliation prend effet à la fin du mois en cours.',
  },
  {
    q: 'Les contenus respectent-ils la déontologie du barreau ?',
    r: 'Oui. Lexavo intègre les règles du RIN et du décret du 12 juillet 2005 dans chaque génération. Nous vous recommandons toutefois de relire chaque contenu avant publication.',
  },
  {
    q: 'Comment connecter mes réseaux sociaux ?',
    r: 'Réservez un appel gratuit de 15 minutes avec notre équipe. Nous configurons ensemble vos réseaux sociaux (LinkedIn, Facebook, Instagram...) selon vos besoins.',
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">← Retour à l&apos;accueil</Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contactez-nous</h1>
          <p className="text-gray-500">Une question sur Lexavo ? Notre équipe vous répond sous 24h ouvrées.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-sm text-gray-500">Email :</span>
            <a href="mailto:contact@lexavo.fr" className="text-sm font-medium text-blue-600 hover:underline">contact@lexavo.fr</a>
          </div>
          <ContactForm />
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Questions fréquentes</h2>
          <div className="space-y-4">
            {FAQ.map(({ q, r }) => (
              <div key={q} className="rounded-xl border border-gray-200 p-5">
                <p className="font-medium text-gray-900 mb-2">{q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

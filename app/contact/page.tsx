import Link from 'next/link'
import { ContactForm } from './contact-form'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

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
    r: "Depuis votre tableau de bord, téléchargez en un clic le scénario Make.com prêt à l'emploi ainsi que son guide de configuration. Vous obtenez ensuite une URL webhook que vous collez dans Lexavo. Comptez environ 20 minutes pour la mise en place initiale.",
  },
]

const NAVY  = '#0F2247'
const PAPER = '#F3EFE5'
const INK   = '#0F0E0C'
const MID   = '#6E6860'
const RULE  = '#D0CBC0'
const GOLD  = '#B8872A'

export default function ContactPage() {
  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>
      <LandingNav />

      <div className="max-w-3xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>

        {/* En-tête */}
        <div style={{ borderTop: `1px solid ${RULE}`, paddingTop: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: GOLD }}>
              CONTACT
            </span>
            <Link href="/" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.15em', color: MID, textDecoration: 'none' }} className="hover:text-black transition-colors">
              ← ACCUEIL
            </Link>
          </div>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', fontStyle: 'italic', fontWeight: 400, color: INK, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
            Contactez-nous.
          </h1>
          <p style={{ fontSize: '1rem', color: MID, lineHeight: 1.65 }}>
            Une question sur Lexavo ? Notre équipe vous répond sous 24h ouvrées.
          </p>
          <a href="mailto:contact@lexavo.fr" style={{ display: 'inline-block', marginTop: '0.75rem', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '12px', letterSpacing: '0.12em', color: GOLD, textDecoration: 'none' }} className="hover:underline">
            contact@lexavo.fr
          </a>
        </div>

        {/* Formulaire */}
        <div style={{ borderTop: `1px solid ${RULE}`, paddingTop: '2rem', marginBottom: '3.5rem' }}>
          <ContactForm />
        </div>

        {/* FAQ */}
        <div>
          <div style={{ borderTop: `1px solid ${RULE}`, paddingTop: '1.5rem', marginBottom: '1.75rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: GOLD }}>
              QUESTIONS FRÉQUENTES
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.5rem', fontStyle: 'italic', fontWeight: 400, color: INK, letterSpacing: '-0.02em', marginBottom: '1.75rem' }}>
            Vos questions, nos réponses.
          </h2>
          <div className="space-y-3">
            {FAQ.map(({ q, r }) => (
              <div key={q} style={{ borderTop: `1px solid ${RULE}`, paddingTop: '1.125rem', paddingBottom: '1.125rem' }}>
                <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1rem', fontStyle: 'italic', color: INK, marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>{q}</p>
                <p style={{ fontSize: '0.875rem', color: MID, lineHeight: 1.7 }}>{r}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}

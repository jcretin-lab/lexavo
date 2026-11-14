import Link from 'next/link'
import { ContactForm } from './contact-form'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { EMAIL_CONTACT, FORFAITS } from '@/lib/offre'

export const metadata = {
  title: 'Demander un devis',
  description: 'Décrivez votre cabinet et votre projet de site internet : réponse sous 48 h ouvrées avec une proposition.',
}

const PAPER = '#F3EFE5'
const INK   = '#0F0E0C'
const MID   = '#6E6860'
const RULE  = '#D0CBC0'
const GOLD  = '#B8872A'

const APRES = [
  'Nous lisons votre demande et regardons votre site actuel, si vous en avez un.',
  'Nous vous proposons un créneau de 30 minutes pour en parler.',
  'Vous recevez un devis ferme sous 48 h après cet échange.',
]

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ forfait?: string }> }) {
  const { forfait } = await searchParams
  const forfaitInitial = FORFAITS.find((f) => f.id === forfait)?.id ?? ''

  return (
    <div style={{ background: PAPER, minHeight: '100vh', color: INK }}>
      <LandingNav />

      <div className="max-w-3xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>

        {/* En-tête */}
        <div style={{ borderTop: `1px solid ${RULE}`, paddingTop: '1.5rem', marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: GOLD }}>
              DEMANDE DE DEVIS
            </span>
            <Link href="/" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.15em', color: MID, textDecoration: 'none' }} className="hover:text-black transition-colors">
              ← ACCUEIL
            </Link>
          </div>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 4vw, 2.75rem)', fontStyle: 'italic', fontWeight: 400, color: INK, letterSpacing: '-0.025em', lineHeight: 1.1, marginBottom: '0.75rem' }}>
            Parlons de votre site.
          </h1>
          <p style={{ fontSize: '1rem', color: MID, lineHeight: 1.65 }}>
            Quelques lignes suffisent : votre cabinet, vos domaines d&apos;intervention, ce que vous attendez du site. Le devis est gratuit et sans engagement.
          </p>
          <a href={`mailto:${EMAIL_CONTACT}`} style={{ display: 'inline-block', marginTop: '0.75rem', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '12px', letterSpacing: '0.12em', color: GOLD, textDecoration: 'none' }} className="hover:underline">
            {EMAIL_CONTACT}
          </a>
        </div>

        {/* Formulaire */}
        <div style={{ borderTop: `1px solid ${RULE}`, paddingTop: '2rem', marginBottom: '3.5rem' }}>
          <ContactForm forfaitInitial={forfaitInitial} forfaits={FORFAITS.map(({ id, nom }) => ({ id, nom }))} />
        </div>

        {/* Et ensuite */}
        <div style={{ borderTop: `1px solid ${RULE}`, paddingTop: '1.5rem' }}>
          <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: GOLD }}>
            ET ENSUITE ?
          </span>
          <ol className="mt-5 space-y-4" style={{ listStyle: 'none', padding: 0 }}>
            {APRES.map((texte, i) => (
              <li key={texte} className="flex gap-4" style={{ fontSize: '0.9375rem', color: MID, lineHeight: 1.6 }}>
                <span style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontSize: '1.25rem', color: GOLD, lineHeight: 1.2 }}>{i + 1}</span>
                {texte}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <LandingFooter />
    </div>
  )
}

import Image from 'next/image'
import { ContactForm } from './contact-form'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { EMAIL_CONTACT, FORFAITS } from '@/lib/offre'
import photoSignature from '@/public/photos/signature.jpg'

export const metadata = {
  title: 'Demander un devis',
  description: 'Décrivez votre cabinet et votre projet de site internet : réponse sous 48 h ouvrées avec une proposition.',
}

const APRES = [
  'Nous lisons votre demande et regardons votre site actuel, si vous en avez un.',
  'Nous vous proposons un créneau de 30 minutes pour en parler.',
  'Vous recevez un devis ferme sous 48 h après cet échange.',
]

function EtEnsuite({ className }: { className: string }) {
  return (
    <div className={`lx-devis__suite-bloc ${className}`}>
      <h2 className="lx-devis__suite-titre">Et ensuite ?</h2>
      <ol className="lx-devis__suite">
        {APRES.map((texte, i) => (
          <li key={texte}>
            <span aria-hidden="true">{i + 1}</span>
            {texte}
          </li>
        ))}
      </ol>
      <p className="lx-devis__email">
        Vous préférez écrire directement ?{' '}
        <a className="lx-lien" href={`mailto:${EMAIL_CONTACT}`}>{EMAIL_CONTACT}</a>
      </p>
    </div>
  )
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ forfait?: string }> }) {
  const { forfait } = await searchParams
  const forfaitInitial = FORFAITS.find((f) => f.id === forfait)?.id ?? ''

  return (
    <>
      <LandingNav solide />

      <main className="lx lx-devis">
        <div className="lx-devis__grille">
          <aside className="lx-devis__aside">
            <div className="lx-devis__photo">
              <Image src={photoSignature} alt="" fill priority placeholder="blur" sizes="(min-width: 1024px) 42vw, 100vw" />
            </div>
            <div className="lx-devis__voile" />

            <div className="lx-devis__aside-contenu">
              <h1 className="lx-display lx-devis__titre">
                <span className="lx-ligne"><span>Parlons de</span></span>
                <span className="lx-ligne"><span>votre site.</span></span>
              </h1>
              <p className="lx-devis__intro">
                Quelques lignes suffisent : votre cabinet, vos domaines d&apos;intervention, ce que vous attendez du site. Le devis est gratuit et sans engagement.
              </p>

              <EtEnsuite className="lx-devis__suite-bloc--aside" />
            </div>
          </aside>

          <section className="lx-devis__corps" aria-labelledby="devis-formulaire">
            <div className="lx-devis__corps-inner">
              <h2 id="devis-formulaire" className="lx-devis__h2">Votre demande de devis</h2>
              <p className="lx-devis__chapo">Les champs marqués « facultatif » peuvent rester vides.</p>
              <ContactForm forfaitInitial={forfaitInitial} forfaits={FORFAITS.map(({ id, nom }) => ({ id, nom }))} />
              {/* Sur mobile, les étapes passent sous le formulaire pour qu'il reste accessible tout de suite. */}
              <EtEnsuite className="lx-devis__suite-bloc--bas" />
            </div>
          </section>
        </div>
      </main>

      <LandingFooter />
    </>
  )
}

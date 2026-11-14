import Link from 'next/link'
import './landing.css'
import { EMAIL_CONTACT } from '@/lib/offre'
import { URL_VEILLE } from './veille-encart'

export function LandingFooter() {
  return (
    <footer className="lx-pied">
      <div className="lx-wrap">
        <div className="lx-pied__haut">
          <div>
            <p className="lx-pied__logo">Lexavo<span>.</span></p>
            <p style={{ maxWidth: '22rem', margin: 0 }}>
              Création de sites internet pour avocats et cabinets d&apos;avocats.
            </p>
          </div>
          <div>
            <h3>Le studio</h3>
            <ul>
              <li><Link href="/#realisations" className="lx-lien">Réalisations</Link></li>
              <li><Link href="/#forfaits" className="lx-lien">Forfaits</Link></li>
              <li><Link href="/contact" className="lx-lien">Demander un devis</Link></li>
              <li><a href={URL_VEILLE} className="lx-lien">La veille juridique</a></li>
            </ul>
          </div>
          <div>
            <h3>Informations</h3>
            <ul>
              <li><a href={`mailto:${EMAIL_CONTACT}`} className="lx-lien">{EMAIL_CONTACT}</a></li>
              <li><Link href="/mentions-legales" className="lx-lien">Mentions légales</Link></li>
              <li><Link href="/cgv" className="lx-lien">Conditions générales de vente</Link></li>
              <li><Link href="/politique-confidentialite" className="lx-lien">Confidentialité</Link></li>
            </ul>
          </div>
        </div>
        <p className="lx-pied__bas">© Lexavo. Photographies : Unsplash.</p>
      </div>
    </footer>
  )
}

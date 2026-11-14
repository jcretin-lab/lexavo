import Link from 'next/link'
import './landing.css'

// `solide` : fond bleu dès le départ (pages sans grande photo en tête).
// Sur la landing, la barre est transparente au-dessus du hero puis devient opaque au défilement.
export function LandingNav({ solide = false }: { solide?: boolean }) {
  return (
    <nav className={`lx-nav${solide ? ' lx-nav--solide' : ''}`} aria-label="Navigation principale">
      <div className="lx-wrap lx-nav__inner">
        <Link href="/" className="lx-nav__logo">
          Lexavo<span>.</span>
        </Link>

        <div className="lx-nav__liens">
          <Link href="/#realisations" className="lx-lien">Réalisations</Link>
          <Link href="/#methode" className="lx-lien">Méthode</Link>
          <Link href="/#forfaits" className="lx-lien">Forfaits</Link>
          <Link href="/#questions" className="lx-lien">Questions</Link>
        </div>

        <Link href="/contact" className="lx-btn lx-btn--laiton">
          Demander un devis
        </Link>
      </div>
    </nav>
  )
}

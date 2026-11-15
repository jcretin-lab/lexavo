// Encart de la page d'accueil : vidéos corporate et photos professionnelles, en partenariat avec BipBip Productions.
// Même présentation que l'encart Veille (classes lx-veille), placé juste au-dessus.

import Link from 'next/link'

export function PartenaireEncart() {
  return (
    <section id="photo-video" aria-labelledby="partenaire-titre" className="lx-veille lx-partenaire">
      <div className="lx-wrap lx-veille__inner">
        <div>
          <h2 id="partenaire-titre">Des vidéos et des photos à l&apos;image de votre cabinet.</h2>
          <p>
            Grâce à notre partenariat avec BipBip Productions, nous réalisons aussi vos vidéos corporate et vos photos professionnelles :
            portraits, équipe, locaux du cabinet.
          </p>
        </div>
        <Link href="/contact" className="lx-btn lx-btn--ligne">
          Nous en parler
        </Link>
      </div>
    </section>
  )
}

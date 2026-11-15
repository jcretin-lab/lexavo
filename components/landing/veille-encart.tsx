// Encart de la page d'accueil qui renvoie vers la newsletter « Veille Lexavo » (site veille.lexavo.fr).

export const URL_VEILLE = 'https://veille.lexavo.fr/'

export function VeilleEncart() {
  return (
    <section id="veille" aria-labelledby="veille-titre" className="lx-veille">
      <div className="lx-wrap lx-veille__inner">
        <div>
          <h2 id="veille-titre">Recevez aussi notre veille juridique, gratuitement.</h2>
          <p>
            Tous les quinze jours, les arrêts récents de la Cour de cassation selon votre domaine : un court résumé, l&apos;extrait officiel et le
            lien vers la décision.
          </p>
        </div>
        <a href={URL_VEILLE} rel="noopener" className="lx-btn lx-btn--ligne">
          Découvrir la veille
        </a>
      </div>
    </section>
  )
}

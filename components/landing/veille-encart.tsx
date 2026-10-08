// Encart de la page d'accueil qui renvoie vers la newsletter « Veille Lexavo » (site veille.lexavo.fr).
// Même palette et mêmes polices que le reste de la page d'accueil.

const ED = {
  ink: '#0F0E0C',
  navy: '#0F2247',
  paper: '#F3EFE5',
  mid: '#6E6860',
  rule: '#D0CBC0',
  gold: '#B8872A',
}

export const URL_VEILLE = 'https://veille.lexavo.fr'

export function VeilleEncart() {
  return (
    <section id="veille" aria-labelledby="veille-titre" style={{ background: ED.paper, padding: '2.5rem 1.5rem' }}>
      <div className="max-w-4xl mx-auto">
        <div
          className="flex flex-col md:flex-row md:items-center gap-6"
          style={{
            background: 'var(--white, #ffffff)',
            border: `1px solid ${ED.rule}`,
            borderLeft: `4px solid ${ED.gold}`,
            borderRadius: '0.75rem',
            padding: '1.75rem 2rem',
            boxShadow: '0 16px 40px -26px rgba(15,34,71,0.22)',
          }}
        >
          <div className="flex-1">
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: ED.gold }}>
              NOUVEAU · TEST GRATUIT
            </span>
            <h2
              id="veille-titre"
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontStyle: 'italic',
                fontSize: 'clamp(1.5rem, 2.6vw, 2.125rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: ED.navy,
                margin: '0.5rem 0 0.625rem',
              }}
            >
              Veille juridique : baux d&apos;habitation et copropriété.
            </h2>
            <p style={{ fontSize: '0.9375rem', color: ED.mid, lineHeight: 1.6, maxWidth: '40rem', margin: 0 }}>
              Chaque semaine, les modifications des textes, l&apos;ancienne et la nouvelle version côte à côte, et les arrêts récents qui les
              citent, avec l&apos;extrait officiel et le lien vers la décision.
            </p>
          </div>
          <div className="flex-shrink-0">
            <a
              href={URL_VEILLE}
              rel="noopener"
              style={{
                display: 'inline-block',
                background: ED.navy,
                color: '#ffffff',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.9375rem',
                padding: '0.875rem 1.5rem',
                borderRadius: '0.5rem',
                whiteSpace: 'nowrap',
              }}
            >
              Découvrir la veille →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

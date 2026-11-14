// Sceau rond apposé au bas de la « feuille d'acte » du hero :
// un mot clé au centre, une phrase qui court en cercle, double filet et perles sur le pourtour.
type Props = {
  id: string          // identifiant unique (chemin du texte circulaire)
  centre: string      // ex. « 48 h »
  sousCentre?: string // petite ligne sous le centre
  anneau: string      // texte qui court en cercle
  texteAccessible: string
  variante?: 'robe' | 'laiton'
}

export function Sceau({ id, centre, sousCentre, anneau, texteAccessible, variante = 'robe' }: Props) {
  return (
    <div className={`lx-sceau lx-sceau--${variante}`}>
      <span className="sr-only">{texteAccessible}</span>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <defs>
          <path id={id} d="M 100,100 m -72,0 a 72,72 0 1,1 144,0 a 72,72 0 1,1 -144,0" />
        </defs>
        <circle cx="100" cy="100" r="98" className="lx-sceau__fond" />
        <circle cx="100" cy="100" r="92" className="lx-sceau__perles" />
        <circle cx="100" cy="100" r="86" className="lx-sceau__filet" />
        <circle cx="100" cy="100" r="58" className="lx-sceau__filet" />
        <text className="lx-sceau__anneau">
          <textPath href={`#${id}`} startOffset="0" textLength="446" lengthAdjust="spacing">
            {anneau}
          </textPath>
        </text>
        <text x="100" y={sousCentre ? 104 : 112} textAnchor="middle" className={`lx-sceau__centre${centre.length > 4 ? ' lx-sceau__centre--long' : ''}`}>{centre}</text>
        {sousCentre && <text x="100" y="128" textAnchor="middle" className="lx-sceau__souscentre">{sousCentre}</text>}
      </svg>
    </div>
  )
}

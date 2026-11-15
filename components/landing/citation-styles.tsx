'use client'

import Image, { type StaticImageData } from 'next/image'
import { useEffect, useRef, useState } from 'react'

// « Une même phrase, quatre façons de la dire » : la citation est rendue dans quatre designs.
// Rotation automatique toutes les 5 s, arrêtée dès que le visiteur choisit un style, survole
// ou met le focus dans la section, et jamais lancée en mouvement réduit (règle « auto-rotating content »).
const STYLES = [
  { id: 'classique', nom: 'Classique' },
  { id: 'suisse', nom: 'Suisse' },
  { id: 'editorial', nom: 'Éditorial' },
  { id: 'contemporain', nom: 'Contemporain' },
] as const

const DUREE = 5000

export function CitationStyles({ photo }: { photo: StaticImageData }) {
  const [actif, setActif] = useState(0)
  const [lecture, setLecture] = useState(true)
  const [survol, setSurvol] = useState(false)
  const reduit = useRef(false)

  useEffect(() => {
    reduit.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduit.current) {
      const t = window.setTimeout(() => setLecture(false), 0)
      return () => window.clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (!lecture || survol) return
    const t = window.setTimeout(() => setActif((i) => (i + 1) % STYLES.length), DUREE)
    return () => window.clearTimeout(t)
  }, [actif, lecture, survol])

  const choisir = (i: number) => { setActif(i); setLecture(false) }
  const enCours = lecture && !survol

  return (
    <section
      className="lx-styles"
      aria-label="Une même phrase, quatre styles"
      onMouseEnter={() => setSurvol(true)}
      onMouseLeave={() => setSurvol(false)}
      onFocus={() => setSurvol(true)}
      onBlur={() => setSurvol(false)}
    >
      <div className="lx-wrap lx-styles__entete">
        <div>
          <h2 className="lx-styles__titre">Une même phrase. Quatre façons de la dire.</h2>
          <p className="lx-styles__chapo">Chaque cabinet a son caractère. Nous concevons un design qui ressemble au vôtre, pas un modèle.</p>
        </div>
        <div className="lx-styles__commandes">
          <div className="lx-styles__choix" role="group" aria-label="Choisir un style">
            {STYLES.map((s, i) => (
              <button key={s.id} type="button" aria-pressed={actif === i} onClick={() => choisir(i)} className={actif === i ? 'is-actif' : ''}>
                {s.nom}
                {actif === i && enCours && <span className="lx-styles__minuteur" style={{ animationDuration: `${DUREE}ms` }} key={actif} />}
              </button>
            ))}
          </div>
          <button type="button" className="lx-styles__lecture" onClick={() => setLecture((l) => !l)} aria-label={lecture ? 'Mettre en pause la rotation des styles' : 'Relancer la rotation des styles'}>
            {lecture ? <svg viewBox="0 0 16 16" aria-hidden><rect x="4" y="3" width="3" height="10" /><rect x="9" y="3" width="3" height="10" /></svg>
              : <svg viewBox="0 0 16 16" aria-hidden><path d="M5 3l8 5-8 5z" /></svg>}
          </button>
        </div>
      </div>

      <div className="lx-styles__scene">
        {/* Classique : photo, voile bleu nuit, Bodoni */}
        <div className={`lx-style lx-style--classique${actif === 0 ? ' is-actif' : ''}`} aria-hidden={actif !== 0}>
          <Image src={photo} alt="" fill sizes="100vw" placeholder="blur" />
          <blockquote>
            <p>La compétence se prouve au cabinet. La confiance commence en ligne.</p>
            <span className="lx-style__filet" />
          </blockquote>
        </div>

        {/* Suisse : grille, sans empattement, un seul accent */}
        <div className={`lx-style lx-style--suisse${actif === 1 ? ' is-actif' : ''}`} aria-hidden={actif !== 1}>
          <div className="lx-style__grille" />
          <span className="lx-style__carre" />
          <blockquote>
            <p><span>La compétence se prouve au cabinet.</span> <span>La confiance commence en ligne.</span></p>
          </blockquote>
        </div>

        {/* Éditorial : guillemet géant, italique, signature */}
        <div className={`lx-style lx-style--editorial${actif === 2 ? ' is-actif' : ''}`} aria-hidden={actif !== 2}>
          <blockquote>
            <span className="lx-style__guillemet" aria-hidden>«</span>
            <p>La compétence se prouve au cabinet. La confiance commence en ligne.</p>
            <footer>Lexavo, création de sites pour avocats</footer>
          </blockquote>
        </div>

        {/* Contemporain : noir, typographie géante */}
        <div className={`lx-style lx-style--contemporain${actif === 3 ? ' is-actif' : ''}`} aria-hidden={actif !== 3}>
          <blockquote>
            <p className="lx-style__petit">La compétence se prouve au cabinet.</p>
            <p className="lx-style__geant">La confiance commence <em>en ligne.</em></p>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

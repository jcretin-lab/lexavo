'use client'

// Sous les tarifs : deux compléments côte à côte.
// À gauche, vidéos et photos (partenariat BipBip Productions) : l'image vue dans un viseur de caméra (mise au point, REC, timecode).
// À droite, la veille juridique : les fiches de chaque domaine défilent une à une.
// Les animations ne tournent que lorsque la section est à l'écran, et sont coupées en mouvement réduit.

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LISTES } from '@/lib/veille/listes'
import { URL_VEILLE } from '@/lib/offre'

const IMAGES_PAR_SECONDE = 25
const DUREE_FICHE = 2600 // ms entre deux fiches

function deuxChiffres(n: number) {
  return String(n).padStart(2, '0')
}

export function Complements() {
  const section = useRef<HTMLElement>(null)
  const timecode = useRef<HTMLSpanElement>(null)
  const [actif, setActif] = useState(false)
  const [reduit, setReduit] = useState(false)
  const [survol, setSurvol] = useState(false)
  const [index, setIndex] = useState(0)

  // Section à l'écran ?
  useEffect(() => {
    const s = section.current
    if (!s) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const t = window.setTimeout(() => setReduit(mq.matches), 0)
    const obs = new IntersectionObserver(([e]) => setActif(e.isIntersecting), { threshold: 0.35 })
    obs.observe(s)
    return () => { window.clearTimeout(t); obs.disconnect() }
  }, [])

  // Timecode de la caméra (HH:MM:SS:images), écrit directement dans le DOM pour éviter un rendu React à chaque image.
  useEffect(() => {
    if (!actif || reduit) return
    const debut = performance.now()
    const id = window.setInterval(() => {
      const el = timecode.current
      if (!el) return
      const images = Math.floor(((performance.now() - debut) / 1000) * IMAGES_PAR_SECONDE)
      const s = Math.floor(images / IMAGES_PAR_SECONDE)
      el.textContent = `00:${deuxChiffres(Math.floor(s / 60) % 60)}:${deuxChiffres(s % 60)}:${deuxChiffres(images % IMAGES_PAR_SECONDE)}`
    }, 1000 / IMAGES_PAR_SECONDE)
    return () => window.clearInterval(id)
  }, [actif, reduit])

  // Fiches de veille : une nouvelle toutes les DUREE_FICHE ms.
  useEffect(() => {
    if (!actif || reduit || survol) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % LISTES.length), DUREE_FICHE)
    return () => window.clearInterval(id)
  }, [actif, reduit, survol])

  const n = LISTES.length

  return (
    <section ref={section} id="complements" aria-labelledby="complements-titre" className={`lx-complements${actif && !reduit ? ' is-actif' : ''}`}>
      <div className="lx-wrap">
        <h2 id="complements-titre" className="lx-complements__titre">En complément de votre site.</h2>

        <div className="lx-complements__grille">
          {/* ── Vidéos et photos ── */}
          <article id="photo-video" className="lx-compl lx-compl--video" aria-labelledby="partenaire-titre">
            <div className="lx-compl__visuel lx-viseur" aria-hidden="true">
              <Image src="/videos/rendez-vous.jpg" alt="" fill sizes="(min-width: 900px) 45vw, 100vw" />
              <span className="lx-viseur__tiers" />
              <span className="lx-viseur__coin lx-viseur__coin--hg" />
              <span className="lx-viseur__coin lx-viseur__coin--hd" />
              <span className="lx-viseur__coin lx-viseur__coin--bg" />
              <span className="lx-viseur__coin lx-viseur__coin--bd" />
              <span className="lx-viseur__rec"><i />REC</span>
              <span ref={timecode} className="lx-viseur__tc">00:00:00:00</span>
            </div>
            <div className="lx-compl__corps">
              <h3 id="partenaire-titre">Des vidéos et des photos à l&apos;image de votre cabinet.</h3>
              <p>
                Grâce à notre partenariat avec BipBip Productions, nous réalisons aussi vos vidéos corporate et vos photos professionnelles :
                portraits, équipe, locaux du cabinet.
              </p>
              <Link href="/contact" className="lx-btn lx-btn--clair">Nous en parler</Link>
            </div>
          </article>

          {/* ── Veille juridique ── */}
          <article id="veille" className="lx-compl lx-compl--veille" aria-labelledby="veille-titre">
            <div
              className="lx-compl__visuel lx-fiches"
              aria-hidden="true"
              onMouseEnter={() => setSurvol(true)}
              onMouseLeave={() => setSurvol(false)}
            >
              {LISTES.map((l, i) => {
                let pos = (i - index + n) % n
                if (pos > n / 2) pos -= n
                return (
                  <div key={l.slug} className={`lx-fiche${pos === 0 ? ' is-courante' : ''}`} style={{ '--pos': pos } as React.CSSProperties}>
                    <span className="lx-fiche__nom">{l.nom}</span>
                    <span className="lx-fiche__detail">Arrêts récents de la Cour de cassation</span>
                  </div>
                )
              })}
            </div>
            <div className="lx-compl__corps">
              <h3 id="veille-titre">Recevez aussi notre veille juridique, gratuitement.</h3>
              <p>
                Tous les quinze jours, les arrêts récents de la Cour de cassation selon votre domaine : un court résumé, l&apos;extrait officiel et le
                lien vers la décision.
              </p>
              <a href={URL_VEILLE} rel="noopener" className="lx-btn lx-btn--ligne">Découvrir la veille</a>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}

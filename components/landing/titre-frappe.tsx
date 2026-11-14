'use client'

import { useEffect, useState } from 'react'

// Titre « tapé » avec un curseur de traitement de texte.
// La première ligne s'écrit une fois. La seconde corrige, comme dans un acte :
// la mauvaise mention (« avec abonnement ») s'écrit, est rayée d'un trait doré et s'efface,
// puis la bonne (« sans abonnement ») s'écrit à sa place. Puis la paire suivante.
// Le texte complet (les bonnes mentions) est dans un span masqué visuellement, pour les lecteurs d'écran et les moteurs.
export type Correction = { faux: string; vrai: string }
type Phase = 'frappe' | 'pause' | 'rature' | 'sortie'
type Etat = { f: number; r: number; vrai: boolean; c: number; phase: Phase }

export function TitreFrappe({ fixe, corrections, className }: { fixe: string; corrections: Correction[]; className?: string }) {
  const [etat, setEtat] = useState<Etat>({ f: 0, r: 0, vrai: false, c: 0, phase: 'frappe' })

  useEffect(() => {
    let minuteur = 0
    const planifier = (fn: () => void, ms: number) => { minuteur = window.setTimeout(fn, ms) }
    const frappe = () => 55 + Math.random() * 45
    const texte = (r: number, vrai: boolean) => `${vrai ? corrections[r].vrai : corrections[r].faux}.`

    // Mouvement réduit : seules les bonnes mentions, qui changent sans animation
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let r = 0
      const suivant = () => {
        setEtat({ f: fixe.length, r, vrai: true, c: texte(r, true).length, phase: 'pause' })
        r = (r + 1) % corrections.length
        planifier(suivant, 3500)
      }
      planifier(suivant, 0)
      return () => window.clearTimeout(minuteur)
    }

    let f = 0, r = 0, c = 0, vrai = false
    const maj = (phase: Phase) => setEtat({ f, r, vrai, c, phase })
    const taperFixe = () => {
      f += 1
      maj('frappe')
      if (f < fixe.length) planifier(taperFixe, frappe() + (fixe[f - 1] === ' ' ? 90 : 0))
      else planifier(taper, 420)
    }
    const taper = () => {
      c += 1
      maj('frappe')
      if (c < texte(r, vrai).length) planifier(taper, frappe())
      else {
        maj('pause')
        planifier(vrai ? sortir : rayer, vrai ? 2600 : 800)
      }
    }
    const rayer = () => {
      maj('rature')
      planifier(sortir, 1000)
    }
    const sortir = () => {
      maj('sortie')
      planifier(() => {
        if (vrai) r = (r + 1) % corrections.length
        vrai = !vrai
        c = 0
        maj('frappe')
        planifier(taper, 240)
      }, 480)
    }
    planifier(taperFixe, 650)
    return () => window.clearTimeout(minuteur)
  }, [fixe, corrections])

  const { f, r, vrai, c, phase } = etat
  const fixeFini = f >= fixe.length
  const mention = `${vrai ? corrections[r].vrai : corrections[r].faux}.`
  const curseur = <span className={`lx-frappe__curseur${phase === 'pause' ? ' is-fini' : ''}`} />
  const classes = [
    'lx-rature',
    vrai ? 'is-vrai' : 'is-faux',
    phase === 'rature' || (phase === 'sortie' && !vrai) ? 'is-rayee' : '',
    phase === 'sortie' ? 'is-sortie' : '',
  ].filter(Boolean).join(' ')

  return (
    <h1 className={className}>
      <span className="sr-only">{fixe} {corrections.map((x) => x.vrai).join(', ')}.</span>
      <span className="lx-frappe__ligne" aria-hidden="true">
        {fixe.slice(0, f)}
        {!fixeFini && curseur}
        <span className="lx-frappe__reste">{fixe.slice(f)}</span>
      </span>
      <span className="lx-frappe__ligne lx-frappe__ligne--rotation" aria-hidden="true">
        {fixeFini && (
          <>
            <span className={classes}>{mention.slice(0, c)}</span>
            {(phase === 'frappe' || phase === 'pause') && curseur}
            {/* la partie pas encore tapée reste en place (invisible) : le texte centré ne tremble pas */}
            <span className="lx-frappe__reste">{mention.slice(c)}</span>
          </>
        )}
      </span>
    </h1>
  )
}

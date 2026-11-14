'use client'

import { useEffect, useState } from 'react'

// Titre « tapé » avec un curseur de traitement de texte :
// la première ligne s'écrit une fois, puis la seconde fait défiler les avantages
// (écrit, pause, efface, suivant…).
// Le texte complet est dans un span masqué visuellement, pour les lecteurs d'écran et les moteurs.
type Etat = { f: number; r: number; c: number; pause: boolean }

export function TitreFrappe({ fixe, rotation, className }: { fixe: string; rotation: string[]; className?: string }) {
  const [etat, setEtat] = useState<Etat>({ f: 0, r: 0, c: 0, pause: false })

  useEffect(() => {
    let minuteur = 0
    const planifier = (fn: () => void, ms: number) => { minuteur = window.setTimeout(fn, ms) }
    const frappe = () => 55 + Math.random() * 45

    // Mouvement réduit : tout est affiché, les avantages changent sans animation de frappe
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      let r = 0
      const suivant = () => {
        setEtat({ f: fixe.length, r, c: rotation[r].length + 1, pause: true })
        r = (r + 1) % rotation.length
        planifier(suivant, 3500)
      }
      planifier(suivant, 0)
      return () => window.clearTimeout(minuteur)
    }

    let f = 0, r = 0, c = 0
    const taperFixe = () => {
      f += 1
      setEtat({ f, r, c, pause: false })
      if (f < fixe.length) planifier(taperFixe, frappe() + (fixe[f - 1] === ' ' ? 90 : 0))
      else planifier(taperAvantage, 420)
    }
    const taperAvantage = () => {
      c += 1
      setEtat({ f, r, c, pause: false })
      if (c < rotation[r].length + 1) planifier(taperAvantage, frappe())
      else {
        setEtat({ f, r, c, pause: true })
        planifier(effacer, 2400)
      }
    }
    const effacer = () => {
      c -= 1
      setEtat({ f, r, c, pause: false })
      if (c > 0) planifier(effacer, 28)
      else {
        r = (r + 1) % rotation.length
        setEtat({ f, r, c, pause: true })
        planifier(taperAvantage, 380)
      }
    }
    planifier(taperFixe, 650)
    return () => window.clearTimeout(minuteur)
  }, [fixe, rotation])

  const { f, r, c, pause } = etat
  const fixeFini = f >= fixe.length
  const curseur = <span className={`lx-frappe__curseur${pause ? ' is-fini' : ''}`} />

  return (
    <h1 className={className}>
      <span className="sr-only">{fixe} {rotation.join(', ')}.</span>
      <span className="lx-frappe__ligne" aria-hidden="true">
        {fixe.slice(0, f)}
        {!fixeFini && curseur}
        <span className="lx-frappe__reste">{fixe.slice(f)}</span>
      </span>
      <span className="lx-frappe__ligne lx-frappe__ligne--rotation" aria-hidden="true">
        {fixeFini && `${rotation[r]}.`.slice(0, c)}
        {fixeFini && curseur}
      </span>
    </h1>
  )
}

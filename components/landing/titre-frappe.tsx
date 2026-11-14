'use client'

import { useEffect, useState } from 'react'

// Titre « tapé » lettre à lettre, avec un curseur de traitement de texte.
// Le texte complet est toujours présent pour les lecteurs d'écran et les moteurs ;
// la partie pas encore tapée est seulement masquée (visibility), donc la mise en page ne bouge pas.
export function TitreFrappe({ lignes, className }: { lignes: string[]; className?: string }) {
  const total = lignes.reduce((n, l) => n + l.length, 0)
  const [tape, setTape] = useState(0)

  useEffect(() => {
    let minuteur: number
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      minuteur = window.setTimeout(() => setTape(total), 0)
      return () => window.clearTimeout(minuteur)
    }
    let n = 0
    const finsDeLigne = new Set(lignes.slice(0, -1).map((_, i) => lignes.slice(0, i + 1).join('').length))
    const suivant = () => {
      n += 1
      setTape(n)
      if (n >= total) return
      // rythme humain : léger aléa, pause après une ligne ou une espace
      const pause = finsDeLigne.has(n) ? 380 : lignes.join('')[n - 1] === ' ' ? 120 : 0
      minuteur = window.setTimeout(suivant, 58 + Math.random() * 46 + pause)
    }
    minuteur = window.setTimeout(suivant, 650)
    return () => window.clearTimeout(minuteur)
  }, [lignes, total])

  // position de départ de chaque ligne dans le texte complet
  const departs = lignes.map((_, i) => lignes.slice(0, i).join('').length)
  return (
    <h1 className={className} aria-label={lignes.join(' ')}>
      {lignes.map((ligne, i) => {
        const avant = departs[i]
        const debut = avant + ligne.length
        const visibles = Math.max(0, Math.min(ligne.length, tape - avant))
        const curseurIci = tape < total ? tape >= avant && tape <= debut && (tape < debut || i === lignes.length - 1) : i === lignes.length - 1
        return (
          <span key={ligne} className="lx-frappe__ligne" aria-hidden="true">
            {ligne.slice(0, visibles)}
            {curseurIci && <span className={`lx-frappe__curseur${tape >= total ? ' is-fini' : ''}`} />}
            <span className="lx-frappe__reste">{ligne.slice(visibles)}</span>
          </span>
        )
      })}
    </h1>
  )
}

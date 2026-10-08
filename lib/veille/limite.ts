// Limitation du nombre de demandes par adresse IP, en mémoire (même principe que la route /api/contact).
// Chaque instance du serveur a sa propre mémoire : c'est un frein contre l'abus, pas une garantie absolue.
// La vraie protection contre les envois en rafale à une même adresse est le délai de 10 minutes entre deux e-mails (service.ts).

export function creerLimiteur(max: number, fenetreMs: number, maintenant: () => number = Date.now) {
  const compteurs = new Map<string, { n: number; finFenetre: number }>()
  return function autoriser(cle: string): boolean {
    const t = maintenant()
    if (compteurs.size > 5000) {
      for (const [k, v] of compteurs) if (t > v.finFenetre) compteurs.delete(k)    // ménage : la mémoire ne grossit pas indéfiniment
    }
    const entree = compteurs.get(cle)
    if (!entree || t > entree.finFenetre) {
      compteurs.set(cle, { n: 1, finFenetre: t + fenetreMs })
      return true
    }
    if (entree.n >= max) return false
    entree.n++
    return true
  }
}

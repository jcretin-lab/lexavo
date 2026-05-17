export function ConfidentialiteBandeau() {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
      <p className="font-semibold mb-1">Secret professionnel</p>
      <p className="leading-relaxed text-blue-900/90">
        Ne saisissez aucune information client identifiable (nom, adresse,
        e-mail, n° de dossier, SIREN, RIB…). Lexavo est conçu pour produire du
        contenu pédagogique générique. Vous restez le seul gardien du secret
        professionnel (art. 4 RIN).
      </p>
    </div>
  )
}

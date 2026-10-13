// Alerte envoyée à l'éditeur chaque fois qu'une personne confirme son inscription à une ou plusieurs veilles.
// Aucun import : module pur, testé par `npm test` (voir alerte.test.ts). L'envoi lui-même est dans courriel.ts.

export type AlerteAbonne = {
  email: string
  nom: string | null
  profil: string
  /** Les veilles confirmées par ce clic, avec le nombre d'abonnés confirmés de chacune (celui-ci compris). */
  veilles: { nom: string; effectif: number }[]
  /** Instant de la confirmation (ISO 8601). */
  confirmeLe: string
  /** Jour d'envoi du premier numéro de cet abonné, en toutes lettres (voir calendrier.ts). */
  premierNumero: string
}

/** Les champs saisis par une personne (nom, adresse…) arrivent dans l'e-mail de l'éditeur : rien n'y est interprété comme du HTML. */
export function echapper(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

/** « mardi 13 octobre 2026 à 21:05 », à l'heure de Paris. */
export function quandEnClair(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { timeZone: 'Europe/Paris', dateStyle: 'full', timeStyle: 'short' }).format(new Date(iso))
}

/** Pas d'adresse dans l'objet : il apparaît dans les aperçus de notification et les écrans verrouillés. */
export function sujetAlerte(veilles: { nom: string }[]): string {
  return veilles.length === 1 ? `Nouvel abonné · ${veilles[0].nom}` : `Nouvel abonné · ${veilles.length} veilles`
}

export function htmlAlerte(a: AlerteAbonne): string {
  const ligne = (etiquette: string, valeur: string) =>
    `<tr><td style="padding: 4px 16px 4px 0; color: #52606d; vertical-align: top; white-space: nowrap;">${etiquette}</td><td style="padding: 4px 0;">${valeur}</td></tr>`
  const veilles = a.veilles
    .map((v) => `${echapper(v.nom)} <span style="color: #52606d;">(${v.effectif === 1 ? 'premier abonné confirmé' : `${v.effectif} abonnés confirmés`})</span>`)
    .join('<br>')
  return `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; color: #0E1320; font-size: 15px; line-height: 1.5;">
      <p style="font-size: 18px; font-weight: bold; color: #1A3F7C; margin: 0 0 16px;">Nouvel abonné à la veille Lexavo</p>
      <table style="border-collapse: collapse; margin: 0 0 16px;">
        ${ligne('Adresse', echapper(a.email))}
        ${ligne('Nom', a.nom ? echapper(a.nom) : '—')}
        ${ligne('Profil', echapper(a.profil))}
        ${ligne(a.veilles.length === 1 ? 'Veille' : 'Veilles', veilles)}
        ${ligne('Confirmé le', echapper(quandEnClair(a.confirmeLe)) + ' (heure de Paris)')}
        ${ligne('Premier numéro', echapper(a.premierNumero))}
      </table>
      <p style="font-size: 13px; color: #52606d; margin: 0;">Message automatique du site Lexavo, envoyé à chaque confirmation d'inscription. Les abonnés confirmés sont lus par le projet de veille au moment de la préparation de chaque numéro.</p>
    </div>
  `
}

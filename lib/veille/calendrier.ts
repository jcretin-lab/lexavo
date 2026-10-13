// Calendrier des numéros de la veille : un numéro tous les quinze jours, préparé le dimanche à 20 h (heure de Paris), envoyé le lundi matin.
// Aucun import : module pur, testé par `npm test` (voir calendrier.test.ts).
//
// Ces dates doivent rester celles de la tâche planifiée du projet de veille (scripts/phase3/planifier.ps1 -Debut 2026-11-01 : passage le dimanche
// 1er novembre 2026 à 20 h puis toutes les deux semaines ; envoi programmé le lundi à 8 h 30, voir notes/phase6-envoi.md § 22). Si ce rythme change
// là-bas, il faut changer ici PREMIER_PASSAGE et PERIODE_JOURS, sinon l'e-mail de confirmation annonce une mauvaise date.
// Un abonné est dans le numéro d'un passage s'il a confirmé son adresse avant ce passage ; sinon il reçoit le suivant.

/** Premier passage : dimanche 1er novembre 2026, 20 h. Le 19 octobre 2026, un numéro d'essai est envoyé à l'éditeur seulement : il n'est pas annoncé. */
const PREMIER_PASSAGE = { annee: 2026, mois: 11, jour: 1, heure: 20 }
const PERIODE_JOURS = 14
const JOUR_MS = 24 * 3600 * 1000

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/**
 * « Heure murale » : l'heure affichée à Paris à cet instant, lue comme si elle était en UTC. Le passage a lieu à 20 h à l'heure locale de l'ordinateur,
 * été comme hiver : on compte donc les quinze jours sur ces heures-là, sans se soucier du changement d'heure.
 */
function heureMuraleDeParis(instant: Date): number {
  const parties = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Paris', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
  }).formatToParts(instant)
  const valeur = (type: string) => Number(parties.find((p) => p.type === type)?.value)
  return Date.UTC(valeur('year'), valeur('month') - 1, valeur('day'), valeur('hour'), valeur('minute'))
}

const REFERENCE = Date.UTC(PREMIER_PASSAGE.annee, PREMIER_PASSAGE.mois - 1, PREMIER_PASSAGE.jour, PREMIER_PASSAGE.heure, 0)

/** Un jour du calendrier, en toutes lettres : « lundi 2 novembre 2026 » (« 1er » pour le premier du mois ; l'année est facultative). */
function enToutesLettres(heureMurale: number, avecAnnee = true): string {
  const d = new Date(heureMurale)
  const jour = d.getUTCDate()
  return `${JOURS[d.getUTCDay()]} ${jour === 1 ? '1er' : jour} ${MOIS[d.getUTCMonth()]}${avecAnnee ? ` ${d.getUTCFullYear()}` : ''}`
}

export type ProchainNumero = {
  /** Dernier jour pour confirmer et figurer dans ce numéro : le dimanche du passage (jusqu'à 20 h), sans l'année. */
  limite: string
  /** Jour d'envoi de ce numéro : le lundi suivant. */
  envoi: string
  /** Jour d'envoi du numéro d'après : quinze jours plus tard. */
  suivant: string
}

/** Prochain numéro à partir de `maintenant` : celui du premier passage à venir (le 1er novembre 2026 au plus tôt). */
export function prochainNumero(maintenant: Date): ProchainNumero {
  const murale = heureMuraleDeParis(maintenant)
  const passage = murale <= REFERENCE ? REFERENCE : REFERENCE + Math.ceil((murale - REFERENCE) / (PERIODE_JOURS * JOUR_MS)) * PERIODE_JOURS * JOUR_MS
  return {
    limite: enToutesLettres(passage, false),
    envoi: enToutesLettres(passage + JOUR_MS),
    suivant: enToutesLettres(passage + JOUR_MS + PERIODE_JOURS * JOUR_MS),
  }
}

/** La phrase de l'e-mail de confirmation (texte brut, sans balise). */
export function phraseProchainNumero(maintenant: Date): string {
  const n = prochainNumero(maintenant)
  return `Votre premier numéro vous parviendra le ${n.envoi} au matin si vous confirmez avant le ${n.limite} à 20 h ; plus tard, ce sera le ${n.suivant}. `
    + 'Ensuite, vous en recevrez un tous les quinze jours.'
}

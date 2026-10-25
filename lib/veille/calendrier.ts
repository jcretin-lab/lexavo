// Calendrier des numéros de la veille : un numéro tous les quinze jours, préparé le dimanche (heure de Paris), envoyé le lundi matin.
// Aucun import : module pur, testé par `npm test` (voir calendrier.test.ts).
//
// Les abonnés ne connaissent que le JOUR où ils recevront leur numéro (le lundi), jamais le jour ni l'heure de la préparation : c'est un détail interne,
// qui peut changer sans que ce qu'on leur a dit devienne faux (décision du 25 octobre 2026). Le calcul reste pourtant fondé sur la préparation : une
// personne qui confirme après le début d'une préparation se voit annoncer le numéro suivant. C'est prudent : elle le reçoit parfois plus tôt que
// promis (l'envoi lit la liste des abonnés au moment où il est programmé), jamais plus tard.
//
// Ces constantes doivent rester celles de la tâche planifiée du projet de veille (scripts/phase3/planifier.ps1 -Debut 2026-11-01 -Heure 12:00 : passage
// le dimanche 1er novembre 2026 à 12 h puis toutes les deux semaines ; envoi programmé le lundi à 8 h 30, voir notes/phase6-envoi.md § 22 et § 24).
// Si ce rythme change là-bas, changer ici PREMIER_PASSAGE et PERIODE_JOURS (et dans site-veille/veille.js), sinon la date annoncée est fausse.

/** Premier passage : dimanche 1er novembre 2026, 12 h (avancé de 20 h à 12 h le 25 octobre 2026, pour relire les cinq numéros dans la journée). */
const PREMIER_PASSAGE = { annee: 2026, mois: 11, jour: 1, heure: 12 }
const PERIODE_JOURS = 14
const JOUR_MS = 24 * 3600 * 1000

const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

/**
 * « Heure murale » : l'heure affichée à Paris à cet instant, lue comme si elle était en UTC. Le passage a lieu à l'heure locale de l'ordinateur,
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

/** Un jour du calendrier, en toutes lettres : « lundi 2 novembre 2026 » (« 1er » pour le premier du mois). */
function enToutesLettres(heureMurale: number): string {
  const d = new Date(heureMurale)
  const jour = d.getUTCDate()
  return `${JOURS[d.getUTCDay()]} ${jour === 1 ? '1er' : jour} ${MOIS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export type ProchainNumero = {
  /** Jour où l'abonné reçoit son prochain numéro : le lundi qui suit le prochain passage. */
  envoi: string
}

/** Prochain numéro d'une personne qui confirme à l'instant `maintenant` : celui du premier passage à venir (le 1er novembre 2026 au plus tôt). */
export function prochainNumero(maintenant: Date): ProchainNumero {
  const murale = heureMuraleDeParis(maintenant)
  const passage = murale <= REFERENCE ? REFERENCE : REFERENCE + Math.ceil((murale - REFERENCE) / (PERIODE_JOURS * JOUR_MS)) * PERIODE_JOURS * JOUR_MS
  return { envoi: enToutesLettres(passage + JOUR_MS) }
}

/** La phrase de l'e-mail de confirmation (texte brut, sans balise) : le jour de réception, et rien sur la préparation. */
export function phraseProchainNumero(maintenant: Date): string {
  return `Votre premier numéro vous parviendra le ${prochainNumero(maintenant).envoi} au matin. Ensuite, vous en recevrez un tous les quinze jours.`
}

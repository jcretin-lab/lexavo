// Ce que la personne apprend du rythme des numéros, sans jour précis (décision du 3 novembre 2026) : « dans les quinze prochains jours » reste vrai quelle que
// soit la date de l'inscription (l'attente est de 14 jours au plus) et ne dépend plus du calendrier de préparation, qui a déjà changé trois fois.
// Aucun import : module pur, testé par `npm test` (voir rythme.test.ts). La page de confirmation du site de veille (site-veille/veille.js) reprend la première
// phrase à l'identique : scripts/phase7/verifier_listes.py contrôle la concordance.

export const PHRASE_PREMIER_NUMERO = 'Votre premier numéro vous parviendra dans les quinze prochains jours.'
export const PHRASE_RYTHME = 'Ensuite, vous en recevrez un tous les quinze jours.'

/** La phrase de l'e-mail de confirmation (texte brut, sans balise). */
export const PHRASE_CONFIRMATION = `${PHRASE_PREMIER_NUMERO} ${PHRASE_RYTHME}`

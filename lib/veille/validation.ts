// Newsletter « Veille Lexavo » — logique pure : validation, consentement, jetons, accès depuis un autre site (CORS).
// Ce module n'importe rien du projet : il est testé directement par `npm test` (voir validation.test.ts).
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

// Le consentement (version et texte EXACTS affichés sur le formulaire, enregistrés comme preuve) dépend de la liste : voir listes.ts, consentementPour.

export const PROFILS = ['avocat', 'syndic', 'gestionnaire', 'bailleur', 'notaire', 'autre'] as const
export type Profil = (typeof PROFILS)[number]

/** Sites autorisés à appeler ces routes depuis un navigateur. */
export const ORIGINES_AUTORISEES: readonly string[] = ['https://veille.lexavo.fr']

const LONGUEUR_MAX_EMAIL = 254
const LONGUEUR_MAX_NOM = 100
const CARACTERES_INTERDITS = /[\s@<>"'`,;:\\()[\]]/
const JETON = /^[a-f0-9]{48}$/

export function normaliserEmail(valeur: unknown): string | null {
  if (typeof valeur !== 'string') return null
  const email = valeur.trim().toLowerCase()
  if (email.length === 0 || email.length > LONGUEUR_MAX_EMAIL) return null
  const morceaux = email.split('@')
  if (morceaux.length !== 2) return null
  const [local, domaine] = morceaux
  if (local.length === 0 || local.length > 64 || CARACTERES_INTERDITS.test(local)) return null
  if (domaine.length < 4 || CARACTERES_INTERDITS.test(domaine)) return null
  if (!domaine.includes('.') || domaine.startsWith('.') || domaine.endsWith('.') || domaine.includes('..')) return null
  if (domaine.split('.').pop()!.length < 2) return null
  return email
}

function nettoyerNom(valeur: unknown): string | null {
  if (typeof valeur !== 'string') return null
  const nom = valeur.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim()
  return nom.length === 0 ? null : nom.slice(0, LONGUEUR_MAX_NOM)
}

/** `listes` : les veilles choisies (slugs, sans doublon), toutes ouvertes aux inscriptions. */
export type Inscription = { email: string; nom: string | null; profil: Profil; listes: string[] }

/** Nombre maximal de veilles dans une même demande (il n'y en a que cinq : tout ce qui dépasse est un abus). */
const NB_LISTES_MAX = 10

/** Champ caché du formulaire, invisible pour un humain : s'il est rempli, c'est un robot. */
export function estPiege(corps: unknown): boolean {
  if (typeof corps !== 'object' || corps === null) return false
  const piege = (corps as Record<string, unknown>).site_web
  return typeof piege === 'string' && piege.trim().length > 0
}

/**
 * `resoudreListe` : renvoie la liste demandée si elle existe et est ouverte aux inscriptions (voir listes.ts : listeOuverte), sinon null.
 * Le formulaire envoie `listes` (tableau de slugs, une ou plusieurs veilles). L'ancien formulaire envoyait `liste` (une seule, absente = veille d'origine) :
 * il reste accepté, pour les pages encore en cache.
 */
export function validerInscription(
  corps: unknown,
  resoudreListe: (valeur: unknown) => { slug: string } | null,
): { ok: true; valeur: Inscription } | { ok: false; erreur: string } {
  if (typeof corps !== 'object' || corps === null) return { ok: false, erreur: 'Requête invalide.' }
  const c = corps as Record<string, unknown>
  const email = normaliserEmail(c.email)
  if (!email) return { ok: false, erreur: "L'adresse e-mail n'est pas valide." }
  const profil = PROFILS.includes(c.profil as Profil) ? (c.profil as Profil) : 'autre'
  let demandees: unknown[]
  if (c.listes === undefined) demandees = [c.liste]
  else if (Array.isArray(c.listes) && c.listes.every((v) => typeof v === 'string' && v.length > 0)) demandees = c.listes
  else return { ok: false, erreur: "Cette veille n'est pas disponible." }
  if (demandees.length === 0) return { ok: false, erreur: 'Choisissez au moins une veille.' }
  if (demandees.length > NB_LISTES_MAX) return { ok: false, erreur: 'Requête invalide.' }
  const listes: string[] = []
  for (const valeur of demandees) {
    const liste = resoudreListe(valeur)
    if (!liste) return { ok: false, erreur: "Cette veille n'est pas disponible." }
    if (!listes.includes(liste.slug)) listes.push(liste.slug)
  }
  if (c.consentement !== true) return { ok: false, erreur: 'Le consentement est nécessaire pour recevoir la veille.' }
  return { ok: true, valeur: { email, nom: nettoyerNom(c.nom), profil, listes } }
}

export function nouveauJeton(): string {
  return randomBytes(24).toString('hex')
}

export function jetonValide(valeur: unknown): valeur is string {
  return typeof valeur === 'string' && JETON.test(valeur)
}

export function origineAutorisee(origine: string | null): boolean {
  return origine !== null && ORIGINES_AUTORISEES.includes(origine)
}

/** En-têtes de réponse permettant au site de la veille d'appeler ces routes. Aucun cookie n'est échangé. */
export function entetesCors(origine: string | null): Record<string, string> {
  if (!origineAutorisee(origine)) return { Vary: 'Origin' }
  return {
    'Access-Control-Allow-Origin': origine as string,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

/** Comparaison d'un secret sans fuite par le temps de réponse. */
export function secretValide(fourni: string | null, attendu: string | undefined): boolean {
  if (!attendu || !fourni) return false
  const a = createHash('sha256').update(fourni).digest()
  const b = createHash('sha256').update(attendu).digest()
  return timingSafeEqual(a, b)
}

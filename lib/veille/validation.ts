// Newsletter « Veille Lexavo » — logique pure : validation, consentement, jetons, accès depuis un autre site (CORS).
// Ce module n'importe rien du projet : il est testé directement par `npm test` (voir validation.test.ts).
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

/** Version et texte EXACTS du consentement affichés sur le formulaire. Le serveur enregistre sa propre copie du texte
 *  (jamais celle envoyée par le navigateur) : c'est la preuve de ce que la personne a accepté. Changer le texte = changer la version. */
export const CONSENTEMENT_VERSION = '2026-10-v1'
export const CONSENTEMENT_TEXTE =
  "J'accepte de recevoir chaque semaine la veille Lexavo par e-mail (test gratuit). Mon adresse sert uniquement à cet envoi, " +
  'et je peux me désinscrire à tout moment, en un clic.'

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

export type Inscription = { email: string; nom: string | null; profil: Profil }

/** Champ caché du formulaire, invisible pour un humain : s'il est rempli, c'est un robot. */
export function estPiege(corps: unknown): boolean {
  if (typeof corps !== 'object' || corps === null) return false
  const piege = (corps as Record<string, unknown>).site_web
  return typeof piege === 'string' && piege.trim().length > 0
}

export function validerInscription(corps: unknown): { ok: true; valeur: Inscription } | { ok: false; erreur: string } {
  if (typeof corps !== 'object' || corps === null) return { ok: false, erreur: 'Requête invalide.' }
  const c = corps as Record<string, unknown>
  const email = normaliserEmail(c.email)
  if (!email) return { ok: false, erreur: "L'adresse e-mail n'est pas valide." }
  if (c.consentement !== true) return { ok: false, erreur: 'Le consentement est nécessaire pour recevoir la veille.' }
  const profil = PROFILS.includes(c.profil as Profil) ? (c.profil as Profil) : 'autre'
  return { ok: true, valeur: { email, nom: nettoyerNom(c.nom), profil } }
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

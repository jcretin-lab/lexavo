import type { NextRequest } from 'next/server'
import { adresseIp, creerOutils, reponse, reponseOptions } from '@/lib/veille/http'
import { creerLimiteur } from '@/lib/veille/limite'
import { confirmer } from '@/lib/veille/service'
import { jetonValide, origineAutorisee } from '@/lib/veille/validation'

// Confirmation de l'inscription : appelée par la page veille.lexavo.fr/confirmer.html quand la personne clique sur le bouton.
// (Le lien reçu par e-mail ouvre cette page ; il ne confirme pas à lui seul, pour qu'un antivirus qui « ouvre » les liens
// d'un e-mail ne puisse pas inscrire quelqu'un à sa place.)

const autoriserIp = creerLimiteur(30, 60 * 60 * 1000)

export async function OPTIONS(request: NextRequest) {
  return reponseOptions(request.headers.get('origin'))
}

export async function POST(request: NextRequest) {
  const origine = request.headers.get('origin')
  if (origine !== null && !origineAutorisee(origine)) return reponse({ error: 'Origine non autorisée.' }, 403, null)
  if (!autoriserIp(adresseIp(request))) return reponse({ error: 'Trop de demandes. Réessayez plus tard.' }, 429, origine)

  let jeton: unknown
  try {
    jeton = ((await request.json()) as { jeton?: unknown }).jeton
  } catch {
    return reponse({ error: 'Requête invalide.' }, 400, origine)
  }
  if (!jetonValide(jeton)) return reponse({ resultat: 'invalide' }, 404, origine)

  try {
    const resultat = await confirmer(creerOutils(), jeton)
    const statut = resultat === 'invalide' ? 404 : resultat === 'expire' ? 410 : 200
    return reponse({ resultat }, statut, origine)
  } catch (erreur) {
    console.error('[veille/confirmer]', erreur instanceof Error ? erreur.message : erreur)
    return reponse({ error: 'Service momentanément indisponible. Réessayez plus tard.' }, 503, origine)
  }
}

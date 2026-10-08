import type { NextRequest } from 'next/server'
import { adresseIp, creerOutils, reponse, reponseOptions } from '@/lib/veille/http'
import { creerLimiteur } from '@/lib/veille/limite'
import { desinscrire } from '@/lib/veille/service'
import { jetonValide, origineAutorisee } from '@/lib/veille/validation'

// Désinscription en un clic. Deux usages :
//  - les messageries (Gmail, Apple Mail, Outlook…) appellent cette route en POST quand la personne clique sur « Se désinscrire » à côté de
//    l'expéditeur (en-têtes List-Unsubscribe et List-Unsubscribe-Post de chaque message, RFC 8058) : le jeton est dans l'adresse ;
//  - la page veille.lexavo.fr/desinscription.html l'appelle quand la personne clique sur le lien du pied de message.
// Seul POST agit : un simple GET (aperçu de lien, antivirus) ne désinscrit personne.

const autoriserIp = creerLimiteur(60, 60 * 60 * 1000)

export async function OPTIONS(request: NextRequest) {
  return reponseOptions(request.headers.get('origin'))
}

async function lireJeton(request: NextRequest): Promise<unknown> {
  const dansLAdresse = request.nextUrl.searchParams.get('jeton')
  if (dansLAdresse) return dansLAdresse
  const type = request.headers.get('content-type') ?? ''
  try {
    if (type.includes('application/json')) return ((await request.json()) as { jeton?: unknown }).jeton
    if (type.includes('application/x-www-form-urlencoded')) return (await request.formData()).get('jeton')
  } catch {
    return null
  }
  return null
}

export async function POST(request: NextRequest) {
  const origine = request.headers.get('origin')
  if (origine !== null && !origineAutorisee(origine)) return reponse({ error: 'Origine non autorisée.' }, 403, null)
  if (!autoriserIp(adresseIp(request))) return reponse({ error: 'Trop de demandes. Réessayez plus tard.' }, 429, origine)

  const jeton = await lireJeton(request)
  if (!jetonValide(jeton)) return reponse({ resultat: 'invalide' }, 404, origine)

  try {
    const resultat = await desinscrire(creerOutils(), jeton)
    return reponse({ resultat }, resultat === 'invalide' ? 404 : 200, origine)
  } catch (erreur) {
    console.error('[veille/desinscription]', erreur instanceof Error ? erreur.message : erreur)
    return reponse({ error: 'Service momentanément indisponible. Réessayez plus tard.' }, 503, origine)
  }
}

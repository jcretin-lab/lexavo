import type { NextRequest } from 'next/server'
import { adresseIp, creerOutils, reponse, reponseOptions } from '@/lib/veille/http'
import { creerLimiteur } from '@/lib/veille/limite'
import { inscrire } from '@/lib/veille/service'
import { estPiege, origineAutorisee, validerInscription } from '@/lib/veille/validation'

// Inscription à la veille Lexavo (formulaire de veille.lexavo.fr). Double confirmation : rien n'est actif tant que
// la personne n'a pas cliqué sur le lien reçu par e-mail.

const autoriserIp = creerLimiteur(8, 60 * 60 * 1000)

// Réponse identique que l'adresse soit nouvelle, déjà inscrite ou déjà confirmée : on ne révèle pas qui est abonné.
const REPONSE_GENERIQUE = {
  ok: true,
  message:
    "Si cette adresse est valide, un e-mail de confirmation vient de vous être envoyé. Cliquez sur le lien qu'il contient pour terminer votre inscription.",
}

export async function OPTIONS(request: NextRequest) {
  return reponseOptions(request.headers.get('origin'))
}

export async function POST(request: NextRequest) {
  const origine = request.headers.get('origin')
  if (origine !== null && !origineAutorisee(origine)) return reponse({ error: 'Origine non autorisée.' }, 403, null)

  if (!autoriserIp(adresseIp(request))) {
    return reponse({ error: 'Trop de demandes. Réessayez dans une heure.' }, 429, origine)
  }

  let corps: unknown
  try {
    corps = await request.json()
  } catch {
    return reponse({ error: 'Requête invalide.' }, 400, origine)
  }

  if (estPiege(corps)) return reponse(REPONSE_GENERIQUE, 200, origine)       // robot : même réponse, aucune action

  const validation = validerInscription(corps)
  if (!validation.ok) return reponse({ error: validation.erreur }, 400, origine)

  try {
    const resultat = await inscrire(creerOutils(), validation.valeur)
    if (resultat === 'echec_envoi') {
      return reponse({ error: "L'e-mail de confirmation n'a pas pu être envoyé. Réessayez dans quelques minutes." }, 503, origine)
    }
  } catch (erreur) {
    console.error('[veille/inscription]', erreur instanceof Error ? erreur.message : erreur)
    return reponse({ error: 'Service momentanément indisponible. Réessayez plus tard.' }, 503, origine)
  }
  return reponse(REPONSE_GENERIQUE, 200, origine)
}

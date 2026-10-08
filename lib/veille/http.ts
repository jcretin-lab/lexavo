// Assistants communs aux routes /api/veille/* : réponses JSON avec en-têtes CORS, adresse IP, assemblage des dépendances réelles.
import { NextResponse, type NextRequest } from 'next/server'
import { envoyerConfirmationVeille } from './courriel'
import { creerDepotSupabase } from './depot-supabase'
import type { Outils } from './service'
import { CONSENTEMENT_TEXTE, CONSENTEMENT_VERSION, entetesCors, nouveauJeton } from './validation'

export function reponse(corps: unknown, statut: number, origine: string | null): NextResponse {
  return NextResponse.json(corps, { status: statut, headers: { ...entetesCors(origine), 'Cache-Control': 'no-store' } })
}

/** Réponse à la requête préalable (« preflight ») envoyée par le navigateur avant un appel depuis un autre site. */
export function reponseOptions(origine: string | null): NextResponse {
  return new NextResponse(null, { status: 204, headers: entetesCors(origine) })
}

export function adresseIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('x-real-ip') ?? 'inconnue'
}

export function creerOutils(): Outils {
  return {
    depot: creerDepotSupabase(),
    envoyerConfirmation: envoyerConfirmationVeille,
    nouveauJeton,
    maintenant: () => new Date(),
    consentement: { version: CONSENTEMENT_VERSION, texte: CONSENTEMENT_TEXTE },
  }
}

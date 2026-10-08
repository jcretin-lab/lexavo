import { NextResponse, type NextRequest } from 'next/server'
import { creerOutils } from '@/lib/veille/http'
import { exporter, purger } from '@/lib/veille/service'
import { secretValide } from '@/lib/veille/validation'

// Liste des abonnés confirmés et des désinscrits, lue par le programme qui envoie la veille avant chaque envoi (pour ne jamais
// écrire à quelqu'un qui s'est désinscrit). Protégée par un secret (VEILLE_EXPORT_SECRET) : sans lui, la route reste fermée.

const SANS_CACHE = { 'Cache-Control': 'no-store' }

export async function GET(request: NextRequest) {
  const attendu = process.env.VEILLE_EXPORT_SECRET
  if (!attendu) return NextResponse.json({ error: 'Export non configuré.' }, { status: 503, headers: SANS_CACHE })

  const fourni = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '') ?? null
  if (!secretValide(fourni, attendu)) return NextResponse.json({ error: 'Accès refusé.' }, { status: 401, headers: SANS_CACHE })

  try {
    const outils = creerOutils()
    // Ménage prévu par la politique de confidentialité (demandes jamais confirmées, anciens désinscrits) : une panne ici ne bloque pas l'export.
    await purger(outils).catch((erreur) => console.error('[veille/purge]', erreur instanceof Error ? erreur.message : erreur))
    return NextResponse.json(await exporter(outils), { headers: SANS_CACHE })
  } catch (erreur) {
    console.error('[veille/export]', erreur instanceof Error ? erreur.message : erreur)
    return NextResponse.json({ error: 'Service momentanément indisponible.' }, { status: 503, headers: SANS_CACHE })
  }
}

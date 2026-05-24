import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBienvenue, sendNotifNouveauClient } from '@/lib/email'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('nom, ville, barreau, plan')
    .eq('user_id', user.id)
    .maybeSingle()

  // Mo4 — Gérer l'échec de sendBienvenue explicitement
  const result = await sendBienvenue(user.email, cabinet?.nom ?? undefined)
  if (!result.ok) {
    console.error('[bienvenue] Échec envoi email :', result.error)
  }

  // Notification admin — toujours envoyée, erreurs explicites
  const notifResult = await sendNotifNouveauClient({
    email: user.email,
    nom: cabinet?.nom ?? '(non renseigné)',
    plan: cabinet?.plan ?? 'trial',
    ville: cabinet?.ville ?? '',
    barreau: cabinet?.barreau ?? '',
  })
  if (!notifResult.ok) {
    console.error('[bienvenue] Échec notif admin :', notifResult.error)
  } else {
    console.log('[bienvenue] Notif admin envoyée pour', user.email)
  }

  return NextResponse.json({ ok: result.ok })
}

import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendBienvenue } from '@/lib/email'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user?.email) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('nom')
    .eq('user_id', user.id)
    .maybeSingle()

  // Mo4 — Gérer l'échec de sendBienvenue explicitement
  const result = await sendBienvenue(user.email, cabinet?.nom ?? undefined)
  if (!result.ok) {
    console.error('[bienvenue] Échec envoi email :', result.error)
  }

  return NextResponse.json({ ok: result.ok })
}

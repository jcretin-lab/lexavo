import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, plan')
    .eq('user_id', user.id)
    .single()

  if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })
  if (cabinet.plan !== 'cabinet') {
    return NextResponse.json({ error: 'Fonctionnalité réservée au Plan Cabinet' }, { status: 403 })
  }

  const { membre_id } = await request.json()
  if (!membre_id) return NextResponse.json({ error: 'membre_id requis' }, { status: 400 })

  const { error: dbError } = await supabase
    .from('membres')
    .delete()
    .eq('id', membre_id)
    .eq('cabinet_id', cabinet.id)

  if (dbError) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

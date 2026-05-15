import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: cabinet } = await supabase
      .from('cabinets')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })

    // Le FK calendrier.generation_id est ON DELETE SET NULL : on purge d'abord les
    // entrees calendrier liees pour eviter des posts programmes orphelins.
    const { error: calErr } = await supabase
      .from('calendrier')
      .delete()
      .eq('generation_id', id)
      .eq('cabinet_id', cabinet.id)

    if (calErr) return NextResponse.json({ error: calErr.message }, { status: 500 })

    const { error } = await supabase
      .from('generations')
      .delete()
      .eq('id', id)
      .eq('cabinet_id', cabinet.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

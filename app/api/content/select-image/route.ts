import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { generation_id, image_url } = await request.json()
    if (!generation_id || typeof image_url !== 'string' || !image_url.trim()) {
      return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })
    }

    const { data: cabinet } = await supabase
      .from('cabinets')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })

    const { data: generation } = await supabase
      .from('generations')
      .select('images')
      .eq('id', generation_id)
      .eq('cabinet_id', cabinet.id)
      .single()
    if (!generation) return NextResponse.json({ error: 'Génération introuvable' }, { status: 404 })

    const images = (generation.images ?? {}) as Record<string, string | null>
    const validUrls = new Set(Object.values(images).filter(Boolean) as string[])
    if (!validUrls.has(image_url)) {
      return NextResponse.json({ error: 'URL non reconnue parmi les images générées' }, { status: 400 })
    }

    const { error } = await supabase
      .from('generations')
      .update({ image_selectionnee: image_url })
      .eq('id', generation_id)
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

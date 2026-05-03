import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { generation_id, post_index, texte } = await request.json()
    if (!generation_id || post_index === undefined || typeof texte !== 'string' || !texte.trim()) {
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
      .select('posts_linkedin')
      .eq('id', generation_id)
      .eq('cabinet_id', cabinet.id)
      .single()

    if (!generation) return NextResponse.json({ error: 'Génération introuvable' }, { status: 404 })

    const posts = generation.posts_linkedin as Array<{ texte: string; hashtags: string[] }>
    if (!Array.isArray(posts) || post_index < 0 || post_index >= posts.length) {
      return NextResponse.json({ error: 'Index de post invalide' }, { status: 400 })
    }

    posts[post_index] = { ...posts[post_index], texte }

    const { error } = await supabase
      .from('generations')
      .update({ posts_linkedin: posts })
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

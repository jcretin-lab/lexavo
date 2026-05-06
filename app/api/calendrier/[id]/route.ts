import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_WEBHOOK_FACEBOOK = process.env.MAKE_WEBHOOK_URL ?? ''
const DEFAULT_WEBHOOK_LINKEDIN = process.env.MAKE_WEBHOOK_LINKEDIN ?? ''

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: cabinet } = await supabase
      .from('cabinets')
      .select('id, facebook_connected, linkedin_connected, make_webhook_facebook, make_webhook_linkedin')
      .eq('user_id', user.id)
      .single()

    if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })

    const body = await request.json()

    if (body.publish === true) {
      const { data: entry } = await supabase
        .from('calendrier')
        .select('contenu, image_url, generation_id, reseau')
        .eq('id', id)
        .eq('cabinet_id', cabinet.id)
        .single()

      if (!entry) return NextResponse.json({ error: 'Post introuvable' }, { status: 404 })

      const entryReseau = (entry as Record<string, unknown>).reseau ?? 'facebook'
      const cab = cabinet as Record<string, unknown>
      const isLinkedin = entryReseau === 'linkedin'

      if (isLinkedin && !cab.linkedin_connected) {
        return NextResponse.json({ error: 'LinkedIn non connecté. Connectez votre profil depuis Réseaux sociaux.' }, { status: 400 })
      }
      if (!isLinkedin && !cab.facebook_connected) {
        return NextResponse.json({ error: 'Facebook non connecté. Connectez votre page depuis Réseaux sociaux.' }, { status: 400 })
      }

      const webhookUrl = isLinkedin
        ? ((cab.make_webhook_linkedin as string) || DEFAULT_WEBHOOK_LINKEDIN)
        : ((cab.make_webhook_facebook as string) || DEFAULT_WEBHOOK_FACEBOOK)

      if (!webhookUrl) {
        return NextResponse.json(
          { error: `Webhook ${isLinkedin ? 'LinkedIn' : 'Facebook'} non configuré.` },
          { status: 400 }
        )
      }

      const makeRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          texte: entry.contenu,
          image_url: entry.image_url ?? null,
          scheduled_date: null,
          cabinet_id: cabinet.id,
          generation_id: entry.generation_id ?? null,
          post_index: 0,
          facebook_page_url: cabinet.facebook_connected,
          reseau: entryReseau,
        }),
      })

      if (!makeRes.ok) {
        const txt = await makeRes.text()
        return NextResponse.json(
          { error: `Erreur lors de la publication (${makeRes.status}). Vérifiez que le scénario Make est actif. ${txt}` },
          { status: 502 }
        )
      }

      await supabase
        .from('calendrier')
        .update({ statut: 'publie', date_programmee: new Date().toISOString() })
        .eq('id', id)
        .eq('cabinet_id', cabinet.id)

      return NextResponse.json({ success: true })
    }

    // Mise à jour classique (texte et/ou date)
    const updates: Record<string, unknown> = {}
    if (typeof body.contenu === 'string') updates.contenu = body.contenu
    if (typeof body.date_programmee === 'string') updates.date_programmee = body.date_programmee

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 })
    }

    const { error } = await supabase
      .from('calendrier')
      .update(updates)
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

    const { error } = await supabase
      .from('calendrier')
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

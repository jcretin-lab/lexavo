import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_WEBHOOK = process.env.MAKE_WEBHOOK_URL ?? ''

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
      .select('id, make_webhook_url')
      .eq('user_id', user.id)
      .single()

    if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })

    const body = await request.json()

    if (body.publish === true) {
      const { data: entry } = await supabase
        .from('calendrier')
        .select('contenu, image_url, generation_id')
        .eq('id', id)
        .eq('cabinet_id', cabinet.id)
        .single()

      if (!entry) return NextResponse.json({ error: 'Post introuvable' }, { status: 404 })

      const webhookUrl = (cabinet.make_webhook_url as string | null) || DEFAULT_WEBHOOK

      if (!webhookUrl) {
        return NextResponse.json(
          { error: 'Réseaux sociaux non configurés. Réservez un appel pour activer la publication automatique.' },
          { status: 400 }
        )
      }

      const makeRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabinet_id: cabinet.id,
          calendrier_id: id,
          reseau: 'tous',
          texte: entry.contenu,
          hashtags: [],
          image_url: entry.image_url ?? null,
          date_programmee: new Date().toISOString(),
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

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_WEBHOOK_FACEBOOK = process.env.MAKE_WEBHOOK_URL ?? ''
const DEFAULT_WEBHOOK_LINKEDIN = process.env.MAKE_WEBHOOK_LINKEDIN ?? ''

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { generation_id, post_index, texte, hashtags, image_url, scheduled_date, reseau } = await request.json()

    const { data: cabinet } = await supabase
      .from('cabinets')
      .select('id, facebook_connected, make_webhook_facebook, make_webhook_linkedin')
      .eq('user_id', user.id)
      .single()

    if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })
    if (!cabinet.facebook_connected) return NextResponse.json({ error: 'Facebook non connecté. Connectez votre page depuis Réseaux sociaux.' }, { status: 400 })

    const cab = cabinet as Record<string, unknown>
    const isLinkedin = reseau === 'linkedin'
    const webhookUrl = isLinkedin
      ? ((cab.make_webhook_linkedin as string) || DEFAULT_WEBHOOK_LINKEDIN)
      : ((cab.make_webhook_facebook as string) || DEFAULT_WEBHOOK_FACEBOOK)

    if (!webhookUrl) return NextResponse.json({ error: `Webhook ${isLinkedin ? 'LinkedIn' : 'Facebook'} non configuré.` }, { status: 400 })

    const contenu = texte + (hashtags?.length ? '\n\n' + hashtags.map((h: string) => `#${h.replace('#', '')}`).join(' ') : '')

    const payload = {
      texte: contenu,
      image_url: image_url ?? null,
      scheduled_date: scheduled_date ?? null,
      cabinet_id: cabinet.id,
      generation_id: generation_id ?? null,
      post_index: post_index ?? 0,
      facebook_page_url: cabinet.facebook_connected,
      reseau: reseau ?? 'facebook',
    }

    const makeRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!makeRes.ok) {
      return NextResponse.json({ error: `Erreur lors de la publication (${makeRes.status}). Vérifiez que le scénario Make est actif.` }, { status: 502 })
    }

    const statut = scheduled_date ? 'en_attente' : 'publie'
    await supabase.from('calendrier').insert({
      cabinet_id: cabinet.id,
      generation_id: generation_id ?? null,
      reseau: reseau ?? 'facebook',
      contenu,
      image_url: image_url ?? null,
      date_programmee: scheduled_date ?? new Date().toISOString(),
      statut,
    })

    if (generation_id && scheduled_date) {
      await supabase
        .from('generations')
        .update({ statut: 'programme', date_publication: scheduled_date })
        .eq('id', generation_id)
    }

    return NextResponse.json({ success: true, statut })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

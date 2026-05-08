import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_WEBHOOK = process.env.MAKE_WEBHOOK_URL ?? ''

export async function POST(request: NextRequest) {
  try {
    console.log('[api/publish] Requête reçue')
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('[api/publish] Non authentifié')
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { generation_id, post_index, texte, hashtags, image_url, scheduled_date } = await request.json()
    console.log('[api/publish] Payload reçu :', { generation_id, post_index, texte: texte?.slice(0, 50), scheduled_date })

    if (!texte) {
      console.log('[api/publish] Texte manquant')
      return NextResponse.json({ error: 'Texte manquant' }, { status: 400 })
    }

    const { data: cabinet, error: cabErr } = await supabase
      .from('cabinets')
      .select('id, make_webhook_url')
      .eq('user_id', user.id)
      .single()

    console.log('[api/publish] Cabinet :', cabinet ? `id=${cabinet.id}` : `null (err: ${cabErr?.message})`)

    if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })

    const webhookUrl = (cabinet.make_webhook_url as string | null) || DEFAULT_WEBHOOK

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'Réseaux sociaux non configurés. Réservez un appel pour activer la publication automatique.' },
        { status: 400 }
      )
    }

    const hashtagsArr: string[] = Array.isArray(hashtags)
      ? hashtags.map((h: string) => `#${String(h).replace('#', '')}`)
      : []

    const contenu = hashtagsArr.length ? texte + '\n\n' + hashtagsArr.join(' ') : texte

    const isScheduled = !!scheduled_date && new Date(scheduled_date) > new Date()
    const datePublication = scheduled_date ?? new Date().toISOString()

    const { data: entry, error: insertErr } = await supabase
      .from('calendrier')
      .insert({
        cabinet_id: cabinet.id,
        generation_id: generation_id ?? null,
        reseau: 'tous',
        contenu,
        image_url: image_url ?? null,
        date_programmee: datePublication,
        statut: 'en_attente',
      })
      .select('id')
      .single()

    if (insertErr || !entry) {
      console.error('[api/publish] Erreur INSERT calendrier :', insertErr)
      return NextResponse.json({ error: 'Erreur création entrée calendrier' }, { status: 500 })
    }

    if (!isScheduled) {
      const payload = {
        cabinet_id: cabinet.id,
        calendrier_id: entry.id,
        reseau: 'tous',
        texte,
        hashtags: hashtagsArr,
        image_url: image_url ?? null,
        date_programmee: datePublication,
      }

      const makeRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      console.log('[api/publish] Réponse Make.com :', makeRes.status)
      if (!makeRes.ok) {
        const body = await makeRes.text()
        console.error('[api/publish] Erreur Make.com :', makeRes.status, body)
        await supabase.from('calendrier').update({ statut: 'erreur' }).eq('id', entry.id)
        return NextResponse.json(
          { error: `Erreur lors de la publication (${makeRes.status}). Vérifiez que le scénario Make est actif.` },
          { status: 502 }
        )
      }

      await supabase.from('calendrier').update({ statut: 'publie' }).eq('id', entry.id)
    }

    if (generation_id && isScheduled) {
      await supabase
        .from('generations')
        .update({ statut: 'programme', date_publication: scheduled_date })
        .eq('id', generation_id)
    }

    const statut = isScheduled ? 'en_attente' : 'publie'
    return NextResponse.json({ success: true, statut, calendrier_id: entry.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const DEFAULT_WEBHOOK = process.env.MAKE_WEBHOOK_URL ?? ''

interface CabinetInfo {
  make_webhook_url: string | null
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[cron/publish-due] CRON_SECRET non configuré — endpoint bloqué')
    return NextResponse.json({ error: 'CRON_SECRET non configuré' }, { status: 500 })
  }
  const auth = request.headers.get('authorization')
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: posts, error } = await supabaseAdmin
    .from('calendrier')
    .select('id, contenu, image_url, generation_id, cabinet_id, date_programmee')
    .eq('statut', 'en_attente')
    .lte('date_programmee', new Date().toISOString())

  if (error) {
    console.error('[cron/publish-due] Erreur Supabase :', error)
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ published: 0, total: 0 })
  }

  const cabinetCache: Record<string, CabinetInfo> = {}
  let published = 0
  let failed = 0

  for (const post of posts) {
    try {
      let cabinet = cabinetCache[post.cabinet_id]
      if (!cabinet) {
        const { data } = await supabaseAdmin
          .from('cabinets')
          .select('make_webhook_url')
          .eq('id', post.cabinet_id)
          .single()
        if (!data) {
          console.error(`[cron/publish-due] Cabinet introuvable pour post ${post.id}`)
          failed++
          continue
        }
        cabinet = data as CabinetInfo
        cabinetCache[post.cabinet_id] = cabinet
      }

      const webhookUrl = cabinet.make_webhook_url || DEFAULT_WEBHOOK

      if (!webhookUrl) {
        console.error(`[cron/publish-due] Webhook absent pour post ${post.id}`)
        failed++
        continue
      }

      const makeRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cabinet_id: post.cabinet_id,
          calendrier_id: post.id,
          reseau: 'tous',
          texte: post.contenu,
          hashtags: [],
          image_url: post.image_url ?? null,
          date_programmee: post.date_programmee,
        }),
      })

      if (!makeRes.ok) {
        const body = await makeRes.text().catch(() => '')
        console.error(`[cron/publish-due] Make a refusé post ${post.id} : ${makeRes.status} ${body}`)
        failed++
        continue
      }

      const { error: updateErr } = await supabaseAdmin
        .from('calendrier')
        .update({ statut: 'publie' })
        .eq('id', post.id)

      if (updateErr) {
        console.error(`[cron/publish-due] Erreur update post ${post.id} :`, updateErr)
      }

      published++
    } catch (err) {
      console.error(`[cron/publish-due] Erreur post ${post.id} :`, err)
      failed++
    }
  }

  console.log(`[cron/publish-due] ${published} publiés, ${failed} échecs sur ${posts.length} posts dus`)
  return NextResponse.json({ published, failed, total: posts.length })
}

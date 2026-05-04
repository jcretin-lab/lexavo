import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import Stripe from 'stripe'

const supabaseAdmin = createSupabaseAdmin(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function DELETE() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, stripe_subscription_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (cabinet) {
    // Annuler l'abonnement Stripe si actif
    if (cabinet.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        await stripe.subscriptions.cancel(cabinet.stripe_subscription_id)
      } catch (err) {
        console.error('[delete-account] Erreur annulation Stripe :', err)
      }
    }

    // Supprimer les images du storage
    const { data: files } = await supabaseAdmin.storage
      .from('images')
      .list(cabinet.id)
    if (files && files.length > 0) {
      const paths = files.map(f => `${cabinet.id}/${f.name}`)
      await supabaseAdmin.storage.from('images').remove(paths)
    }

    // Supprimer toutes les données liées
    await supabaseAdmin.from('calendrier').delete().eq('cabinet_id', cabinet.id)
    await supabaseAdmin.from('generations').delete().eq('cabinet_id', cabinet.id)
    await supabaseAdmin.from('membres').delete().eq('cabinet_id', cabinet.id)
    await supabaseAdmin.from('cabinets').delete().eq('id', cabinet.id)
  }

  // Supprimer le compte Auth
  await supabaseAdmin.auth.admin.deleteUser(user.id)

  return NextResponse.json({ ok: true })
}

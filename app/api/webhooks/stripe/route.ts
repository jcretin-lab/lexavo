import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendConfirmationAbonnement, sendResiliation } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

const PLAN_PAR_PRICE: Record<string, string> = {
  [process.env.STRIPE_PRICE_ACTIF!]:   'pro',
  [process.env.STRIPE_PRICE_CABINET!]: 'cabinet',
}

const MAX_MEMBRES_PAR_PLAN: Record<string, number> = {
  pro: 1,
  cabinet: 3,
}

export async function POST(request: NextRequest) {
  // C2 — Validation anticipée du webhook secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret || !webhookSecret.startsWith('whsec_') || webhookSecret === 'whsec_à_configurer') {
    console.error('[stripe/webhook] STRIPE_WEBHOOK_SECRET invalide ou non configuré. Configurez-le dans Stripe Dashboard → Developers → Webhooks.')
    return NextResponse.json({ error: 'Webhook Stripe non configuré côté serveur' }, { status: 500 })
  }

  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('[stripe/webhook] Signature invalide :', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const cabinetId = session.metadata?.cabinet_id
      const plan = session.metadata?.plan

      if (cabinetId && plan) {
        await supabaseAdmin
          .from('cabinets')
          .update({
            plan,
            stripe_subscription_id: session.subscription as string,
            max_membres: MAX_MEMBRES_PAR_PLAN[plan] ?? 1,
          })
          .eq('id', cabinetId)

        const email = session.customer_details?.email ?? session.customer_email
        if (email) {
          sendConfirmationAbonnement(email, plan).catch(err =>
            console.error('[stripe] Erreur email confirmation :', err)
          )
        }
      }
      break
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription
      const cabinetId = sub.metadata?.cabinet_id
      const priceId = sub.items.data[0]?.price.id
      const plan = PLAN_PAR_PRICE[priceId] || 'pro'

      if (cabinetId) {
        const actif = sub.status === 'active' || sub.status === 'trialing'
        const effectivePlan = actif ? plan : 'trial'
        await supabaseAdmin
          .from('cabinets')
          .update({
            plan: effectivePlan,
            stripe_subscription_id: sub.id,
            max_membres: MAX_MEMBRES_PAR_PLAN[effectivePlan] ?? 1,
          })
          .eq('id', cabinetId)
      }
      break
    }

    // M5 — Récupérer l'email AVANT de downgrader le plan
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const cabinetId = sub.metadata?.cabinet_id

      if (cabinetId) {
        // 1. Récupérer user_id AVANT le downgrade
        const { data: cabinet } = await supabaseAdmin
          .from('cabinets')
          .select('user_id')
          .eq('id', cabinetId)
          .single()

        // 2. Downgrader le plan
        await supabaseAdmin
          .from('cabinets')
          .update({ plan: 'trial', stripe_subscription_id: null, max_membres: 1 })
          .eq('id', cabinetId)

        // 3. Envoyer l'email de résiliation
        if (cabinet?.user_id) {
          const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(cabinet.user_id)
          if (user?.email) {
            sendResiliation(user.email).catch(err =>
              console.error('[stripe] Erreur email résiliation :', err)
            )
          }
        }
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}

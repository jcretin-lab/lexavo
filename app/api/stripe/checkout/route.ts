import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    console.log('[checkout] Début de la requête')

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe non configuré (STRIPE_SECRET_KEY manquant)' }, { status: 500 })
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY.trim()
    const stripe = new Stripe(stripeKey, { maxNetworkRetries: 1, timeout: 20000 })

    const PRICE_IDS: Record<string, string> = {
      pro:     process.env.STRIPE_PRICE_ACTIF!,
      cabinet: process.env.STRIPE_PRICE_CABINET!,
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { plan } = await request.json()
    console.log('[checkout] Plan demandé:', plan, '| Price ID:', PRICE_IDS[plan])
    if (!PRICE_IDS[plan]) return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })

    const { data: cabinet } = await supabase
      .from('cabinets')
      .select('id, nom, stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })

    let customerId = cabinet.stripe_customer_id
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: cabinet.nom,
        metadata: { cabinet_id: cabinet.id, user_id: user.id },
      })
      customerId = customer.id
      await supabase
        .from('cabinets')
        .update({ stripe_customer_id: customerId })
        .eq('id', cabinet.id)
    }

    const appUrl = request.nextUrl.origin
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_IDS[plan], quantity: 1 }],
      success_url: `${appUrl}/dashboard?paiement=success`,
      cancel_url: `${appUrl}/dashboard/parametres?paiement=cancel`,
      metadata: { cabinet_id: cabinet.id, plan },
      subscription_data: { metadata: { cabinet_id: cabinet.id, plan } },
    })

    console.log('[checkout] Session créée:', session.id)
    return NextResponse.json({ url: session.url })
  } catch (err: unknown) {
    console.error('[checkout] ERREUR:', err)
    const message = err instanceof Error ? err.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe((process.env.STRIPE_SECRET_KEY ?? '').trim())

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!cabinet?.stripe_customer_id) {
    return NextResponse.json({ error: 'Aucun abonnement actif' }, { status: 400 })
  }

  const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

  const session = await stripe.billingPortal.sessions.create({
    customer: cabinet.stripe_customer_id,
    return_url: `${appUrl}/dashboard/parametres`,
  })

  return NextResponse.json({ url: session.url })
}

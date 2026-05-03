import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { reseau, url, facebook_page_url } = await request.json()

    if (!reseau || !url) {
      return NextResponse.json({ error: 'Paramètres manquants.' }, { status: 400 })
    }

    if (reseau !== 'facebook' && reseau !== 'linkedin') {
      return NextResponse.json({ error: 'Réseau invalide.' }, { status: 400 })
    }

    if (!url.startsWith('https://')) {
      return NextResponse.json({ error: "L'URL webhook doit commencer par https://" }, { status: 400 })
    }

    // C3 — Pour Facebook, l'URL de la page est obligatoire
    if (reseau === 'facebook') {
      if (!facebook_page_url || !facebook_page_url.startsWith('https://')) {
        return NextResponse.json({ error: "L'URL de votre page Facebook doit commencer par https://" }, { status: 400 })
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    const { data: cabinet } = await supabase
      .from('cabinets')
      .select('id, plan')
      .eq('user_id', user.id)
      .single()

    if (!cabinet) {
      return NextResponse.json({ error: 'Cabinet introuvable.' }, { status: 404 })
    }

    if (reseau === 'linkedin' && cabinet.plan === 'essentiel') {
      return NextResponse.json({ error: 'LinkedIn disponible à partir du plan Actif.' }, { status: 403 })
    }

    // C3 — Stocker l'URL réelle de la page Facebook dans facebook_connected
    const updates: Record<string, unknown> =
      reseau === 'facebook'
        ? { make_webhook_facebook: url, facebook_connected: facebook_page_url }
        : { make_webhook_linkedin: url, linkedin_connected: true, linkedin_connected_at: new Date().toISOString() }

    const { error: updateError } = await supabase
      .from('cabinets')
      .update(updates)
      .eq('id', cabinet.id)

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

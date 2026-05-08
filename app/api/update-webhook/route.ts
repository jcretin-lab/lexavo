import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL manquante.' }, { status: 400 })
    }

    if (!url.startsWith('https://')) {
      return NextResponse.json({ error: "L'URL webhook doit commencer par https://" }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
    }

    const { data: cabinet } = await supabase
      .from('cabinets')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cabinet) {
      return NextResponse.json({ error: 'Cabinet introuvable.' }, { status: 404 })
    }

    const { error: updateError } = await supabase
      .from('cabinets')
      .update({ make_webhook_url: url })
      .eq('id', cabinet.id)

    if (updateError) {
      return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}

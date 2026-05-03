import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendLinkedinRappel } from '@/lib/email'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const auth = request.headers.get('authorization')
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  // Cabinets dont linkedin_connected_at est entre 52 et 54 jours (J-7 avant expiration à 60j)
  const dateMin = new Date()
  dateMin.setDate(dateMin.getDate() - 54)
  const dateMax = new Date()
  dateMax.setDate(dateMax.getDate() - 52)

  const { data: cabinets, error } = await supabaseAdmin
    .from('cabinets')
    .select('id, user_id, linkedin_connected_at')
    .not('linkedin_connected_at', 'is', null)
    .gte('linkedin_connected_at', dateMin.toISOString())
    .lte('linkedin_connected_at', dateMax.toISOString())

  if (error) {
    console.error('[cron/linkedin-reminder] Erreur Supabase :', error)
    return NextResponse.json({ error: 'Erreur base de données' }, { status: 500 })
  }

  if (!cabinets || cabinets.length === 0) {
    return NextResponse.json({ sent: 0 })
  }

  const results = await Promise.allSettled(
    cabinets.map(async (cabinet) => {
      const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(cabinet.user_id)
      const email = user?.email
      if (!email) return
      return sendLinkedinRappel(email)
    })
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  console.log(`[cron/linkedin-reminder] ${sent} emails envoyés sur ${cabinets.length} cabinets`)

  return NextResponse.json({ sent, total: cabinets.length })
}

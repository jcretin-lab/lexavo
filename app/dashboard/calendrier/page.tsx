import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CalendrierView } from '@/components/dashboard/calendrier-view'

export default async function CalendrierPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, facebook_connected, linkedin_connected')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  const { data: posts } = await supabase
    .from('calendrier')
    .select('id, contenu, date_programmee, statut, image_url, generation_id, reseau')
    .eq('cabinet_id', cabinet.id)
    .order('date_programmee', { ascending: true })

  const facebookConnected = !!cabinet.facebook_connected
  const linkedinConnected = !!cabinet.linkedin_connected

  return (
    <div>
      <div className="mb-8 flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendrier éditorial</h1>
          <p className="text-gray-500 mt-1">Vos posts programmés et publiés.</p>
        </div>
        <div className="flex items-center gap-2">
          {facebookConnected && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              ✓ Facebook
            </span>
          )}
          {linkedinConnected && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              ✓ LinkedIn
            </span>
          )}
        </div>
      </div>

      <CalendrierView
        posts={posts ?? []}
        facebookConnected={facebookConnected}
        linkedinConnected={linkedinConnected}
      />
    </div>
  )
}

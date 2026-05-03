import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReseauxClient } from './reseaux-client'

export default async function ReseauxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, plan, facebook_connected, make_webhook_facebook, make_webhook_linkedin')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  const cab = cabinet as Record<string, unknown>

  return (
    <ReseauxClient
      plan={cabinet.plan}
      fbWebhook={(cab.make_webhook_facebook as string) || ''}
      fbPageUrl={(cabinet.facebook_connected as string) || ''}
      liWebhook={(cab.make_webhook_linkedin as string) || ''}
      fbActive={!!cabinet.facebook_connected}
    />
  )
}

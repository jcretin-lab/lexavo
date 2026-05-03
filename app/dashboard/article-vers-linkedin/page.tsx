import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ArticleLinkedinClient } from '@/components/dashboard/article-linkedin-client'

export default async function ArticleVersLinkedinPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, plan, facebook_connected, make_webhook_url, linkedin_connected')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  return (
    <ArticleLinkedinClient
      plan={cabinet.plan ?? 'essentiel'}
      facebookConnected={!!cabinet.facebook_connected}
      linkedinConnected={!!(cabinet as Record<string, unknown>).linkedin_connected}
    />
  )
}

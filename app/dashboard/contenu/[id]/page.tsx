import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { GenerationDetail } from '@/components/dashboard/generation-detail'

export default async function ContenuDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, plan, make_webhook_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  const { data: generation } = await supabase
    .from('generations')
    .select('*')
    .eq('id', id)
    .eq('cabinet_id', cabinet.id)
    .single()

  if (!generation) notFound()

  return (
    <GenerationDetail
      generation={generation}
      reseauxConfigured={!!cabinet.make_webhook_url}
    />
  )
}

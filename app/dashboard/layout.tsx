import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardNav } from '@/components/dashboard/nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, nom, plan, make_webhook_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--ink-50)' }}>
      <DashboardNav cabinet={cabinet} />
      <main className="flex-1 ml-0 md:ml-64 pt-14 md:pt-0 p-4 md:p-8 min-h-screen">
        {children}
      </main>
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GenerateurForm } from '@/components/dashboard/generateur-form'

export default async function GenererPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, nom, ville, specialites, plan, make_webhook_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Générer du contenu</h1>
        <p className="text-gray-500 mt-1">
          Remplissez le formulaire pour obtenir un article, 3 posts pour vos réseaux sociaux, une FAQ et une image.
        </p>
      </div>
      <GenerateurForm cabinet={cabinet} />
    </div>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GenerateurForm } from '@/components/dashboard/generateur-form'
import { PlanLockScreen } from '@/components/dashboard/plan-lock-screen'

export default async function GenererPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, nom, ville, specialites, plan, facebook_connected, make_webhook_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  // Plan Essentiel : pas d'accès à la génération depuis un thème
  if (cabinet.plan === 'essentiel') {
    return (
      <PlanLockScreen
        titre="Génération depuis un thème"
        message="Cette fonctionnalité est disponible à partir du Plan Pro à 69 €/mois. Vous pouvez toujours transformer vos articles existants en posts Facebook depuis l'onglet Article → Facebook."
        minPlan="pro"
      />
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Générer du contenu</h1>
        <p className="text-gray-500 mt-1">
          Remplissez le formulaire pour obtenir un article, 3 posts Facebook, une FAQ et une image.
        </p>
      </div>
      <GenerateurForm cabinet={cabinet} />
    </div>
  )
}

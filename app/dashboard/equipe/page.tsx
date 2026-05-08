import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EquipeClient } from '@/components/dashboard/equipe-client'
import { PlanLockScreen } from '@/components/dashboard/plan-lock-screen'
import type { Membre } from '@/types'

export default async function EquipePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, nom, plan, max_membres')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  // Les membres invités (role='membre') n'ont pas accès à la gestion d'équipe
  const { data: membreRecord } = await supabase
    .from('membres')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  if (membreRecord?.role === 'membre') redirect('/dashboard')

  // Seul le plan Cabinet peut accéder à cette page
  if (cabinet.plan !== 'cabinet') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Équipe</h1>
        <PlanLockScreen
          titre="Gestion de l'équipe"
          message="Invitez vos associés avec le Plan Cabinet à 149 €/mois. Chaque membre a son propre espace de génération et ses propres réseaux sociaux. Économisez 58 €/mois par rapport à 3 abonnements Pro séparés."
          minPlan="cabinet"
        />
      </div>
    )
  }

  const { data: membresData } = await supabase
    .from('membres')
    .select('*')
    .eq('cabinet_id', cabinet.id)
    .order('created_at', { ascending: true })

  const membres = (membresData ?? []) as Membre[]

  // Plan Cabinet = 3 utilisateurs total (admin + 2 membres invitables)
  // On utilise le plan comme source de vérité, pas max_membres (peut être désynchronisé)
  const MAX_TOTAL_PAR_PLAN: Record<string, number> = { cabinet: 3, pro: 1, trial: 1 }
  const maxTotal = MAX_TOTAL_PAR_PLAN[cabinet.plan] ?? 3
  const maxMembresInvitables = maxTotal - 1

  // Resynchroniser max_membres en base si désynchronisé
  if ((cabinet.max_membres ?? 0) !== maxTotal) {
    await supabase
      .from('cabinets')
      .update({ max_membres: maxTotal })
      .eq('id', cabinet.id)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Équipe</h1>
        <p className="text-gray-500 mt-1">
          Gérez les membres de votre cabinet. Chaque membre a son propre espace indépendant.
        </p>
      </div>

      <EquipeClient
        membres={membres}
        maxMembresInvitables={maxMembresInvitables}
        cabinetNom={cabinet.nom}
      />
    </div>
  )
}

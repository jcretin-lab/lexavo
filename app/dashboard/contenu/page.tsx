import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ContenuListItem } from '@/components/dashboard/contenu-list-item'

export default async function ContenuPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  const { data: generations } = await supabase
    .from('generations')
    .select('id, theme, specialite, statut, image_url, created_at')
    .eq('cabinet_id', cabinet.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mes contenus</h1>
        <p className="text-gray-500 mt-1">Historique de toutes vos générations.</p>
      </div>

      {(!generations || generations.length === 0) ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
          <p className="text-gray-400">Aucune génération pour le moment.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {generations.map((gen) => (
            <ContenuListItem key={gen.id} gen={gen} />
          ))}
        </div>
      )}
    </div>
  )
}

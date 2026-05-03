import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'

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
            <Link key={gen.id} href={`/dashboard/contenu/${gen.id}`}
              className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-4">
                {gen.image_url && (
                  <img src={gen.image_url} alt="" className="w-16 h-10 rounded-lg object-cover flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{gen.theme}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {gen.specialite} · {format(new Date(gen.created_at), 'd MMM yyyy', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  gen.statut === 'publie' ? 'bg-green-100 text-green-700' :
                  gen.statut === 'programme' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {gen.statut}
                </span>
                <span className="text-gray-300 group-hover:text-blue-400 transition-colors text-lg">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

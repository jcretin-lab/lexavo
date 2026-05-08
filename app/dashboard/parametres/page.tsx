import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GestionAbonnement } from '@/components/dashboard/gestion-abonnement'
import { ChangeEmailForm } from '@/components/dashboard/change-email-form'
import { DeleteAccountButton } from '@/components/dashboard/delete-account-button'
import { ReseauxSection } from '@/components/dashboard/reseaux-section'

export default async function ParametresPage({
  searchParams,
}: {
  searchParams: Promise<{ paiement?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  // Vérifier si l'utilisateur est un membre invité
  const { data: membreRecord } = await supabase
    .from('membres')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle()

  const isMembre = membreRecord?.role === 'membre'

  const { paiement } = await searchParams

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Paramètres</h1>

      {!isMembre && paiement === 'success' && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-5 py-4">
          <p className="text-sm font-medium text-green-800">✓ Abonnement activé avec succès !</p>
          <p className="text-xs text-green-600 mt-0.5">Votre plan a été mis à jour.</p>
        </div>
      )}
      {!isMembre && paiement === 'cancel' && (
        <div className="mb-6 rounded-xl bg-gray-50 border border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-600">Paiement annulé. Votre plan n&apos;a pas été modifié.</p>
        </div>
      )}

      <div className="max-w-2xl space-y-6">
        {/* Abonnement — masqué pour les membres invités */}
        {!isMembre && <GestionAbonnement cabinet={cabinet} />}

        {/* Réseaux sociaux */}
        <ReseauxSection initialUrl={cabinet.make_webhook_url ?? null} />

        {/* Informations du cabinet */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informations du cabinet</h2>
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Nom', value: cabinet.nom },
              { label: 'Ville', value: cabinet.ville },
              { label: 'Barreau', value: cabinet.barreau },
              { label: 'Site web', value: cabinet.site_web || '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 flex-shrink-0">{label}</dt>
                <dd className="text-gray-900 font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Compte */}
        <ChangeEmailForm currentEmail={user.email ?? ''} />

        {/* Suppression du compte */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Supprimer mon compte</h2>
          <p className="text-sm text-gray-500 mb-4">
            Supprime définitivement votre compte, vos données et résilie votre abonnement.
          </p>
          <DeleteAccountButton />
        </div>
      </div>
    </div>
  )
}

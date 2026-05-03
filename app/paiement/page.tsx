import Link from 'next/link'

export default async function PaiementPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>
}) {
  const { statut } = await searchParams
  const success = statut === 'success'

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-10 max-w-md w-full text-center">
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">✓</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Abonnement activé !</h1>
            <p className="text-gray-500 text-sm mb-6">
              Votre plan a bien été activé. Vous pouvez maintenant générer du contenu.
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-3xl">✕</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Paiement annulé</h1>
            <p className="text-gray-500 text-sm mb-6">
              Votre paiement n&apos;a pas été effectué. Vous pouvez réessayer depuis vos paramètres.
            </p>
          </>
        )}
        <Link
          href="/dashboard"
          className="bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm hover:bg-blue-800 transition-colors"
        >
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  )
}

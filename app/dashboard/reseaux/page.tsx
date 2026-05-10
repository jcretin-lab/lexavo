import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CALENDLY_URL } from '@/lib/constants'
import { ReseauxWebhookForm } from '@/components/dashboard/reseaux-webhook-form'

export const metadata = {
  title: 'Réseaux sociaux',
}

export default async function ReseauxPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, make_webhook_url')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!cabinet) redirect('/onboarding')

  const initialUrl = cabinet.make_webhook_url ?? null

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Configurez vos réseaux sociaux</h1>
      <p className="text-sm text-gray-600 mb-8">
        Suivez ces 3 étapes pour activer la publication automatique sur LinkedIn et Facebook.
      </p>

      <div className="space-y-5">
        <Step
          number={1}
          icon="📅"
          title="Prenez rendez-vous"
          description="Réservez un appel gratuit de 20 minutes avec notre équipe. Nous configurons ensemble vos réseaux sociaux selon vos besoins."
        >
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            Réserver mon appel →
          </a>
        </Step>

        <Step
          number={2}
          icon="⬇️"
          title="Téléchargez votre scénario"
          description="Téléchargez le fichier Blueprint ci-dessous. Gardez-le de côté — nous l'utiliserons ensemble pendant le rendez-vous pour configurer votre compte Make.com."
        >
          <a
            href="/lexavo-publications.blueprint"
            download="lexavo-publications.blueprint"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
          >
            Télécharger le Blueprint Make.com
          </a>
        </Step>

        <Step
          number={3}
          icon="🔗"
          title="Collez votre URL webhook"
          description="Après votre appel de configuration, collez ici l'URL webhook Make.com que nous aurons créée ensemble."
        >
          <ReseauxWebhookForm initialUrl={initialUrl} />
        </Step>
      </div>
    </div>
  )
}

function Step({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: number
  icon: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl"
          style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
          aria-hidden
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="mb-1 uppercase font-mono"
            style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--ocre-700)' }}
          >
            Étape {number}
          </p>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          {children}
        </div>
      </div>
    </section>
  )
}

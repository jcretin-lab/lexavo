import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
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
        Activez la publication automatique sur LinkedIn et Facebook.
      </p>

      <div className="space-y-5">
        <Section
          icon="⬇️"
          title="Téléchargez le scénario et le guide"
          description="Télécharger le scénario à utiliser sur votre compte Make et le guide, ouvrez le guide."
        >
          <div className="flex flex-wrap gap-3">
            <a
              href="/lexavo-publications.json"
              download="lexavo-publications.json"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              Télécharger le scénario
            </a>
            <a
              href="/Guide_Configuration_Make_Lexavo.pptx"
              download="Guide_Configuration_Make_Lexavo.pptx"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              Télécharger le guide
            </a>
          </div>
        </Section>

        <Section
          icon="🔗"
          title="Collez votre URL webhook"
          description="Collez ici l'URL webhook Make.com créée à partir du scénario importé."
        >
          <ReseauxWebhookForm initialUrl={initialUrl} />
        </Section>
      </div>
    </div>
  )
}

function Section({
  icon,
  title,
  description,
  children,
}: {
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
          style={{ background: 'var(--navy-50)', color: 'var(--navy-900)' }}
          aria-hidden
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
          <p className="text-sm text-gray-600 mb-4">{description}</p>
          {children}
        </div>
      </div>
    </section>
  )
}

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { NOM_PAR_PLAN, type Plan } from '@/types'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { TrialStatus } from '@/components/dashboard/trial-status'
import { CALENDLY_URL } from '@/lib/constants'

export default async function DashboardPage() {
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

  const isTrial = cabinet.plan === 'trial'

  const { count: totalCount } = await supabase
    .from('generations')
    .select('id', { count: 'exact', head: true })
    .eq('cabinet_id', cabinet.id)

  const trialCount = totalCount ?? 0
  const trialExhausted = isTrial && trialCount >= 3
  const trialRemaining = isTrial ? Math.max(0, 3 - trialCount) : 0

  const { data: dernieresGenerations } = await supabase
    .from('generations')
    .select('id, theme, specialite, statut, created_at')
    .eq('cabinet_id', cabinet.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const debutMois = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const { count: postsPubliesMois } = await supabase
    .from('calendrier')
    .select('id', { count: 'exact', head: true })
    .eq('cabinet_id', cabinet.id)
    .eq('statut', 'publie')
    .gte('date_programmee', debutMois)

  const { data: prochainPost } = await supabase
    .from('calendrier')
    .select('contenu, date_programmee')
    .eq('cabinet_id', cabinet.id)
    .eq('statut', 'en_attente')
    .gte('date_programmee', new Date().toISOString())
    .order('date_programmee', { ascending: true })
    .limit(1)
    .maybeSingle()

  return (
    <div>
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="mb-1" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.875rem', color: 'var(--ink-900)', letterSpacing: '-0.015em' }}>
          Bonjour, {cabinet.nom}
        </h1>
        <p className="text-sm" style={{ color: 'var(--ink-500)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.06em' }}>
          {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
        </p>
      </div>

      {isTrial && <TrialStatus remaining={trialRemaining} exhausted={trialExhausted} />}

      {/* Activation des réseaux sociaux */}
      {!cabinet.make_webhook_url && (
        <div
          className="mb-6 rounded-xl px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{ background: 'var(--navy-50)', border: '1px solid var(--navy-100)' }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-xl"
              style={{ background: 'var(--white)', color: 'var(--navy-700)' }}
              aria-hidden
            >
              📅
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--navy-700)' }}>
                Activez la publication automatique
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--ink-500)' }}>
                Réservez un appel de 20 minutes pour configurer vos réseaux sociaux (LinkedIn et Facebook).
              </p>
            </div>
          </div>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex-shrink-0 whitespace-nowrap"
            style={{ background: 'var(--navy-700)', color: 'var(--white)' }}
          >
            Réserver mon appel →
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

        <div className="rounded-xl p-5" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--ink-500)' }}>Votre plan</p>
          <p className="font-semibold" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.75rem', color: 'var(--navy-700)', letterSpacing: '-0.01em' }}>
            {NOM_PAR_PLAN[cabinet.plan as Plan]}
          </p>
          {isTrial && (
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--warning)' }}>
              {trialExhausted
                ? 'Essai épuisé — abonnez-vous pour continuer'
                : `${trialRemaining} génération${trialRemaining > 1 ? 's' : ''} d'essai restante${trialRemaining > 1 ? 's' : ''}`}
            </p>
          )}
          <Link href="/dashboard/parametres" className="text-xs mt-2 block hover:underline" style={{ color: 'var(--ink-400)' }}>
            {isTrial ? 'Voir les plans →' : "Gérer l'abonnement →"}
          </Link>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--ink-500)' }}>Contenus générés</p>
          <p className="font-semibold" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.75rem', color: 'var(--ink-900)', letterSpacing: '-0.01em' }}>
            {totalCount ?? 0}
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--ink-400)' }}>
            {isTrial ? `sur 3 essais gratuits` : 'générations illimitées'}
          </p>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--ink-500)' }}>Posts publiés ce mois</p>
          <p className="font-semibold" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.75rem', color: 'var(--success)', letterSpacing: '-0.01em' }}>
            {postsPubliesMois ?? 0}
          </p>
          <Link href="/dashboard/calendrier" className="text-xs mt-2 block hover:underline" style={{ color: 'var(--ink-400)' }}>
            Voir le calendrier →
          </Link>
        </div>

        <div className="rounded-xl p-5" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
          <p className="text-sm mb-1" style={{ color: 'var(--ink-500)' }}>Prochain post programmé</p>
          {prochainPost ? (
            <>
              <p className="text-sm font-semibold line-clamp-2 mt-1" style={{ color: 'var(--ink-900)' }}>
                {prochainPost.contenu.slice(0, 60)}…
              </p>
              <p className="text-xs font-medium mt-2" style={{ color: 'var(--navy-700)', fontFamily: 'var(--font-jetbrains-mono)' }}>
                {format(new Date(prochainPost.date_programmee), "d MMM 'à' HH'h'mm", { locale: fr })}
              </p>
            </>
          ) : (
            <>
              <p className="mt-1" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.5rem', color: 'var(--ink-300)' }}>—</p>
              <Link href="/dashboard/generer" className="text-xs mt-2 block hover:underline" style={{ color: 'var(--ink-400)' }}>
                Générer et programmer →
              </Link>
            </>
          )}
        </div>

      </div>

      {/* Actions principales */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(cabinet.plan === 'pro' || cabinet.plan === 'cabinet') && (
          <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: 'var(--navy-700)', color: 'var(--white)' }}>
            <div>
              <p className="font-semibold">Générer du contenu</p>
              <p className="text-sm mt-0.5" style={{ color: 'var(--ocre-300)' }}>
                Article SEO + 3 posts + FAQ + image IA
              </p>
            </div>
            <Link
              href="/dashboard/generer"
              className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex-shrink-0"
              style={{ background: 'var(--white)', color: 'var(--navy-700)' }}
            >
              Générer →
            </Link>
          </div>
        )}
        <div className="rounded-2xl p-6 flex items-center justify-between" style={{ background: 'var(--navy-800)', color: 'var(--white)' }}>
          <div>
            <p className="font-semibold">Article → Posts</p>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ocre-300)' }}>
              Transformez un article en 3 posts
            </p>
          </div>
          <Link
            href="/dashboard/article-vers-linkedin"
            className="px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex-shrink-0"
            style={{ background: 'var(--white)', color: 'var(--navy-800)' }}
          >
            Transformer →
          </Link>
        </div>
      </div>

      {/* Dernières générations */}
      <div>
        <h2 className="mb-4 font-semibold" style={{ color: 'var(--ink-900)', fontSize: '1rem' }}>Dernières générations</h2>
        {(!dernieresGenerations || dernieresGenerations.length === 0) ? (
          <div className="rounded-xl p-8 text-center" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
            <p className="text-sm" style={{ color: 'var(--ink-400)' }}>Aucune génération pour le moment.</p>
            <Link href="/dashboard/article-vers-linkedin" className="mt-3 inline-block text-sm font-medium hover:underline" style={{ color: 'var(--navy-700)' }}>
              Transformer votre premier article →
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {dernieresGenerations.map((gen) => (
              <Link
                key={gen.id}
                href={`/dashboard/contenu/${gen.id}`}
                className="rounded-xl px-5 py-4 flex items-center justify-between transition-colors block"
                style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}
              >
                <div>
                  <p className="font-medium text-sm" style={{ color: 'var(--ink-900)' }}>{gen.theme}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.04em' }}>
                    {gen.specialite} · {format(new Date(gen.created_at), 'd MMM yyyy', { locale: fr })}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                  background: gen.statut === 'publie' ? 'var(--success-50)' : gen.statut === 'programme' ? 'var(--navy-100)' : 'var(--ink-100)',
                  color: gen.statut === 'publie' ? 'var(--success)' : gen.statut === 'programme' ? 'var(--navy-700)' : 'var(--ink-500)',
                }}>
                  {gen.statut}
                </span>
              </Link>
            ))}
            <Link href="/dashboard/contenu" className="block text-center text-sm mt-2 hover:underline" style={{ color: 'var(--navy-700)' }}>
              Voir tout →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

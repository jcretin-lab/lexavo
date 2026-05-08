'use client'

import { Button } from '@/components/ui/button'

export const PRICING_PLANS = [
  {
    id: 'pro',
    nom: 'Pro',
    tagline: 'Je crée et diffuse mon contenu sur LinkedIn et Facebook',
    prix: '69 €',
    periode: '/mois',
    utilisateurs: '1 utilisateur',
    recommande: true,
    features: [
      'Génération SEO depuis un thème : article + 3 posts + FAQ + image IA en 3 min',
      'Transformation d\'un article existant en 3 posts adaptés',
      'Publication automatique sur LinkedIn et Facebook',
      'Calendrier éditorial complet et programmation',
      'Contenu modifiable avant publication',
      'Configuration personnalisée des réseaux (appel inclus)',
      'Générations illimitées',
    ],
  },
  {
    id: 'cabinet',
    nom: 'Cabinet',
    tagline: 'Tout mon cabinet communique',
    prix: '149 €',
    periode: '/mois',
    utilisateurs: '3 utilisateurs inclus',
    recommande: false,
    features: [
      'Tout le plan Pro',
      '3 comptes utilisateurs inclus',
      'Chacun son espace LinkedIn et Facebook indépendant',
      'Configuration personnalisée des réseaux (appel inclus)',
      'Tableau de bord par utilisateur',
      'Générations illimitées pour chaque utilisateur',
      'Économisez 58 €/mois vs 3 abonnements Pro',
    ],
  },
]

interface Props {
  onChoose: (planId: string) => void
  loadingPlan: string | null
  currentPlanId?: string
  error?: string
  theme?: 'gold'
  minPlan?: 'pro' | 'cabinet'
}

export function PricingSection({ onChoose, loadingPlan, currentPlanId, error, minPlan }: Props) {
  const plansToShow = minPlan === 'pro'
    ? PRICING_PLANS.filter(p => p.id === 'pro' || p.id === 'cabinet')
    : minPlan === 'cabinet'
    ? PRICING_PLANS.filter(p => p.id === 'cabinet')
    : PRICING_PLANS

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--error-50)', border: '1px solid #f1ced2', color: 'var(--error)' }}>
          {error}
        </div>
      )}

      <div className={`grid grid-cols-1 gap-6 ${plansToShow.length === 3 ? 'sm:grid-cols-3' : plansToShow.length === 2 ? 'sm:grid-cols-2' : ''}`}>
        {plansToShow.map(plan => {
          const isCurrent = plan.id === currentPlanId
          return (
            <div
              key={plan.id}
              className="rounded-2xl p-6 flex flex-col"
              style={{
                background: plan.recommande ? 'var(--navy-700)' : 'var(--white)',
                border: plan.recommande ? '2px solid var(--navy-700)' : '2px solid var(--ink-200)',
                boxShadow: plan.recommande ? 'var(--shadow-lg)' : 'none',
              }}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-semibold" style={{
                  fontFamily: 'var(--font-instrument-serif)',
                  fontSize: '1.375rem',
                  color: plan.recommande ? 'var(--white)' : 'var(--ink-900)',
                  letterSpacing: '-0.01em',
                }}>{plan.nom}</p>
                {plan.recommande && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'var(--ocre-500)', color: 'var(--navy-900)' }}>
                    Recommandé
                  </span>
                )}
                {isCurrent && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--ink-100)', color: 'var(--ink-500)' }}>
                    Plan actuel
                  </span>
                )}
              </div>

              <p className="text-xs mb-4 italic" style={{ color: plan.recommande ? 'var(--ocre-300)' : 'var(--ink-400)' }}>{plan.tagline}</p>

              {/* Prix */}
              <p className="mb-0.5" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '2rem', color: plan.recommande ? 'var(--white)' : 'var(--ink-900)', letterSpacing: '-0.02em' }}>
                {plan.prix}
                <span className="text-sm font-normal" style={{ fontFamily: 'var(--font-inter)', color: plan.recommande ? 'var(--ocre-300)' : 'var(--ink-400)' }}>{plan.periode}</span>
              </p>

              <p className="text-xs mb-5" style={{ color: plan.recommande ? 'var(--ocre-300)' : 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.06em' }}>
                {plan.utilisateurs}
              </p>

              <div className="mb-5" style={{ borderTop: `1px solid ${plan.recommande ? 'rgba(255,255,255,0.18)' : 'var(--ink-100)'}` }} />

              {/* Features */}
              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm" style={{ color: plan.recommande ? 'rgba(255,255,255,0.85)' : 'var(--ink-700)' }}>
                    <span className="flex-shrink-0 mt-0.5 font-bold" style={{ color: plan.recommande ? 'var(--ocre-300)' : 'var(--success)' }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* Bouton */}
              <div className="mt-auto">
                {isCurrent ? (
                  <div className="w-full text-center text-sm font-medium py-2" style={{ color: plan.recommande ? 'rgba(255,255,255,0.5)' : 'var(--ink-400)' }}>
                    Votre plan actuel
                  </div>
                ) : (
                  <button
                    className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => onChoose(plan.id)}
                    disabled={!!loadingPlan && loadingPlan !== plan.id}
                    style={{
                      background: plan.recommande ? 'var(--ocre-500)' : 'var(--navy-700)',
                      color: plan.recommande ? 'var(--navy-900)' : 'var(--white)',
                      opacity: (!!loadingPlan && loadingPlan !== plan.id) ? 0.5 : 1,
                    }}
                  >
                    {loadingPlan === plan.id ? '…' : 'Choisir'}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs mt-4" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.06em' }}>
        Paiement sécurisé par Stripe · Sans engagement · Résiliable à tout moment
      </p>
    </div>
  )
}

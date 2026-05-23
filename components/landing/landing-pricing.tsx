'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PricingSection } from '@/components/pricing/pricing-section'

const PILOTE_FEATURES = [
  'Configuration et connexion des comptes LinkedIn + Facebook (setup offert)',
  '1 visio mensuelle de 45 min (ligne éditoriale + bilan)',
  'Génération de 4 semaines de contenu — 12 posts/mois',
  'Validation par le client avant publication',
  'Publication automatique programmée',
  'Rapport mensuel de performance',
]

export function LandingPricing() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  function choisirPlan(planId: string) {
    if (planId === 'pilote') {
      router.push('/contact')
      return
    }
    setLoadingPlan(planId)
    router.push('/login?mode=signup')
  }

  return (
    <div className="flex flex-col gap-10">
      <PricingSection
        onChoose={choisirPlan}
        loadingPlan={loadingPlan}
        theme="gold"
      />

      {/* Séparateur Pilote */}
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-4 w-full">
          <div className="flex-1 h-px" style={{ background: 'var(--ink-200)' }} />
          <p
            className="text-xs font-semibold uppercase tracking-widest whitespace-nowrap px-2"
            style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.1em' }}
          >
            Vous préférez déléguer ?
          </p>
          <div className="flex-1 h-px" style={{ background: 'var(--ink-200)' }} />
        </div>
        <p className="text-sm max-w-md" style={{ color: 'var(--ink-500)' }}>
          Le plan Pilote est un accompagnement sur mesure : nous gérons intégralement
          votre communication digitale, de la création de vos profils à la publication,
          en restant à l&apos;écoute de votre ligne éditoriale.
        </p>
      </div>

      {/* Carte Pilote */}
      <div className="max-w-sm mx-auto w-full">
        <div
          className="rounded-2xl p-6 flex flex-col"
          style={{
            background: 'var(--white)',
            border: '2px solid var(--ink-200)',
          }}
        >
          {/* En-tête */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p
              className="font-semibold"
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontSize: '1.375rem',
                color: 'var(--ink-900)',
                letterSpacing: '-0.01em',
              }}
            >
              Pilote
            </p>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: 'var(--ocre-500)', color: 'var(--navy-900)' }}
            >
              Service complet
            </span>
          </div>

          <p className="text-xs mb-4 italic" style={{ color: 'var(--ink-400)' }}>
            Ma communication, entièrement gérée pour moi
          </p>

          {/* Prix */}
          <p
            className="mb-0.5"
            style={{
              fontFamily: 'var(--font-instrument-serif)',
              fontSize: '2rem',
              color: 'var(--ink-900)',
              letterSpacing: '-0.02em',
            }}
          >
            290 €
            <span
              className="text-sm font-normal"
              style={{ fontFamily: 'var(--font-inter)', color: 'var(--ink-400)' }}
            >
              /mois
            </span>
          </p>

          <p
            className="text-xs mb-5"
            style={{
              color: 'var(--ink-400)',
              fontFamily: 'var(--font-jetbrains-mono)',
              letterSpacing: '0.06em',
            }}
          >
            1 cabinet
          </p>

          <div className="mb-5" style={{ borderTop: '1px solid var(--ink-100)' }} />

          {/* Features */}
          <ul className="flex flex-col gap-3 mb-6 flex-1">
            {PILOTE_FEATURES.map(f => (
              <li
                key={f}
                className="flex items-start gap-2 text-sm"
                style={{ color: 'var(--ink-700)' }}
              >
                <span
                  className="flex-shrink-0 mt-0.5 font-bold"
                  style={{ color: 'var(--success)' }}
                >
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          {/* Bouton */}
          <button
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-opacity mt-auto"
            onClick={() => choisirPlan('pilote')}
            style={{
              background: 'var(--navy-900)',
              color: 'var(--white)',
            }}
          >
            Nous contacter
          </button>
        </div>
      </div>
    </div>
  )
}

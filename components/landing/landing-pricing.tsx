'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRICING_PLANS } from '@/components/pricing/pricing-section'

const GOLD  = '#B8872A'
const PAPER = '#F3EFE5'
const RULE  = '#D0CBC0'
const INK   = '#0F0E0C'
const MID   = '#6E6860'
const NAVY  = '#0F2247'

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
    <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderTop: `1px solid ${RULE}` }}>
      {PRICING_PLANS.map((plan, i) => {
        const disabled = !!loadingPlan && loadingPlan !== plan.id
        return (
          <div
            key={plan.id}
            className="flex flex-col px-6 py-10 md:px-8"
            style={{
              borderTop: `3px solid ${plan.recommande ? GOLD : RULE}`,
              borderLeft: i > 0 ? `1px solid ${RULE}` : undefined,
              background: plan.recommande ? NAVY : 'transparent',
            }}
          >
            <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.15em', color: plan.recommande ? 'rgba(243,239,229,0.5)' : MID }}>
              {plan.recommande ? 'RECOMMANDÉ' : plan.id === 'pilote' ? 'SERVICE GÉRÉ' : plan.utilisateurs.toUpperCase()}
            </p>

            <h3 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.75rem', fontStyle: 'italic', color: plan.recommande ? PAPER : INK, marginTop: '0.5rem' }}>
              {plan.nom}
            </h3>

            <p style={{ fontSize: '0.8125rem', fontStyle: 'italic', color: plan.recommande ? 'rgba(243,239,229,0.6)' : MID, marginTop: '0.375rem' }}>
              {plan.tagline}
            </p>

            <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '3rem', fontStyle: 'italic', letterSpacing: '-0.02em', color: plan.recommande ? PAPER : INK, marginTop: '1.5rem' }}>
              {plan.prix}
              <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.75rem', fontStyle: 'normal', color: plan.recommande ? 'rgba(243,239,229,0.5)' : MID }}>
                {' '}{plan.periode}
              </span>
            </p>

            <ul
              className="flex flex-col gap-2.5 mt-6 mb-8 flex-1"
              style={{ borderTop: `1px solid ${plan.recommande ? 'rgba(255,255,255,0.12)' : RULE}`, paddingTop: '1.5rem' }}
            >
              {plan.features.map(f => (
                <li key={f} className="text-sm flex gap-2.5" style={{ color: plan.recommande ? 'rgba(243,239,229,0.75)' : MID, lineHeight: 1.5 }}>
                  <span style={{ color: GOLD, flexShrink: 0 }}>—</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => choisirPlan(plan.id)}
              disabled={disabled}
              className={plan.recommande ? 'ed-cta-primary' : 'ed-cta-outlined'}
              style={{ width: '100%', opacity: disabled ? 0.5 : 1 }}
            >
              {loadingPlan === plan.id ? '…' : plan.ctaLabel}
            </button>
          </div>
        )
      })}
    </div>
  )
}

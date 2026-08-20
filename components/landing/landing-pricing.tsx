'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRICING_PLANS } from '@/components/pricing/pricing-section'

const GOLD = '#B8872A'
const INK  = '#0F0E0C'
const MID  = '#6E6860'
const RULE = '#D0CBC0'
const PAPER = '#F3EFE5'

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5 items-start">
      {PRICING_PLANS.map((plan, i) => {
        const disabled = !!loadingPlan && loadingPlan !== plan.id
        return (
          <div
            key={plan.id}
            className={plan.recommande ? 'flex flex-col md:-mt-5' : 'flex flex-col'}
            style={{
              background: 'var(--white)',
              borderRadius: '24px',
              padding: plan.recommande ? '2.5rem 1.75rem 2rem' : '2rem 1.75rem 1.75rem',
              border: plan.recommande ? '2px solid rgba(184,135,42,0.4)' : `1px solid ${RULE}`,
              boxShadow: plan.recommande
                ? '0 28px 64px -20px rgba(184,135,42,0.4)'
                : '0 16px 40px -22px rgba(15,34,71,0.16)',
            }}
          >
            {/* Palier + badge */}
            <div className="flex items-center gap-2 mb-5">
              <div className="flex gap-1">
                {[0, 1, 2].map(seg => (
                  <span key={seg} style={{ width: '13px', height: '4px', borderRadius: '2px', background: seg <= i ? GOLD : RULE }} />
                ))}
              </div>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.1em', color: MID }}>
                NIVEAU {i + 1}/3
              </span>
              {plan.recommande && (
                <span
                  className="ml-auto text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: GOLD, color: INK, fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.04em' }}
                >
                  RECOMMANDÉ
                </span>
              )}
            </div>

            <h3 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.625rem', fontStyle: 'italic', color: INK }}>
              Lexavo <span style={{ color: GOLD }}>{plan.nom}</span>
            </h3>
            <p style={{ fontSize: '0.9375rem', fontWeight: 600, color: INK, marginTop: '0.375rem' }}>
              {plan.tagline}
            </p>

            <div style={{ borderTop: `1px solid ${RULE}`, margin: '1.5rem 0 1.25rem' }} />

            <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '2.75rem', fontStyle: 'italic', letterSpacing: '-0.02em', color: INK }}>
              {plan.prix}
              <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.75rem', fontStyle: 'normal', color: MID }}>
                {' '}{plan.periode}
              </span>
            </p>
            <span
              className="inline-block text-[10px] px-2.5 py-1 rounded-full mt-2"
              style={{ background: 'rgba(184,135,42,0.12)', color: GOLD, fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.06em' }}
            >
              {plan.utilisateurs.toUpperCase()}
            </span>

            <ul className="flex flex-col gap-3 mt-6 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: MID, lineHeight: 1.5 }}>
                  <span
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(184,135,42,0.15)', color: GOLD, fontSize: '10px', marginTop: '1px' }}
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => choisirPlan(plan.id)}
              disabled={disabled}
              className="w-full rounded-full py-3 text-sm font-medium"
              style={{
                background: plan.recommande ? GOLD : INK,
                color: plan.recommande ? INK : PAPER,
                opacity: disabled ? 0.5 : 1,
              }}
            >
              {loadingPlan === plan.id ? '…' : plan.ctaLabel} →
            </button>
          </div>
        )
      })}
    </div>
  )
}

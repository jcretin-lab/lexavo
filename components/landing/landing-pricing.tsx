'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRICING_PLANS } from '@/components/pricing/pricing-section'

const GOLD = '#B8872A'
const INK  = '#0F0E0C'
const MID  = '#6E6860'
const RULE = '#D0CBC0'

export function LandingPricing() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const plan = PRICING_PLANS[0]

  function choisirPlan() {
    setLoading(true)
    router.push('/login?mode=signup')
  }

  return (
    <div className="max-w-md mx-auto">
      <div
        className="flex flex-col"
        style={{
          background: 'var(--white)',
          borderRadius: '24px',
          padding: '2.5rem 1.75rem 2rem',
          border: '2px solid rgba(184,135,42,0.4)',
          boxShadow: '0 28px 64px -20px rgba(184,135,42,0.4)',
        }}
      >
        <h3 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.625rem', fontStyle: 'italic', color: INK }}>
          <span style={{ color: GOLD }}>{plan.nom}</span> Lexavo
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
          className="inline-block self-start text-[10px] px-2.5 py-1 rounded-full mt-2"
          style={{ background: 'rgba(184,135,42,0.12)', color: GOLD, fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.06em' }}
        >
          {plan.utilisateurs.toUpperCase()}
        </span>

        <ul className="flex flex-col gap-3 mt-6 mb-8">
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
          onClick={choisirPlan}
          disabled={loading}
          className="w-full rounded-full py-3 text-sm font-medium"
          style={{ background: GOLD, color: INK, opacity: loading ? 0.5 : 1 }}
        >
          {loading ? '…' : plan.ctaLabel} →
        </button>
      </div>
    </div>
  )
}

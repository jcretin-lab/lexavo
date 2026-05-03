'use client'

import { useState } from 'react'
import { PricingSection } from '@/components/pricing/pricing-section'

interface Props {
  titre: string
  message: string
  minPlan: 'pro' | 'cabinet'
}

export function PlanLockScreen({ titre, message, minPlan }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function choisirPlan(planId: string) {
    setLoadingPlan(planId)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur')
      setLoadingPlan(null)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8 rounded-2xl bg-blue-50 border border-blue-200 p-6 flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">🔒</span>
        <div>
          <h2 className="font-semibold text-blue-900 mb-1">{titre}</h2>
          <p className="text-sm text-blue-700">{message}</p>
        </div>
      </div>

      <PricingSection
        onChoose={choisirPlan}
        loadingPlan={loadingPlan}
        error={error}
        minPlan={minPlan}
      />
    </div>
  )
}

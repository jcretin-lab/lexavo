'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { NOM_PAR_PLAN, PRIX_PAR_PLAN, type Plan } from '@/types'
import { PricingSection } from '@/components/pricing/pricing-section'

interface Props {
  cabinet: { id: string; plan: string; stripe_customer_id?: string | null; stripe_subscription_id?: string | null }
}

export function GestionAbonnement({ cabinet }: Props) {
  const [loadingPortal, setLoadingPortal] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  const aUnAbonnement = !!cabinet.stripe_subscription_id
  const isTrial = cabinet.plan === 'trial'

  async function ouvrirPortail() {
    setLoadingPortal(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur')
      setLoadingPortal(false)
    }
  }

  async function changerPlan(planId: string) {
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-gray-900">Abonnement</h2>
        {aUnAbonnement && (
          <Button variant="outline" size="sm" onClick={ouvrirPortail} loading={loadingPortal}>
            Gérer la facturation
          </Button>
        )}
      </div>

      {/* Plan actuel */}
      <div className={`rounded-xl p-4 mb-6 border ${isTrial ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
        <p className={`text-xs font-medium uppercase tracking-wide mb-1 ${isTrial ? 'text-amber-500' : 'text-blue-500'}`}>
          Plan actuel
        </p>
        <p className={`text-2xl font-bold ${isTrial ? 'text-amber-800' : 'text-blue-800'}`}>
          {NOM_PAR_PLAN[cabinet.plan as Plan]}
        </p>
        {!isTrial && (
          <p className={`text-sm mt-0.5 ${isTrial ? 'text-amber-600' : 'text-blue-600'}`}>
            {PRIX_PAR_PLAN[cabinet.plan as Exclude<Plan, 'trial'>]} · Générations illimitées
          </p>
        )}
        {isTrial && (
          <p className="text-sm text-amber-600 mt-0.5">3 générations d'essai offertes</p>
        )}
      </div>

      {!aUnAbonnement && (
        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-5">
          Aucun abonnement actif. Choisissez un plan ci-dessous pour accéder à toutes les fonctionnalités.
        </p>
      )}

      {/* Pricing */}
      <PricingSection
        onChoose={changerPlan}
        loadingPlan={loadingPlan}
        currentPlanId={!isTrial ? cabinet.plan : undefined}
        error={error}
      />
    </div>
  )
}

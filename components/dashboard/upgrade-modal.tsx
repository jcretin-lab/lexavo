'use client'

import { useState, type ReactNode } from 'react'
import { PricingSection } from '@/components/pricing/pricing-section'

interface Props {
  open: boolean
  onClose: () => void
  titre?: string
  message?: ReactNode
}

export function UpgradeModal({ open, onClose, titre, message }: Props) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [error, setError] = useState('')

  if (!open) return null

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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>

          <div className="text-center mb-6">
            <p className="text-3xl mb-2">✦</p>
            <h2 className="text-xl font-bold text-gray-900">
              {titre ?? 'Vos 10 essais gratuits sont épuisés'}
            </h2>
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {message ?? (
                <>
                  Vous êtes satisfait des articles et posts générés ?<br />
                  Passez à la diffusion et à la programmation permanente.
                </>
              )}
            </p>
          </div>

          <PricingSection
            onChoose={choisirPlan}
            loadingPlan={loadingPlan}
            error={error}
          />
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PricingSection } from '@/components/pricing/pricing-section'

export function LandingPricing() {
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  function choisirPlan(planId: string) {
    setLoadingPlan(planId)
    router.push('/login?mode=signup')
  }

  return (
    <PricingSection
      onChoose={choisirPlan}
      loadingPlan={loadingPlan}
      theme="gold"
    />
  )
}

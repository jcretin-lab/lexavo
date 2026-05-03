'use client'

import { useState } from 'react'
import { UpgradeModal } from './upgrade-modal'

interface Props {
  utilisees: number
  quota: number
}

export function QuotaStatus({ utilisees, quota }: Props) {
  const [showModal, setShowModal] = useState(true)

  return (
    <>
      <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-red-800">Quota mensuel atteint</p>
          <p className="text-xs text-red-600 mt-0.5">
            Vous avez utilisé vos {utilisees} générations ce mois-ci. Upgradez pour continuer.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex-shrink-0 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors"
        >
          Upgrader mon plan →
        </button>
      </div>

      <UpgradeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        titre={`Vous avez utilisé vos ${utilisees} générations ce mois-ci`}
        message="Passez à un plan supérieur pour continuer à générer du contenu juridique."
      />
    </>
  )
}

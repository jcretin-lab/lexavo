'use client'

import { useState } from 'react'
import { UpgradeModal } from './upgrade-modal'

interface Props {
  remaining: number
  exhausted: boolean
}

export function TrialStatus({ remaining, exhausted }: Props) {
  const [showModal, setShowModal] = useState(exhausted)

  if (!exhausted && remaining > 1) return null

  return (
    <>
      {exhausted ? (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-red-800">Essai gratuit terminé</p>
            <p className="text-xs text-red-600 mt-0.5">
              Vos 3 générations d&apos;essai sont épuisées. Abonnez-vous pour un accès illimité.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            Voir les plans →
          </button>
        </div>
      ) : (
        <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-800">
              Essai gratuit — {remaining} génération{remaining > 1 ? 's' : ''} restante{remaining > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              Passez à un plan payant pour un accès illimité.
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-semibold text-blue-700 hover:underline flex-shrink-0"
          >
            Voir les plans →
          </button>
        </div>
      )}

      <UpgradeModal open={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}

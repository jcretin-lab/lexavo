'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function DeleteAccountButton() {
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'confirm'>('idle')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/account/delete', { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur lors de la suppression')
      }
      router.push('/login?message=compte_supprime')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur')
      setLoading(false)
    }
  }

  if (step === 'idle') {
    return (
      <button
        onClick={() => setStep('confirm')}
        className="text-sm text-red-500 hover:underline"
      >
        Supprimer mon compte
      </button>
    )
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-3">
      <p className="text-sm font-semibold text-red-800">Confirmer la suppression</p>
      <p className="text-sm text-red-700">
        Cette action est <strong>irréversible</strong>. Votre compte, votre cabinet,
        tous vos contenus générés et vos images seront définitivement supprimés.
        Votre abonnement Stripe sera également résilié.
      </p>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => { setStep('idle'); setError('') }}
          disabled={loading}
        >
          Annuler
        </Button>
        <Button
          size="sm"
          onClick={handleDelete}
          loading={loading}
          className="bg-red-600 hover:bg-red-700 text-white border-0"
        >
          Oui, supprimer définitivement
        </Button>
      </div>
    </div>
  )
}

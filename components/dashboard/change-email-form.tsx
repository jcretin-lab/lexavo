'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  currentEmail: string
}

export function ChangeEmailForm({ currentEmail }: Props) {
  const [editing, setEditing] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!newEmail.trim() || newEmail === currentEmail) return
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.updateUser({ email: newEmail.trim() })

    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setSuccess(true)
      setEditing(false)
      setNewEmail('')
    }
  }

  function handleCancel() {
    setEditing(false)
    setNewEmail('')
    setError('')
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Compte</h2>

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Un email de confirmation a été envoyé à <strong>{newEmail || 'votre nouvelle adresse'}</strong>.
          Cliquez sur le lien pour valider le changement.
        </div>
      )}

      {!editing ? (
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Email : <span className="text-gray-900 font-medium">{currentEmail}</span>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="text-xs font-medium text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors flex-shrink-0"
          >
            Modifier
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="text-sm text-gray-500 mb-1">
            Email actuel : <span className="text-gray-700">{currentEmail}</span>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Nouvel email</label>
            <input
              type="email"
              value={newEmail}
              onChange={e => setNewEmail(e.target.value)}
              placeholder="nouveau@email.com"
              required
              autoFocus
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="submit"
              disabled={loading || !newEmail.trim() || newEmail === currentEmail}
              className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Envoi…' : 'Envoyer le lien de confirmation'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

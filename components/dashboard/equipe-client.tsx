'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Membre } from '@/types'

interface Props {
  membres: Membre[]
  maxMembresInvitables: number
  cabinetNom: string
}

export function EquipeClient({ membres: initialMembres, maxMembresInvitables, cabinetNom }: Props) {
  const router = useRouter()
  const [membres, setMembres] = useState<Membre[]>(initialMembres)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const peutInviter = membres.length < maxMembresInvitables

  async function inviter(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const res = await fetch('/api/equipe/inviter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMembres(prev => [...prev, data.membre])
      setEmail('')
      setSuccess(`Invitation envoyée à ${email}`)
      if (data.warning) setSuccess(`${data.warning} Invitation créée sans envoi d'email.`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'invitation')
    } finally {
      setLoading(false)
    }
  }

  async function supprimer(membreId: string, membreEmail: string) {
    if (!confirm(`Supprimer ${membreEmail} de l'équipe ?`)) return
    setDeletingId(membreId)
    setError(null)

    try {
      const res = await fetch('/api/equipe/supprimer', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membre_id: membreId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMembres(prev => prev.filter(m => m.id !== membreId))
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          ✓ {success}
        </div>
      )}

      {/* Membres actuels */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Membres de l&apos;équipe</h2>
        <p className="text-xs text-gray-500 mb-5">
          {membres.length + 1} / {maxMembresInvitables + 1} membres (administrateur inclus)
        </p>

        <div className="space-y-3">
          {/* Admin */}
          <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 border border-blue-100">
            <div>
              <p className="text-sm font-semibold text-gray-900">{cabinetNom}</p>
              <p className="text-xs text-blue-600">Administrateur</p>
            </div>
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-medium">Admin</span>
          </div>

          {/* Membres */}
          {membres.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Aucun membre invité pour l&apos;instant.</p>
          ) : (
            membres.map(membre => (
              <div key={membre.id} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-200">
                <div>
                  <p className="text-sm font-medium text-gray-900">{membre.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      membre.statut === 'actif' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {membre.statut === 'actif' ? '✓ Actif' : '⏳ Invitation envoyée'}
                    </span>
                    {membre.linkedin_token ? (
                      <span className="text-xs text-blue-600">LinkedIn connecté</span>
                    ) : (
                      <span className="text-xs text-gray-400">LinkedIn non connecté</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => supprimer(membre.id, membre.email)}
                  disabled={deletingId === membre.id}
                  className="text-xs text-red-500 hover:text-red-700 font-medium disabled:opacity-40 transition-colors px-2 py-1 rounded hover:bg-red-50"
                >
                  {deletingId === membre.id ? '…' : 'Supprimer'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inviter un membre */}
      {peutInviter ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-1">Inviter un membre</h2>
          <p className="text-xs text-gray-500 mb-4">
            Un email d&apos;invitation sera envoyé pour créer un compte Lexavo indépendant.
          </p>
          <form onSubmit={inviter} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="adresse@cabinet.fr"
              required
              className="flex-1 text-sm text-gray-900 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400"
            />
            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {loading ? '…' : 'Envoyer'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 text-center">
          <p className="text-sm text-gray-500">
            Vous avez atteint la limite de {maxMembresInvitables} membre{maxMembresInvitables > 1 ? 's' : ''} invité{maxMembresInvitables > 1 ? 's' : ''}.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Supprimez un membre pour libérer une place.
          </p>
        </div>
      )}
    </div>
  )
}

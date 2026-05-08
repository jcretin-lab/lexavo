'use client'

import { useState } from 'react'
import { CALENDLY_URL } from '@/lib/constants'

interface Props {
  initialUrl: string | null
}

export function ReseauxSection({ initialUrl }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(initialUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function save() {
    if (!draft.trim()) return
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const res = await fetch('/api/update-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: draft.trim() }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)
      setUrl(draft.trim())
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h2 className="font-semibold text-gray-900 mb-4">Réseaux sociaux</h2>

      {!url ? (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">
            Réservez un appel gratuit de 15 minutes pour configurer la publication automatique sur vos réseaux sociaux (LinkedIn, Facebook, Instagram...).
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
          >
            Configurer mes réseaux →
          </a>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-green-700">Réseaux configurés ✓</p>

          {!editing ? (
            <>
              <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 break-all font-mono">
                {url}
              </div>
              <button
                onClick={() => { setDraft(url); setEditing(true); setError('') }}
                className="text-xs font-medium text-gray-500 hover:text-gray-700 underline"
              >
                Modifier
              </button>
              {success && (
                <p className="text-xs text-green-600 font-medium">URL mise à jour</p>
              )}
            </>
          ) : (
            <div className="space-y-3">
              <input
                type="url"
                value={draft}
                onChange={e => setDraft(e.target.value)}
                placeholder="https://hook.eu1.make.com/..."
                className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 font-mono"
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-600">{error}</p>
              )}
              <div className="flex gap-2">
                <button
                  onClick={save}
                  disabled={saving || !draft.trim()}
                  className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => { setEditing(false); setError('') }}
                  disabled={saving}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

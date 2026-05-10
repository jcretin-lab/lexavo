'use client'

import { useState } from 'react'

interface Props {
  initialUrl: string | null
}

export function ReseauxWebhookForm({ initialUrl }: Props) {
  const [url, setUrl] = useState<string | null>(initialUrl)
  const [editing, setEditing] = useState(!initialUrl)
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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (url && !editing) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#15803d' }}
          >
            ✓ Réseaux configurés
          </span>
        </div>

        <div className="rounded-lg bg-gray-50 border border-gray-200 px-3 py-2 text-xs text-gray-600 break-all font-mono">
          {url}
        </div>

        <button
          onClick={() => { setDraft(url); setEditing(true); setError(''); setSuccess(false) }}
          className="text-xs font-medium text-gray-500 hover:text-gray-700 underline"
        >
          Modifier
        </button>

        {success && (
          <p className="text-sm font-medium text-green-700">
            ✓ Configuration enregistrée. La publication automatique est activée.
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700">
        URL webhook Make.com
      </label>
      <input
        id="webhook-url"
        type="url"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder="https://hook.make.com/..."
        className="w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
        autoFocus
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving || !draft.trim()}
          className="text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        {url && (
          <button
            onClick={() => { setEditing(false); setDraft(url); setError('') }}
            disabled={saving}
            className="text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 px-4 py-2 rounded-lg transition-colors"
          >
            Annuler
          </button>
        )}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Cabinet } from '@/types'

interface Props {
  cabinet: Cabinet
}

export function EditCabinetForm({ cabinet }: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [nom, setNom] = useState(cabinet.nom)
  const [ville, setVille] = useState(cabinet.ville)
  const [barreau, setBarreau] = useState(cabinet.barreau)

  function handleCancel() {
    setNom(cabinet.nom)
    setVille(cabinet.ville)
    setBarreau(cabinet.barreau)
    setError('')
    setEditing(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nom.trim() || !ville.trim() || !barreau.trim()) return
    setLoading(true)
    setError('')
    setSuccess(false)

    const supabase = createClient()
    const { error: err } = await supabase
      .from('cabinets')
      .update({
        nom: nom.trim(),
        ville: ville.trim(),
        barreau: barreau.trim(),
      })
      .eq('id', cabinet.id)

    setLoading(false)
    if (err) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } else {
      setSuccess(true)
      setEditing(false)
      router.refresh()
    }
  }

  const inputClass = 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500'
  const labelClass = 'text-sm font-medium text-gray-700'

  return (
    <div className="rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-3 flex items-center justify-between" style={{ background: 'var(--navy-900)' }}>
        <h2 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.125rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.01em' }}>
          Informations du cabinet
        </h2>
        {!editing && (
          <button
            onClick={() => { setSuccess(false); setEditing(true) }}
            className="text-xs font-medium text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            Modifier
          </button>
        )}
      </div>

      <div className="bg-white p-6">
        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Informations mises à jour.
          </div>
        )}

        {!editing ? (
          <dl className="space-y-3 text-sm">
            {[
              { label: 'Nom', value: nom },
              { label: 'Ville', value: ville },
              { label: 'Barreau', value: barreau },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-4">
                <dt className="text-gray-500 flex-shrink-0">{label}</dt>
                <dd className="text-gray-900 font-medium text-right">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Nom du cabinet</label>
              <input
                type="text"
                value={nom}
                onChange={e => setNom(e.target.value)}
                required
                autoFocus
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Ville</label>
              <input
                type="text"
                value={ville}
                onChange={e => setVille(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className={labelClass}>Barreau</label>
              <input
                type="text"
                value={barreau}
                onChange={e => setBarreau(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            {error && <p className="text-xs text-red-600">{error}</p>}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={loading || !nom.trim() || !ville.trim() || !barreau.trim()}
                className="text-xs font-semibold text-white px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'var(--navy-900)' }}
              >
                {loading ? 'Enregistrement…' : 'Enregistrer'}
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
    </div>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { UpgradeModal } from './upgrade-modal'
import { ConfidentialiteBandeau } from './confidentialite-bandeau'
import { PIIWarning } from './pii-warning'
import { detectPII } from '@/lib/pii-detection'

const TONS = ['Pédagogique', 'Rassurant', 'Expert', 'Accessible'] as const

const SPECIALITES_LISTE = [
  'Autre',
  'Droit administratif',
  'Droit bancaire',
  'Droit de la concurrence',
  'Droit de la consommation',
  'Droit de la construction',
  'Droit de la copropriété',
  'Droit de la famille',
  'Droit de la presse',
  'Droit de la propriété intellectuelle',
  'Droit de la santé',
  'Droit des affaires',
  'Droit des assurances',
  'Droit des baux commerciaux',
  'Droit des contrats',
  'Droit des étrangers',
  'Droit des sociétés',
  'Droit des successions',
  'Droit des victimes',
  'Droit du divorce',
  'Droit du numérique',
  'Droit du sport',
  'Droit du travail',
  'Droit environnemental',
  'Droit fiscal',
  'Droit immobilier',
  'Droit pénal',
  'Droit routier',
]

interface Cabinet {
  id: string
  nom: string
  ville: string
  specialites: string[]
  plan: string
  make_webhook_url?: string | null
}

interface Props {
  cabinet: Cabinet
}

export function GenerateurForm({ cabinet: _cabinet }: Props) {
  const router = useRouter()
  const [specialite, setSpecialite] = useState(SPECIALITES_LISTE[0])
  const [theme, setTheme] = useState('')
  const [ton, setTon] = useState<string>('Pédagogique')
  const [datePublication, setDatePublication] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [piiConfirmed, setPiiConfirmed] = useState(false)

  const specialiteOptions = SPECIALITES_LISTE.map((s) => ({ value: s, label: s }))
  const tonOptions = TONS.map((t) => ({ value: t, label: t }))
  const piiFindings = useMemo(() => detectPII(theme), [theme])
  const piiBlocked = piiFindings.length > 0 && !piiConfirmed

  function handleThemeChange(next: string) {
    setTheme(next)
    if (piiConfirmed) setPiiConfirmed(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!theme.trim()) { setError('Veuillez saisir un thème.'); return }
    if (piiBlocked) {
      setError('Confirmez l’anonymisation des informations détectées avant de générer.')
      return
    }
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialite, theme, ton, date_publication: datePublication || null }),
      })
      const data = await res.json()
      if (res.status === 402 && data.trial_exhausted) {
        setShowUpgradeModal(true)
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')

      const generationId = data.generation?.id as string | undefined
      if (!generationId) throw new Error('Génération sauvegardée mais identifiant manquant')

      // On laisse le spinner actif pendant la navigation pour eviter
      // qu'un flash de formulaire vide apparaisse avant le rendu de la page detail.
      router.push(`/dashboard/contenu/${generationId}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      setLoading(false)
    }
  }

  return (
    <>
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />
      <div className="max-w-2xl mx-auto space-y-4">
        <ConfidentialiteBandeau />
        <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <h2 className="font-semibold text-gray-900 mb-5">Paramètres de génération</h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Select
              label="Spécialité"
              value={specialite}
              onChange={(e) => setSpecialite(e.target.value)}
              options={specialiteOptions}
            />

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Thème</label>
              <textarea
                className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                rows={4}
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                placeholder="Ex : Les 5 erreurs à éviter lors d'un licenciement pour faute grave"
                required
              />
              <PIIWarning
                findings={piiFindings}
                confirmed={piiConfirmed}
                onConfirmChange={setPiiConfirmed}
                fieldId="theme"
              />
              <p className="text-xs text-gray-400">Décrivez le sujet que vous souhaitez traiter.</p>
            </div>

            <Select
              label="Ton souhaité"
              value={ton}
              onChange={(e) => setTon(e.target.value)}
              options={tonOptions}
            />

            <Input
              label="Date de publication (optionnel)"
              type="date"
              value={datePublication}
              onChange={(e) => setDatePublication(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={loading || piiBlocked}
            >
              {loading ? 'Génération en cours…' : '✦ Générer le contenu'}
            </Button>

            {loading && (
              <div className="text-center space-y-1">
                <p className="text-sm text-gray-600 font-medium">
                  Lexavo génère votre contenu et votre visuel…
                </p>
                <p className="text-xs text-gray-400">
                  Cela prend environ 30-45 secondes. Ne fermez pas la page.
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  )
}

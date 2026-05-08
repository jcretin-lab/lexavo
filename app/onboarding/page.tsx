'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BARREAUX_FR } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { CALENDLY_URL } from '@/lib/constants'

const STEPS = [
  'Identité du cabinet',
  'Activation des réseaux',
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const inviteId = searchParams.get('invite')

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Identité
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('')
  const [barreau, setBarreau] = useState('')
  const [siteWeb, setSiteWeb] = useState('')

  useEffect(() => {
    if (inviteId) {
      // On pourrait fetch les données de l'invitation, mais on laisse l'utilisateur remplir
    }
  }, [inviteId])

  async function handleSaveAndContinue() {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data: existing } = await supabase
        .from('cabinets')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle()

      let cabinet
      if (existing) {
        const { data: updated, error: updateError } = await supabase
          .from('cabinets')
          .update({ nom, ville, barreau, site_web: siteWeb || null })
          .eq('id', existing.id)
          .select()
          .single()
        if (updateError) throw updateError
        cabinet = updated
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('cabinets')
          .insert({ user_id: user.id, nom, ville, barreau, site_web: siteWeb || null, specialites: [], plan: 'trial', max_membres: 1 })
          .select()
          .single()
        if (insertError) throw insertError
        cabinet = inserted
      }

      if (!cabinet) throw new Error('Erreur lors de la création du cabinet.')

      // Email de bienvenue uniquement pour les nouveaux cabinets (pas les ré-onboardings ni les invités)
      if (!existing && !inviteId) {
        fetch('/api/email/bienvenue', { method: 'POST' }).catch(() => {})
      }

      // Si l'utilisateur vient d'une invitation, le lier au cabinet admin
      if (inviteId && cabinet) {
        const { data: membre } = await supabase
          .from('membres')
          .select('id, cabinet_id')
          .eq('id', inviteId)
          .maybeSingle()

        if (membre) {
          await supabase
            .from('membres')
            .update({ user_id: user.id, statut: 'actif', nom })
            .eq('id', inviteId)

          await supabase
            .from('cabinets')
            .update({ plan: 'pro', max_membres: 1 })
            .eq('id', cabinet.id)
        }
      }

      setSaved(true)
      setStep(1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const barreauOptions = BARREAUX_FR.map((b) => ({ value: b, label: b }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800">Lexavo</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {inviteId ? 'Créez votre espace personnel' : 'Configuration de votre cabinet'}
          </p>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                    i < step
                      ? 'bg-blue-700 border-blue-700 text-white'
                      : i === step
                      ? 'border-blue-700 text-blue-700 bg-white'
                      : 'border-gray-300 text-gray-400 bg-white'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs mt-1 hidden sm:block ${i === step ? 'text-blue-700 font-medium' : 'text-gray-400'}`}>
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-blue-700' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ÉTAPE 1 — Identité */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Identité du cabinet</h2>
              <p className="text-sm text-gray-500 mb-6">
                Ces informations seront utilisées pour personnaliser votre contenu.
              </p>
              <div className="space-y-4">
                <Input
                  label="Nom du cabinet"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="Cabinet Dupont & Associés"
                  required
                />
                <Input
                  label="Ville"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  placeholder="Paris"
                  required
                />
                <Select
                  label="Barreau d'inscription"
                  value={barreau}
                  onChange={(e) => setBarreau(e.target.value)}
                  options={barreauOptions}
                  placeholder="Sélectionnez votre barreau"
                />
                <Input
                  label="Site web (optionnel)"
                  value={siteWeb}
                  onChange={(e) => setSiteWeb(e.target.value)}
                  placeholder="https://www.cabinet-dupont.fr"
                  type="url"
                />
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={() => {
                    if (!nom || !ville || !barreau) { setError('Veuillez remplir tous les champs obligatoires.'); return }
                    setError('')
                    handleSaveAndContinue()
                  }}
                  loading={loading}
                  size="lg"
                >
                  Suivant →
                </Button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — Activation Calendly */}
          {step === 1 && (
            <div className="text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-semibold mb-2">Votre compte est prêt !</h2>
              <p className="text-sm text-gray-600 max-w-md mx-auto mb-8">
                Pour activer la publication automatique sur vos réseaux sociaux, réservez un appel gratuit de 15 minutes avec notre équipe. Nous configurons ensemble vos réseaux (LinkedIn, Facebook, Instagram...) selon vos besoins.
              </p>

              <a
                href={CALENDLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white text-sm font-semibold bg-blue-700 hover:bg-blue-800 transition-colors"
              >
                Réserver mon appel gratuit →
              </a>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                  disabled={!saved && !inviteId}
                >
                  Je le ferai plus tard → accéder au dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-400">Chargement…</p></div>}>
      <OnboardingContent />
    </Suspense>
  )
}

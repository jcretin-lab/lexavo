'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { BARREAUX_FR } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

const STEPS = [
  'Identité du cabinet',
  'Facebook',
]

function OnboardingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const inviteId = searchParams.get('invite')

  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Identité
  const [nom, setNom] = useState('')
  const [ville, setVille] = useState('')
  const [barreau, setBarreau] = useState('')
  const [siteWeb, setSiteWeb] = useState('')

  // Pré-remplir le nom depuis l'invitation si disponible
  useEffect(() => {
    if (inviteId) {
      // On pourrait fetch les données de l'invitation, mais on laisse l'utilisateur remplir
    }
  }, [inviteId])

  async function handleFinish() {
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      // Vérifier si un cabinet existe déjà pour éviter les doublons
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
          // Récupérer le plan du cabinet admin pour l'appliquer au nouveau cabinet
          const { data: cabinetAdmin } = await supabase
            .from('cabinets')
            .select('plan')
            .eq('id', membre.cabinet_id)
            .maybeSingle()

          // Mettre à jour le membre avec user_id et statut actif
          await supabase
            .from('membres')
            .update({ user_id: user.id, statut: 'actif', nom })
            .eq('id', inviteId)

          // Les membres invités reçoivent toujours 'pro', jamais 'cabinet' ni 'trial'
          await supabase
            .from('cabinets')
            .update({ plan: 'pro', max_membres: 1 })
            .eq('id', cabinet.id)
        }
      }

      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
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
                    setStep(1)
                  }}
                  size="lg"
                >
                  Suivant →
                </Button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — Facebook */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Connexion Facebook</h2>
              <p className="text-sm text-gray-500 mb-6">
                Connectez votre page Facebook pour programmer la publication automatique de vos posts.
              </p>
              <div className="rounded-xl border border-gray-200 p-6 flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-[#1877F2] flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="white" className="w-7 h-7">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-gray-700 font-medium">Connexion de votre page Facebook</p>
                  <p className="text-sm text-gray-500 mt-1">
                    La connexion Facebook se configure depuis votre tableau de bord.<br />
                    Vous pouvez passer cette étape et la configurer plus tard.
                  </p>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)}>← Retour</Button>
                <Button onClick={handleFinish} loading={loading} size="lg">
                  Accéder au tableau de bord →
                </Button>
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

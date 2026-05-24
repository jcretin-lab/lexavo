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
  'Bienvenue sur Lexavo',
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
          .update({ nom, ville, barreau })
          .eq('id', existing.id)
          .select()
          .single()
        if (updateError) throw updateError
        cabinet = updated
      } else {
        const { data: inserted, error: insertError } = await supabase
          .from('cabinets')
          .insert({ user_id: user.id, nom, ville, barreau, specialites: [], plan: 'trial', max_membres: 1 })
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

      setStep(1)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const barreauOptions = BARREAUX_FR.map((b) => ({ value: b, label: b }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-start px-4 pt-20 pb-12">
      {/* Barre de menu fixe en haut, alignee sur le menu dashboard (navy-900 + texte blanc) */}
      <header
        className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4"
        style={{ background: 'var(--navy-900)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 17 17" fill="none" style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>
            <rect x="1" y="1" width="15" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3.5 16L6 12.5H1L3.5 16Z" fill="currentColor" />
          </svg>
          <span style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.375rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
          </span>
        </div>
      </header>

      <div className="w-full max-w-2xl">
        {/* Sous-titre */}
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm">
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

          {/* ÉTAPE 2 — Bienvenue (présentation du dashboard) */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-semibold mb-1">Bienvenue sur Lexavo</h2>
              <p className="text-sm text-gray-500 mb-6">
                Votre cabinet est configuré. Voici une présentation de votre espace de travail.
              </p>

              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Votre dashboard en un coup d&apos;œil
              </h3>

              <div className="space-y-3">
                {[
                  {
                    icon: '⊞',
                    title: 'Tableau de bord',
                    desc: 'Vue d’ensemble de votre activité, statistiques de génération et raccourcis utiles.',
                  },
                  {
                    icon: '✦',
                    title: 'Générer du contenu',
                    desc: 'À partir d’un sujet juridique, créez 3 posts LinkedIn, une FAQ et une image éditoriale.',
                  },
                  {
                    icon: '⇢',
                    title: 'Mon article → Posts',
                    desc: 'Transformez un article existant (URL ou texte) en posts LinkedIn, FAQ et image.',
                  },
                  {
                    icon: '☰',
                    title: 'Mes contenus',
                    desc: 'Retrouvez, modifiez et programmez l’ensemble de vos générations.',
                  },
                  {
                    icon: '◫',
                    title: 'Calendrier',
                    desc: 'Visualisez vos posts publiés et programmés dans le temps.',
                  },
                  {
                    icon: '📅',
                    title: 'Mes réseaux',
                    desc: 'Configurez la publication automatique sur LinkedIn et Facebook via Make.',
                  },
                  {
                    icon: '⚙',
                    title: 'Paramètres',
                    desc: 'Gérez votre abonnement, votre adresse e-mail et votre compte.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-xl border border-gray-200 p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-base"
                        style={{ background: 'var(--navy-50)', color: 'var(--navy-900)' }}
                        aria-hidden
                      >
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div
                className="mt-6 rounded-xl p-5"
                style={{
                  background: 'var(--navy-50)',
                  border: '1px solid rgba(15, 27, 61, 0.08)',
                }}
              >
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--navy-900)' }}>
                  Notre conseil pour démarrer
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--navy-900)' }}>
                  Profitez de votre essai (10 générations) pour découvrir l&apos;outil. Une
                  fois satisfait des contenus produits, configurez l&apos;automatisation depuis
                  l&apos;onglet <strong>Mes réseaux</strong> — gardez une à deux générations
                  pour tester l&apos;activation. Choisissez ensuite l&apos;abonnement qui
                  correspond à votre cabinet.
                </p>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => router.push('/dashboard')} size="lg">
                  Accéder au dashboard →
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

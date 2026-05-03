'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface GuideStep {
  titre: string
  sousTitre?: string
  contenu: React.ReactNode
}

interface Props {
  reseau: 'facebook' | 'linkedin'
  steps: GuideStep[]
}

export function GuideWizard({ reseau, steps }: Props) {
  const [current, setCurrent] = useState(0)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [webhookStatus, setWebhookStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [webhookError, setWebhookError] = useState('')

  const total = steps.length
  const step = steps[current]
  const isFirst = current === 0
  const isLast = current === total - 1
  const couleur = reseau === 'facebook' ? '#1877F2' : '#0A66C2'

  async function handleWebhookSubmit(e: React.FormEvent) {
    e.preventDefault()
    setWebhookStatus('loading')
    setWebhookError('')
    try {
      const res = await fetch('/api/update-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reseau, url: webhookUrl }),
      })
      const data = await res.json()
      if (!res.ok) {
        setWebhookError(data.error || 'Erreur lors de la sauvegarde.')
        setWebhookStatus('error')
      } else {
        setWebhookStatus('success')
      }
    } catch {
      setWebhookError('Erreur réseau. Réessayez.')
      setWebhookStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--paper)' }}>
      {/* Header */}
      <header className="sticky top-0 z-10" style={{ background: 'var(--white)', borderBottom: '1px solid var(--ink-200)' }}>
        <div className="max-w-2xl mx-auto px-5 py-3 flex items-center justify-between">
          <Link href="/" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: 'var(--navy-700)', letterSpacing: '-0.02em', textDecoration: 'none' }}>
            Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
          </Link>
          <span className="text-xs font-medium" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.08em' }}>
            ÉTAPE {current + 1} / {total}
          </span>
        </div>
        <div className="h-1 w-full" style={{ background: 'var(--ink-100)' }}>
          <div
            className="h-1 transition-all duration-500"
            style={{ width: `${((current + 1) / total) * 100}%`, background: 'var(--navy-700)' }}
          />
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-5 py-10">
        {/* Badge réseau */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6" style={{ background: `${couleur}15`, color: couleur }}>
          {reseau === 'facebook' ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          )}
          Guide {reseau === 'facebook' ? 'Facebook' : 'LinkedIn'}
        </div>

        {/* Carte étape */}
        <div className="rounded-2xl p-4 sm:p-8 mb-6" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)', boxShadow: 'var(--shadow)' }}>
          <h1 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--ink-900)', letterSpacing: '-0.015em', lineHeight: 1.15, marginBottom: step.sousTitre ? '0.5rem' : '1.5rem' }}>
            {step.titre}
          </h1>
          {step.sousTitre && (
            <p className="mb-6 text-sm" style={{ color: 'var(--ink-500)', lineHeight: 1.5 }}>{step.sousTitre}</p>
          )}
          <div className="space-y-4 text-sm leading-relaxed" style={{ color: 'var(--ink-700)' }}>
            {step.contenu}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrent(c => c - 1)}
            disabled={isFirst}
            className="px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-30"
            style={{ background: 'var(--white)', border: '1px solid var(--ink-200)', color: 'var(--ink-700)' }}
          >
            ← Étape précédente
          </button>

          {isLast ? (
            <span className="text-xs" style={{ color: 'var(--ink-400)' }}>Collez votre URL ci-dessous ↓</span>
          ) : (
            <button
              onClick={() => setCurrent(c => c + 1)}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: 'var(--navy-700)', color: 'var(--white)' }}
            >
              Étape suivante →
            </button>
          )}
        </div>

        {/* Dots navigation */}
        <div className="flex justify-center gap-2 mt-8">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all"
              style={{
                width: i === current ? '24px' : '8px',
                height: '8px',
                background: i === current ? 'var(--navy-700)' : 'var(--ink-200)',
              }}
              aria-label={`Aller à l'étape ${i + 1}`}
            />
          ))}
        </div>

        {/* Formulaire webhook */}
        <div className="mt-12 rounded-2xl p-8" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)', boxShadow: 'var(--shadow)' }}>
          {webhookStatus === 'success' ? (
            <div className="text-center space-y-5">
              <p className="text-base font-semibold" style={{ color: 'var(--success)' }}>
                ✓ Publication automatique activée !
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--navy-700)', color: 'var(--white)', textDecoration: 'none' }}
              >
                Retourner au dashboard →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleWebhookSubmit} className="space-y-4">
              <h2 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: 'var(--ink-900)', marginBottom: '1rem' }}>
                Collez votre URL webhook ici
              </h2>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://hook.make.com/..."
                required
                className="w-full px-4 py-3 rounded-xl text-sm"
                style={{ border: '1px solid var(--ink-200)', color: 'var(--ink-900)', background: 'var(--paper)', outline: 'none', fontFamily: 'var(--font-jetbrains-mono)' }}
              />
              {webhookStatus === 'error' && webhookError && (
                <p className="text-sm" style={{ color: '#c0392b' }}>{webhookError}</p>
              )}
              <button
                type="submit"
                disabled={webhookStatus === 'loading' || !webhookUrl}
                className="w-full px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50 transition-opacity"
                style={{ background: 'var(--navy-700)', color: 'var(--white)' }}
              >
                {webhookStatus === 'loading' ? 'Enregistrement...' : 'Enregistrer et activer'}
              </button>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-5 text-center" style={{ borderTop: '1px solid var(--ink-200)' }}>
        <p className="text-xs" style={{ color: 'var(--ink-400)' }}>
          Besoin d&apos;aide ?{' '}
          <a href="https://calendly.com/contact-lexavo/30min" target="_blank" rel="noopener noreferrer" className="hover:underline" style={{ color: 'var(--navy-700)' }}>
            Prendre rendez-vous (gratuit)
          </a>
        </p>
      </footer>
    </div>
  )
}

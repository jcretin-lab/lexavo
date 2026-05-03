'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [inviteId, setInviteId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const m = params.get('mode')
    const inv = params.get('invite')
    const em = params.get('email')

    if (inv) {
      setInviteId(inv)
      setMode('signup')
      if (em) setEmail(decodeURIComponent(em))
    } else if (m === 'signup') {
      setMode('signup')
    } else if (m === 'reset') {
      setMode('reset')
    } else {
      setMode('login')
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback`,
        })
        if (error) throw error
        setMessage('Un email de réinitialisation vous a été envoyé.')
        setEmail('')
      } else if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError
        router.push(inviteId ? `/onboarding?invite=${inviteId}` : '/onboarding')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      let msg = err instanceof Error ? err.message : 'Une erreur est survenue'
      if (msg.toLowerCase().includes('invalid login credentials')) {
        msg = "L'email ou le mot de passe saisi est incorrect."
      }
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const titles = {
    login: 'Connexion à votre espace',
    signup: 'Créer votre compte',
    reset: 'Réinitialiser votre mot de passe',
  }

  const submitLabels = {
    login: 'Se connecter',
    signup: 'Créer mon compte',
    reset: 'Envoyer le lien',
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="mb-1" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '2.25rem', color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>
            Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-500)' }}>Contenu juridique automatisé</p>
        </div>

        <div className="rounded-xl p-8" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)', boxShadow: 'var(--shadow)' }}>
          <h2 className="font-semibold mb-6" style={{ fontSize: '1.125rem', color: 'var(--ink-900)' }}>
            {titles[mode]}
          </h2>

          {message && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--success-50)', border: '1px solid #cfe6da', color: 'var(--success)' }}>
              {message}
            </div>
          )}
          {error && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--error-50)', border: '1px solid #f1ced2', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Adresse email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="cabinet@exemple.fr"
              required
              autoComplete="email"
            />

            {mode !== 'reset' && (
              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                minLength={6}
              />
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('reset'); setError(''); setMessage('') }}
                  className="text-sm hover:underline"
                  style={{ color: 'var(--ink-400)' }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {submitLabels[mode]}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--ink-500)' }}>
            {mode === 'login' && (
              <>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => { setMode('signup'); setError(''); setMessage('') }}
                  className="font-medium hover:underline"
                  style={{ color: 'var(--navy-700)' }}
                >
                  Essayer gratuitement →
                </button>
              </>
            )}
            {mode === 'signup' && (
              <>
                Déjà un compte ?{' '}
                <button
                  onClick={() => { setMode('login'); setError(''); setMessage('') }}
                  className="font-medium hover:underline"
                  style={{ color: 'var(--navy-700)' }}
                >
                  Se connecter →
                </button>
              </>
            )}
            {mode === 'reset' && (
              <button
                onClick={() => { setMode('login'); setError(''); setMessage('') }}
                className="font-medium hover:underline"
                style={{ color: 'var(--navy-700)' }}
              >
                ← Retour à la connexion
              </button>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--ink-400)' }}>
          Conforme au décret du 12 juillet 2005 et au RIN du barreau
        </p>
      </div>
    </div>
  )
}

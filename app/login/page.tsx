'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setMode(params.get('mode') === 'signup' ? 'signup' : 'login')
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      if (mode === 'signup') {
        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error)
        const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError
        router.push('/onboarding')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(msg)
    } finally {
      setLoading(false)
    }
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
            {mode === 'login' ? 'Connexion à votre espace' : 'Créer votre compte'}
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

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              {mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: 'var(--ink-500)' }}>
            {mode === 'login' ? (
              <>
                Pas encore de compte ?{' '}
                <button
                  onClick={() => { setMode('signup'); setError('') }}
                  className="font-medium hover:underline"
                  style={{ color: 'var(--navy-700)' }}
                >
                  Essayer gratuitement →
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{' '}
                <button
                  onClick={() => { setMode('login'); setError('') }}
                  className="font-medium hover:underline"
                  style={{ color: 'var(--navy-700)' }}
                >
                  Se connecter →
                </button>
              </>
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

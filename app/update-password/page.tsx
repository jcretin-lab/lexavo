'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function UpdatePasswordPage() {
  const router = useRouter()
  const supabase = createClient()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/dashboard')
      router.refresh()
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
        <div className="text-center mb-10">
          <h1 className="mb-1" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '2.25rem', color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>
            Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-500)' }}>Contenu juridique automatisé</p>
        </div>

        <div className="rounded-xl p-8" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)', boxShadow: 'var(--shadow)' }}>
          <h2 className="font-semibold mb-2" style={{ fontSize: '1.125rem', color: 'var(--ink-900)' }}>
            Nouveau mot de passe
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--ink-500)' }}>
            Choisissez un mot de passe d&apos;au moins 6 caractères.
          </p>

          {error && (
            <div className="mb-4 rounded-lg px-4 py-3 text-sm" style={{ background: 'var(--error-50)', border: '1px solid #f1ced2', color: 'var(--error)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nouveau mot de passe"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={6}
            />
            <Input
              label="Confirmer le mot de passe"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={6}
            />

            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Enregistrer le mot de passe
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--ink-400)' }}>
          Conforme au décret du 12 juillet 2005 et au RIN du barreau
        </p>
      </div>
    </div>
  )
}

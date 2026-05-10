'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GenerationDetail } from '@/components/dashboard/generation-detail'
import type { PostLinkedin, ImagesByStyle } from '@/types'

const TONS = ['Pédagogique', 'Rassurant', 'Expert', 'Accessible'] as const

interface GenerationResult {
  id: string
  theme: string
  specialite: string
  statut: 'brouillon' | 'publie' | 'programme'
  image_url?: string | null
  images?: ImagesByStyle | null
  image_selectionnee?: string | null
  posts_linkedin?: PostLinkedin[] | null
  article_blog?: null
  faq?: null
  created_at: string
}

interface Props {
  reseauxConfigured: boolean
}

export function ArticleLinkedinClient({ reseauxConfigured }: Props) {
  const [article, setArticle] = useState('')
  const [ton, setTon] = useState('Pédagogique')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [trialExhausted, setTrialExhausted] = useState(false)
  const [generation, setGeneration] = useState<GenerationResult | null>(null)

  const wordCount = article.trim() ? article.trim().split(/\s+/).length : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setTrialExhausted(false)
    setLoading(true)

    try {
      const res = await fetch('/api/article-to-linkedin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article, ton }),
      })

      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }

      if (!res.ok) {
        if (data.trial_exhausted) setTrialExhausted(true)
        throw new Error((data.error as string) || `Erreur ${res.status}`)
      }

      setGeneration(data.generation as GenerationResult)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  // ── Résultat ──
  if (generation) {
    return (
      <div>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-green-600 font-semibold mb-1">✓ Génération terminée</p>
            <h1 className="text-2xl font-bold text-gray-900">Vos posts sont prêts</h1>
            <p className="text-sm text-gray-500 mt-1">
              Relisez, modifiez et publiez directement depuis cette page.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setGeneration(null); setArticle(''); setTon('Pédagogique') }}
              className="text-sm text-gray-500 hover:text-gray-700 border border-gray-300 hover:border-gray-400 px-4 py-2 rounded-lg transition-colors"
            >
              Nouvel article
            </button>
            <Link
              href={`/dashboard/contenu/${generation.id}`}
              className="text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-lg transition-colors"
            >
              Voir dans mes contenus →
            </Link>
          </div>
        </div>

        <GenerationDetail
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          generation={generation as any}
          reseauxConfigured={reseauxConfigured}
        />
      </div>
    )
  }

  // ── Formulaire ──
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Transformer un article en posts</h1>
        <p className="text-sm text-gray-500 mt-2">
          Collez votre article existant et Lexavo génère 3 posts optimisés pour vos réseaux sociaux et 3 images professionnelles au choix.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          {trialExhausted && (
            <Link href="/dashboard/parametres" className="flex-shrink-0 font-semibold underline">
              Voir les offres →
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

          {/* Textarea article */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Votre article
            </label>
            <textarea
              value={article}
              onChange={e => setArticle(e.target.value)}
              placeholder={"Collez votre article ici…\n(minimum 200 mots recommandés)"}
              rows={16}
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 resize-y leading-relaxed"
              required
            />
            <p className={`mt-1.5 text-xs ${wordCount > 0 && wordCount < 200 ? 'text-amber-600' : 'text-gray-400'}`}>
              {wordCount} mot{wordCount !== 1 ? 's' : ''}
              {wordCount > 0 && wordCount < 200 ? ' — 200 mots recommandés pour un meilleur résultat' : ''}
            </p>
          </div>

          {/* Select ton */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ton souhaité
            </label>
            <select
              value={ton}
              onChange={e => setTon(e.target.value)}
              className="w-full text-sm text-gray-700 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400 bg-white"
            >
              {TONS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !article.trim()}
          className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Lexavo génère votre contenu et vos 3 visuels…
            </span>
          ) : (
            'Générer mes posts'
          )}
        </button>
      </form>
    </div>
  )
}

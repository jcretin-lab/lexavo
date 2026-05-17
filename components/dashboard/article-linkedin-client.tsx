'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { GenerationDetail } from '@/components/dashboard/generation-detail'
import { ConfidentialiteBandeau } from '@/components/dashboard/confidentialite-bandeau'
import { PIIWarning } from '@/components/dashboard/pii-warning'
import { detectPII } from '@/lib/pii-detection'
import type { PostLinkedin, ImagesByStyle, FaqItem } from '@/types'

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
  faq?: FaqItem[] | null
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

  const [tab, setTab] = useState<'paste' | 'url'>('paste')
  const [url, setUrl] = useState('')
  const [fetchLoading, setFetchLoading] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [fetchSuccess, setFetchSuccess] = useState(false)
  const [piiConfirmed, setPiiConfirmed] = useState(false)

  const wordCount = article.trim() ? article.trim().split(/\s+/).length : 0
  const piiFindings = useMemo(() => detectPII(article), [article])
  const piiBlocked = piiFindings.length > 0 && !piiConfirmed

  function handleArticleChange(next: string) {
    setArticle(next)
    if (fetchSuccess) setFetchSuccess(false)
    if (piiConfirmed) setPiiConfirmed(false)
  }

  async function handleFetchUrl() {
    setFetchError(null)
    setFetchSuccess(false)

    const trimmed = url.trim()
    if (!trimmed || !/^https:\/\//i.test(trimmed)) {
      setFetchError('Entrez une URL valide commençant par https://')
      return
    }

    setFetchLoading(true)
    try {
      const res = await fetch('/api/fetch-article-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      })

      let data: { success?: boolean; texte?: string; error?: string } = {}
      try { data = await res.json() } catch { /* non-JSON */ }

      if (!res.ok || !data.success || !data.texte) {
        throw new Error(
          data.error ||
            'Impossible de récupérer cet article. Copiez-collez le texte manuellement.'
        )
      }

      setArticle(data.texte)
      setPiiConfirmed(false)
      setTab('paste')
      setFetchSuccess(true)
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error
          ? err.message
          : 'Impossible de récupérer cet article. Copiez-collez le texte manuellement.'
      )
    } finally {
      setFetchLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (piiBlocked) {
      setError('Confirmez l’anonymisation des informations détectées avant de générer.')
      return
    }
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
              onClick={() => {
                setGeneration(null)
                setArticle('')
                setTon('Pédagogique')
                setUrl('')
                setTab('paste')
                setFetchError(null)
                setFetchSuccess(false)
                setPiiConfirmed(false)
              }}
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
          Collez votre article existant et Lexavo génère 3 posts optimisés pour vos réseaux sociaux, une FAQ et 1 image professionnelle (ou la vôtre).
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

      <div className="mb-5">
        <ConfidentialiteBandeau />
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">

          {/* Onglets source */}
          <div className="flex gap-1 border-b border-gray-200 -mx-6 -mt-6 px-6 pt-1">
            <button
              type="button"
              onClick={() => { setTab('paste'); setFetchError(null) }}
              className={`text-sm font-semibold px-4 py-3 -mb-px border-b-2 transition-colors ${
                tab === 'paste'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Coller l&apos;article
            </button>
            <button
              type="button"
              onClick={() => { setTab('url'); setFetchSuccess(false) }}
              className={`text-sm font-semibold px-4 py-3 -mb-px border-b-2 transition-colors ${
                tab === 'url'
                  ? 'border-blue-700 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Entrer une URL
            </button>
          </div>

          {tab === 'paste' ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Votre article
              </label>
              {fetchSuccess && (
                <p className="mb-2 rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                  Article récupéré ✓ Vérifiez le contenu avant de générer.
                </p>
              )}
              <textarea
                value={article}
                onChange={e => handleArticleChange(e.target.value)}
                placeholder={"Collez votre article ici…\n(minimum 200 mots recommandés)"}
                rows={16}
                className="w-full text-sm text-gray-700 border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 resize-y leading-relaxed"
                required
              />
              <p className={`mt-1.5 text-xs ${wordCount > 0 && wordCount < 200 ? 'text-amber-600' : 'text-gray-400'}`}>
                {wordCount} mot{wordCount !== 1 ? 's' : ''}
                {wordCount > 0 && wordCount < 200 ? ' — 200 mots recommandés pour un meilleur résultat' : ''}
              </p>
              <PIIWarning
                findings={piiFindings}
                confirmed={piiConfirmed}
                onConfirmChange={setPiiConfirmed}
                fieldId="article"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                URL de votre article
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => { setUrl(e.target.value); setFetchError(null) }}
                  placeholder="https://votre-site.fr/article"
                  className="flex-1 text-sm text-gray-700 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400"
                  disabled={fetchLoading}
                />
                <button
                  type="button"
                  onClick={handleFetchUrl}
                  disabled={fetchLoading || !url.trim()}
                  className="text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {fetchLoading ? 'Récupération…' : 'Récupérer l’article →'}
                </button>
              </div>
              {fetchError && (
                <p className="mt-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {fetchError}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-400">
                Nous extrayons le texte de la page et le copions dans l&apos;onglet précédent pour relecture.
              </p>
            </div>
          )}

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
          disabled={loading || !article.trim() || piiBlocked}
          className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Lexavo génère votre contenu et votre visuel…
            </span>
          ) : (
            'Générer mes posts'
          )}
        </button>
      </form>
    </div>
  )
}

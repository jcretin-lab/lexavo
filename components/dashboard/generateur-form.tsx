'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import type { GenerationContent } from '@/types'
import { UpgradeModal } from './upgrade-modal'
import { CALENDLY_URL } from '@/lib/constants'

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

export function GenerateurForm({ cabinet }: Props) {
  const [specialite, setSpecialite] = useState(SPECIALITES_LISTE[0])
  const [theme, setTheme] = useState('')
  const [ton, setTon] = useState<string>('Pédagogique')
  const [datePublication, setDatePublication] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState<'trial' | 'quota'>('trial')
  const [result, setResult] = useState<{ generationId: string | null; content: GenerationContent; image_url: string | null } | null>(null)
  const [publishingIndex, setPublishingIndex] = useState<number | null>(null)
  const [publishedIndexes, setPublishedIndexes] = useState<Set<number>>(new Set())
  const [publishError, setPublishError] = useState('')
  const [activeTab, setActiveTab] = useState<'posts' | 'article' | 'faq'>('posts')
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const specialiteOptions = SPECIALITES_LISTE.map((s) => ({ value: s, label: s }))
  const tonOptions = TONS.map((t) => ({ value: t, label: t }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!theme.trim()) { setError('Veuillez saisir un thème.'); return }
    setError('')
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialite, theme, ton, date_publication: datePublication || null }),
      })
      const data = await res.json()
      if (res.status === 402 && data.trial_exhausted) {
        setUpgradeReason('trial')
        setShowUpgradeModal(true)
        return
      }
      if (res.status === 429) {
        setUpgradeReason('quota')
        setShowUpgradeModal(true)
        return
      }
      if (!res.ok) throw new Error(data.error || 'Erreur serveur')
      setPublishedIndexes(new Set())
      setPublishError('')
      setResult({ generationId: data.generation?.id ?? null, content: data.content, image_url: data.image_url })
      setActiveTab('posts')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  async function publierPost(post: { texte: string; hashtags: string[] }, index: number, scheduledDate?: string) {
    setPublishingIndex(index)
    setPublishError('')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation_id: result?.generationId,
          post_index: index,
          texte: post.texte,
          hashtags: post.hashtags,
          image_url: result?.image_url,
          scheduled_date: scheduledDate || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setPublishedIndexes(prev => new Set(prev).add(index))
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setPublishingIndex(null)
    }
  }

  function copyToClipboard(text: string, idx: number) {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <>
    <UpgradeModal
      open={showUpgradeModal}
      onClose={() => setShowUpgradeModal(false)}
      titre={upgradeReason === 'quota' ? 'Quota mensuel atteint' : undefined}
      message={upgradeReason === 'quota' ? 'Vous avez utilisé toutes vos générations ce mois-ci. Passez à un plan supérieur pour continuer.' : undefined}
    />
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {/* Formulaire */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
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
              onChange={(e) => setTheme(e.target.value)}
              placeholder="Ex : Les 5 erreurs à éviter lors d'un licenciement pour faute grave"
              required
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

          <Button type="submit" size="lg" className="w-full" loading={loading}>
            {loading ? 'Génération en cours…' : '✦ Générer le contenu'}
          </Button>

          {loading && (
            <p className="text-center text-xs text-gray-400">
              Cela prend environ 15-30 secondes. Ne fermez pas la page.
            </p>
          )}
        </form>
      </div>

      {/* Résultat */}
      <div>
        {!result && !loading && (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-10 flex flex-col items-center justify-center text-center h-full min-h-64">
            <div className="text-4xl mb-3">✦</div>
            <p className="text-gray-400 text-sm">Le contenu généré apparaîtra ici</p>
            <p className="text-gray-300 text-xs mt-1">Article · 3 posts pour vos réseaux · FAQ · Image</p>
          </div>
        )}

        {loading && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center justify-center text-center h-full min-h-64">
            <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium text-sm">Génération en cours…</p>
            <p className="text-gray-400 text-xs mt-1">Lexavo analyse votre thème et crée le contenu</p>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            {/* Image */}
            {result.image_url && (
              <div className="rounded-2xl overflow-hidden border border-gray-200">
                <Image
                  src={result.image_url}
                  alt="Illustration générée"
                  width={1792}
                  height={1024}
                  className="w-full h-48 object-cover"
                />
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                {(['posts', 'article', 'faq'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-700 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab === 'posts' ? 'Posts réseaux' : tab === 'article' ? 'Article' : 'FAQ'}
                  </button>
                ))}
              </div>

              <div className="p-5">
                {/* Posts réseaux sociaux */}
                {activeTab === 'posts' && (
                  <div className="space-y-4">
                    {publishError && (
                      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                        {publishError}
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="ml-2 font-semibold underline">Configurer →</a>
                      </div>
                    )}
                    {!cabinet.make_webhook_url && (
                      <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
                        Réseaux sociaux non configurés —{' '}
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="font-semibold underline">
                          Réserver un appel →
                        </a>
                      </div>
                    )}
                    {result.content.posts_linkedin.map((post, i) => (
                      <div key={i} className="rounded-xl border border-gray-200 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Post {i + 1}
                          </span>
                          <button
                            onClick={() => copyToClipboard(
                              post.texte + '\n\n' + post.hashtags.map(h => `#${h.replace('#', '')}`).join(' '),
                              i
                            )}
                            className="text-xs text-blue-700 hover:underline font-medium"
                          >
                            {copiedIndex === i ? '✓ Copié' : 'Copier'}
                          </button>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.texte}</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {post.hashtags.map((tag, j) => (
                            <span key={j} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              #{tag.replace('#', '')}
                            </span>
                          ))}
                        </div>
                        {!!cabinet.make_webhook_url && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                            {publishedIndexes.has(i) ? (
                              <span className="text-xs text-green-600 font-semibold">✓ Publié</span>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => publierPost(post, i)}
                                  loading={publishingIndex === i}
                                  className="text-xs"
                                >
                                  Publier
                                </Button>
                                <input
                                  type="datetime-local"
                                  min={new Date().toISOString().slice(0, 16)}
                                  className="text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-600 focus:outline-none focus:border-blue-400"
                                  onChange={(e) => {
                                    if (e.target.value) publierPost(post, i, new Date(e.target.value).toISOString())
                                  }}
                                  title="Programmer à une date"
                                  placeholder="Programmer…"
                                />
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Article */}
                {activeTab === 'article' && (
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">
                      {result.content.article_blog.titre}
                    </h3>
                    <p className="text-sm text-gray-500 italic mb-4">
                      {result.content.article_blog.meta_description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {result.content.article_blog.mots_cles.map((mc, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                          {mc}
                        </span>
                      ))}
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-700"
                      dangerouslySetInnerHTML={{ __html: result.content.article_blog.contenu }}
                    />
                  </div>
                )}

                {/* FAQ */}
                {activeTab === 'faq' && (
                  <div className="space-y-4">
                    {result.content.faq.map((item, i) => (
                      <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Q: {item.question}</p>
                        <p className="text-sm text-gray-600">{item.reponse}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <p className="text-xs text-gray-400">
                Contenu sauvegardé dans &quot;Mes contenus&quot; · Généré le {new Date().toLocaleDateString('fr-FR')}
              </p>
              {result.generationId && (
                <Link
                  href={`/dashboard/contenu/${result.generationId}`}
                  className="text-xs font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Ouvrir →
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  )
}

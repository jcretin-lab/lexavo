'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { ArticleBlog, PostLinkedin, FaqItem } from '@/types'

interface Generation {
  id: string
  theme: string
  specialite: string
  statut: string
  image_url?: string
  article_blog?: ArticleBlog
  posts_linkedin?: PostLinkedin[]
  faq?: FaqItem[]
  created_at: string
}

interface Props {
  generation: Generation
  plan: string
  facebookConnected: boolean
  linkedinConnected: boolean
}

type Reseau = 'facebook' | 'linkedin'

export function GenerationDetail({ generation, plan, facebookConnected, linkedinConnected }: Props) {
  const [tab, setTab] = useState<'facebook' | 'article' | 'faq'>('facebook')
  const [copied, setCopied] = useState<string | null>(null)

  const [posts, setPosts] = useState<PostLinkedin[]>(generation.posts_linkedin ?? [])

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set())
  const [saveError, setSaveError] = useState('')

  const [publishingIndex, setPublishingIndex] = useState<number | null>(null)
  const [successMessages, setSuccessMessages] = useState<Record<number, Reseau>>({})
  const [schedulingIndex, setSchedulingIndex] = useState<number | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [publishError, setPublishError] = useState('')

  function startScheduling(index: number) {
    setSchedulingIndex(index)
    setScheduleDate('')
  }

  function cancelScheduling() {
    setSchedulingIndex(null)
    setScheduleDate('')
  }

  const [selectedNetwork, setSelectedNetwork] = useState<Record<number, Reseau>>({})
  const canLinkedin = plan === 'pro' || plan === 'cabinet'

  const [downloading, setDownloading] = useState(false)

  function getNetwork(index: number): Reseau {
    const stored = selectedNetwork[index]
    if (stored) return stored
    // Réseau par défaut : le premier disponible
    if (facebookConnected) return 'facebook'
    if (linkedinConnected && canLinkedin) return 'linkedin'
    return 'facebook'
  }

  async function downloadImage() {
    if (!generation.image_url) return
    setDownloading(true)
    try {
      const res = await fetch(generation.image_url)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${generation.theme.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    } finally {
      setDownloading(false)
    }
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function startEdit(post: PostLinkedin, index: number) {
    setEditingIndex(index)
    setEditText(post.texte)
    setSaveError('')
  }

  function cancelEdit() {
    setEditingIndex(null)
    setEditText('')
    setSaveError('')
  }

  async function saveEdit(index: number) {
    setSavingIndex(index)
    setSaveError('')
    try {
      const res = await fetch('/api/content/update-post', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation_id: generation.id,
          post_index: index,
          texte: editText,
        }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)

      setPosts(prev => prev.map((p, i) => i === index ? { ...p, texte: editText } : p))
      setSavedIndexes(prev => new Set(prev).add(index))
      setEditingIndex(null)
      setEditText('')
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSavingIndex(null)
    }
  }

  async function publier(post: PostLinkedin, index: number, scheduledDate?: string) {
    const reseau = getNetwork(index)
    setPublishingIndex(index)
    setPublishError('')
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation_id: generation.id,
          post_index: index,
          texte: post.texte,
          hashtags: post.hashtags,
          image_url: generation.image_url ?? null,
          scheduled_date: scheduledDate ?? null,
          reseau,
        }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)

      setSuccessMessages(prev => ({ ...prev, [index]: reseau }))
      setTimeout(() => {
        setSuccessMessages(prev => {
          const next = { ...prev }
          delete next[index]
          return next
        })
      }, 3000)
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setPublishingIndex(null)
      setSchedulingIndex(null)
    }
  }

  const canPublish = facebookConnected || (linkedinConnected && canLinkedin)

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Link href="/dashboard/contenu" className="text-sm text-gray-400 hover:text-gray-600 mb-2 inline-block">
            ← Mes contenus
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{generation.theme}</h1>
          <p className="text-sm text-gray-500 mt-1">{generation.specialite}</p>
        </div>
        <span className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-full font-medium mt-1 ${
          generation.statut === 'publie' ? 'bg-green-100 text-green-700' :
          generation.statut === 'programme' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {generation.statut}
        </span>
      </div>

      {/* Image */}
      {generation.image_url && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200">
          <Image
            src={generation.image_url}
            alt={generation.article_blog?.alt_image ?? generation.theme}
            width={1792}
            height={1024}
            className="w-full h-56 object-cover"
          />
        </div>
      )}

      {/* Alerte aucun réseau connecté */}
      {!canPublish && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-amber-700">
            Connectez {canLinkedin ? 'Facebook ou LinkedIn' : 'votre page Facebook'} pour publier ces posts.
          </p>
          <Link href="/dashboard/reseaux" className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0">
            Configurer →
          </Link>
        </div>
      )}

      {publishError && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {publishError}
        </div>
      )}

      {saveError && (
        <div className="mb-5 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {saveError}
        </div>
      )}

      {/* Onglets */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {(['facebook', 'article', 'faq'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t ? 'border-b-2 border-blue-700 text-blue-700 bg-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'facebook' ? 'Posts Facebook' : t === 'article' ? 'Article de blog' : 'FAQ'}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── POSTS ── */}
          {tab === 'facebook' && (
            <div className="space-y-5">
              {posts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Aucun post généré.</p>
              )}
              {posts.map((post, i) => {
                const isEditing = editingIndex === i
                const isSaved = savedIndexes.has(i)
                const successReseau = successMessages[i]
                const isPublishing = publishingIndex === i
                const isScheduling = schedulingIndex === i
                const network = getNetwork(i)

                const ANGLES = [
                  { label: '🎓 Pédagogique — expliquer un concept', color: 'bg-violet-50 text-violet-700' },
                  { label: '💼 Cas pratique — situation concrète',   color: 'bg-amber-50 text-amber-700' },
                  { label: '💡 Conseil — tip actionnable',           color: 'bg-emerald-50 text-emerald-700' },
                ]
                const angle = ANGLES[i]

                return (
                  <div key={i} className="rounded-xl border border-gray-200 p-4">
                    {angle && (
                      <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${angle.color}`}>
                        {angle.label}
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Post {i + 1}</span>
                      <div className="flex items-center gap-2">
                        {isSaved && !isEditing && (
                          <span className="text-xs text-green-600 font-medium">✓ Sauvegardé</span>
                        )}
                        {!isEditing && (
                          <button
                            onClick={() => copy(
                              post.texte + '\n\n' + post.hashtags.map(h => `#${h.replace('#', '')}`).join(' '),
                              `post-${i}`
                            )}
                            className="text-xs text-blue-700 hover:underline font-medium"
                          >
                            {copied === `post-${i}` ? '✓ Copié' : 'Copier'}
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <textarea
                          value={editText}
                          onChange={e => setEditText(e.target.value)}
                          rows={8}
                          className="w-full text-sm text-gray-700 border border-blue-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-y"
                          autoFocus
                        />
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => saveEdit(i)}
                            disabled={savingIndex === i || !editText.trim()}
                            className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {savingIndex === i ? 'Sauvegarde…' : 'Sauvegarder'}
                          </button>
                          <button
                            onClick={cancelEdit}
                            disabled={savingIndex === i}
                            className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors disabled:opacity-50"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.texte}</p>

                        <div className="mt-3 flex flex-wrap gap-1">
                          {post.hashtags.map((tag, j) => (
                            <span key={j} className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                              #{tag.replace('#', '')}
                            </span>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100">
                          {successReseau ? (
                            <span className="text-xs font-semibold text-green-600">
                              ✓ Envoyé sur {successReseau === 'facebook' ? 'Facebook' : 'LinkedIn'}
                            </span>
                          ) : (
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Sélecteur de réseau */}
                              {canPublish && (
                                <div className="flex items-center gap-1.5 w-full mb-1">
                                  <span className="text-xs text-gray-400">Publier sur :</span>
                                  {facebookConnected ? (
                                    <button
                                      onClick={() => setSelectedNetwork(prev => ({ ...prev, [i]: 'facebook' }))}
                                      className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                                        network === 'facebook'
                                          ? 'bg-[#1877F2] border-[#1877F2] text-white'
                                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                      }`}
                                    >
                                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                      Facebook
                                    </button>
                                  ) : (
                                    <div className="relative group">
                                      <button
                                        disabled
                                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-300 cursor-not-allowed"
                                      >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        Facebook
                                      </button>
                                      <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-10 w-48 bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 pointer-events-none">
                                        Connectez Facebook depuis Réseaux sociaux
                                      </div>
                                    </div>
                                  )}
                                  {canLinkedin ? (
                                    linkedinConnected ? (
                                      <button
                                        onClick={() => setSelectedNetwork(prev => ({ ...prev, [i]: 'linkedin' }))}
                                        className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors ${
                                          network === 'linkedin'
                                            ? 'bg-[#0A66C2] border-[#0A66C2] text-white'
                                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                      >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        LinkedIn
                                      </button>
                                    ) : (
                                      <div className="relative group">
                                        <button
                                          disabled
                                          className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-300 cursor-not-allowed"
                                        >
                                          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                          LinkedIn
                                        </button>
                                        <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-10 w-48 bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 pointer-events-none">
                                          Connectez LinkedIn depuis Réseaux sociaux
                                        </div>
                                      </div>
                                    )
                                  ) : (
                                    <div className="relative group">
                                      <button
                                        disabled
                                        className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 text-gray-300 cursor-not-allowed"
                                      >
                                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                                        LinkedIn
                                      </button>
                                      <div className="absolute bottom-full left-0 mb-1.5 hidden group-hover:block z-10 w-52 bg-gray-800 text-white text-xs rounded-lg px-2.5 py-1.5 pointer-events-none">
                                        Disponible à partir du plan Actif
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              <button
                                onClick={() => startEdit(post, i)}
                                className="text-xs font-medium text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors"
                              >
                                Modifier
                              </button>
                              {canPublish && (
                                <>
                                  <button
                                    onClick={() => publier(post, i)}
                                    disabled={isPublishing}
                                    className={`text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                                      network === 'linkedin'
                                        ? 'bg-[#0A66C2] hover:bg-[#084e96]'
                                        : 'bg-[#1877F2] hover:bg-[#0d65d9]'
                                    }`}
                                  >
                                    {isPublishing && !isScheduling ? 'Envoi…' : 'Publier maintenant'}
                                  </button>
                                  {isScheduling ? (
                                    <div className="flex items-center gap-2">
                                      <input
                                        type="datetime-local"
                                        value={scheduleDate}
                                        min={new Date().toISOString().slice(0, 16)}
                                        autoFocus
                                        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
                                        onChange={e => setScheduleDate(e.target.value)}
                                      />
                                      <button
                                        onClick={() => {
                                          if (scheduleDate) {
                                            publier(post, i, new Date(scheduleDate).toISOString())
                                          }
                                        }}
                                        disabled={isPublishing || !scheduleDate}
                                        className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                      >
                                        {isPublishing ? 'Envoi…' : 'Programmer'}
                                      </button>
                                      <button
                                        onClick={cancelScheduling}
                                        disabled={isPublishing}
                                        className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-40"
                                      >
                                        Annuler
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => startScheduling(i)}
                                      disabled={isPublishing}
                                      className="text-xs font-semibold text-gray-600 border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      Programmer
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── ARTICLE ── */}
          {tab === 'article' && generation.article_blog && (
            <div>
              {generation.image_url && (
                <div className="mb-5">
                  <button
                    onClick={downloadImage}
                    disabled={downloading}
                    className="text-xs font-medium text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {downloading ? 'Téléchargement…' : '↓ Télécharger l\'image'}
                  </button>
                </div>
              )}
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="text-xl font-bold text-gray-900">{generation.article_blog.titre}</h2>
                <button
                  onClick={() => copy(
                    generation.article_blog!.titre + '\n\n' +
                    generation.article_blog!.meta_description + '\n\n' +
                    generation.article_blog!.contenu.replace(/<[^>]+>/g, '') + '\n\n' +
                    'Mots-clés : ' + generation.article_blog!.mots_cles.join(', '),
                    'article'
                  )}
                  className="flex-shrink-0 text-xs text-blue-700 hover:underline font-medium"
                >
                  {copied === 'article' ? '✓ Copié' : 'Copier tout'}
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                {generation.article_blog.reading_time && (
                  <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium">
                    ⏱ {generation.article_blog.reading_time} min de lecture
                  </span>
                )}
                {generation.article_blog.slug && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                    /{generation.article_blog.slug}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 italic mb-4">{generation.article_blog.meta_description}</p>

              <div className="flex flex-wrap gap-2 mb-5">
                {generation.article_blog.mots_cles.map((mc, i) => (
                  <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{mc}</span>
                ))}
              </div>

              <div
                className="article-content"
                dangerouslySetInnerHTML={{ __html: generation.article_blog.contenu }}
              />

              {generation.article_blog.alt_image && (
                <div className="mt-5 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-0.5">Texte alternatif image (balise alt)</p>
                  <p className="text-xs text-gray-700">{generation.article_blog.alt_image}</p>
                </div>
              )}
            </div>
          )}

          {/* ── FAQ ── */}
          {tab === 'faq' && (
            <div className="space-y-4">
              {(generation.faq ?? []).map((item, i) => (
                <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-gray-800">Q : {item.question}</p>
                    <button
                      onClick={() => copy(`Q : ${item.question}\nR : ${item.reponse}`, `faq-${i}`)}
                      className="flex-shrink-0 text-xs text-blue-700 hover:underline font-medium"
                    >
                      {copied === `faq-${i}` ? '✓ Copié' : 'Copier'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{item.reponse}</p>
                </div>
              ))}
            </div>
          )}

          <p className="mt-6 text-xs text-gray-400 italic">
            Ce contenu est généré par IA et doit être relu avant publication. Vous êtes responsable de l&apos;exactitude juridique de vos publications.
          </p>

        </div>
      </div>
    </div>
  )
}

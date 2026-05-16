'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  type ArticleBlog,
  type PostLinkedin,
  type FaqItem,
  type ImagesByStyle,
  type ImageStyle,
  IMAGE_STYLE_LABELS,
  IMAGE_STYLE_ORDER,
} from '@/types'
import { CALENDLY_URL } from '@/lib/constants'

interface Generation {
  id: string
  theme: string
  specialite: string
  statut: string
  image_url?: string | null
  images?: ImagesByStyle | null
  image_selectionnee?: string | null
  article_blog?: ArticleBlog
  posts_linkedin?: PostLinkedin[]
  faq?: FaqItem[]
  created_at: string
}

interface Props {
  generation: Generation
  reseauxConfigured: boolean
}

function pickDefaultImage(g: Generation): string | null {
  if (g.image_selectionnee) return g.image_selectionnee
  if (g.images?.conceptuelle) return g.images.conceptuelle
  if (g.images?.personnalisee) return g.images.personnalisee
  return g.image_url ?? null
}

export function GenerationDetail({ generation, reseauxConfigured }: Props) {
  const [tab, setTab] = useState<'posts' | 'article' | 'faq'>('posts')
  const [copied, setCopied] = useState<string | null>(null)

  const [posts, setPosts] = useState<PostLinkedin[]>(generation.posts_linkedin ?? [])
  const [selectedImage, setSelectedImage] = useState<string | null>(pickDefaultImage(generation))

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [editTags, setEditTags] = useState('')
  const [savingIndex, setSavingIndex] = useState<number | null>(null)
  const [savedIndexes, setSavedIndexes] = useState<Set<number>>(new Set())
  const [saveError, setSaveError] = useState('')

  const [publishingIndex, setPublishingIndex] = useState<number | null>(null)
  const [successIndexes, setSuccessIndexes] = useState<Set<number>>(new Set())
  const [failedIndexes, setFailedIndexes] = useState<Set<number>>(new Set())
  const [schedulingIndex, setSchedulingIndex] = useState<number | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [publishError, setPublishError] = useState('')

  const [images, setImages] = useState<ImagesByStyle | null>(generation.images ?? null)
  const hasImages = !!images && Object.values(images).some(Boolean)
  const fallbackImage = !hasImages ? (generation.image_url ?? null) : null

  const [persistingSelection, setPersistingSelection] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [pickError, setPickError] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setUploadError('')
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setUploadError('Format invalide (PNG, JPG ou WEBP uniquement)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Fichier trop volumineux (5 Mo max)')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('generation_id', generation.id)
      formData.append('file', file)
      const res = await fetch('/api/content/upload-image', { method: 'POST', body: formData })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch {}
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)
      const url = data.url as string
      const nextImages = data.images as ImagesByStyle
      setImages(nextImages)
      setSelectedImage(url)
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  async function selectImage(url: string) {
    if (url === selectedImage) return
    setSelectedImage(url)
    setPickError('')
    setPersistingSelection(true)
    try {
      const res = await fetch('/api/content/select-image', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation_id: generation.id, image_url: url }),
      })
      if (!res.ok) {
        let data: Record<string, unknown> = {}
        try { data = await res.json() } catch {}
        throw new Error((data.error as string) || `Erreur ${res.status}`)
      }
    } catch (err: unknown) {
      setPickError(err instanceof Error ? err.message : 'Erreur lors de la sélection')
    } finally {
      setPersistingSelection(false)
    }
  }

  async function downloadSelected() {
    if (!selectedImage) return
    setDownloading(true)
    try {
      const res = await fetch(selectedImage)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const slug = (generation.theme || 'visuel').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      a.download = `${slug}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    } finally {
      setDownloading(false)
    }
  }

  function startScheduling(index: number) {
    setSchedulingIndex(index)
    setScheduleDate('')
  }

  function cancelScheduling() {
    setSchedulingIndex(null)
    setScheduleDate('')
  }

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  function startEdit(post: PostLinkedin, index: number) {
    setEditingIndex(index)
    setEditText(post.texte)
    setEditTags(post.hashtags.map(h => h.replace(/^#+/, '')).join(' '))
    setSaveError('')
  }

  function cancelEdit() {
    setEditingIndex(null)
    setEditText('')
    setEditTags('')
    setSaveError('')
  }

  function parseTagsInput(raw: string): string[] {
    return raw
      .split(/[\s,]+/)
      .map(t => t.replace(/^#+/, '').trim())
      .filter(t => t.length > 0)
      .slice(0, 10)
  }

  async function saveEdit(index: number) {
    setSavingIndex(index)
    setSaveError('')
    const nextHashtags = parseTagsInput(editTags)
    try {
      const res = await fetch('/api/content/update-post', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation_id: generation.id,
          post_index: index,
          texte: editText,
          hashtags: nextHashtags,
        }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)

      setPosts(prev => prev.map((p, i) => i === index ? { ...p, texte: editText, hashtags: nextHashtags } : p))
      setSavedIndexes(prev => new Set(prev).add(index))
      setEditingIndex(null)
      setEditText('')
      setEditTags('')
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSavingIndex(null)
    }
  }

  async function publier(post: PostLinkedin, index: number, scheduledDate?: string) {
    setPublishingIndex(index)
    setPublishError('')
    // En cas de retry, on retire l'index des échecs précédents le temps de l'appel.
    setFailedIndexes(prev => {
      if (!prev.has(index)) return prev
      const next = new Set(prev)
      next.delete(index)
      return next
    })
    try {
      const res = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generation_id: generation.id,
          post_index: index,
          texte: post.texte,
          hashtags: post.hashtags,
          image_url: selectedImage ?? generation.images?.conceptuelle ?? generation.image_url ?? null,
          scheduled_date: scheduledDate ?? null,
        }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)

      setSuccessIndexes(prev => new Set(prev).add(index))
      setTimeout(() => {
        setSuccessIndexes(prev => {
          const next = new Set(prev)
          next.delete(index)
          return next
        })
      }, 3000)
    } catch (err: unknown) {
      setPublishError(err instanceof Error ? err.message : "Erreur lors de l'envoi")
      setFailedIndexes(prev => new Set(prev).add(index))
    } finally {
      setPublishingIndex(null)
      setSchedulingIndex(null)
    }
  }

  return (
    <div>
      {/* Lien retour */}
      <Link href="/dashboard/contenu" className="text-sm text-gray-400 hover:text-gray-600 mb-4 inline-block">
        ← Mes contenus
      </Link>

      {/* Header : à gauche le nom du droit + le titre + statut, à droite l'image générée + tuile upload */}
      <div className={`mb-8 grid grid-cols-1 ${(hasImages || fallbackImage) ? 'md:grid-cols-2' : ''} gap-6 items-start`}>
        <div>
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-widest mb-3">
            {generation.specialite}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">
            {generation.theme}
          </h1>
          <span className={`inline-block text-xs px-2.5 py-1 rounded-full font-medium ${
            generation.statut === 'publie' ? 'bg-green-100 text-green-700' :
            generation.statut === 'programme' ? 'bg-blue-100 text-blue-700' :
            'bg-gray-100 text-gray-500'
          }`}>
            {generation.statut}
          </span>
        </div>

        {hasImages && images ? (
          <div>
            <div className="flex items-center justify-between mb-2 gap-3">
              <p className="text-xs font-semibold text-gray-600">Choisissez votre image</p>
              {persistingSelection && (
                <span className="text-[11px] text-gray-400">Enregistrement…</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {IMAGE_STYLE_ORDER.map((style: ImageStyle) => {
                const url = images[style]
                if (!url) return null
                const isSelected = url === selectedImage
                return (
                  <button
                    key={style}
                    type="button"
                    onClick={() => selectImage(url)}
                    className={`group flex flex-col rounded-xl overflow-hidden border-2 transition-all bg-white ${
                      isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="relative w-full aspect-[16/9] bg-gray-100">
                      <Image
                        src={url}
                        alt={`${IMAGE_STYLE_LABELS[style]} — ${generation.theme}`}
                        fill
                        sizes="(max-width: 768px) 33vw, 16vw"
                        className="object-cover"
                      />
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow">
                          ✓
                        </span>
                      )}
                    </div>
                    <span
                      className={`block text-[10px] py-1 text-center font-medium truncate ${
                        isSelected ? 'text-blue-700 bg-blue-50' : 'text-gray-600 bg-gray-50'
                      }`}
                    >
                      {IMAGE_STYLE_LABELS[style]}
                    </span>
                  </button>
                )
              })}

              {/* Tuile upload utilisateur : soit miniature si deja uploadee, soit bouton d'upload. */}
              {(() => {
                const persoUrl = images.personnalisee ?? null
                const isSelected = !!persoUrl && persoUrl === selectedImage
                if (persoUrl) {
                  return (
                    <div
                      className={`group relative flex flex-col rounded-xl overflow-hidden border-2 transition-all bg-white ${
                        isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => selectImage(persoUrl)}
                        className="flex flex-col w-full"
                      >
                        <div className="relative w-full aspect-[16/9] bg-gray-100">
                          <Image
                            src={persoUrl}
                            alt={`${IMAGE_STYLE_LABELS.personnalisee} — ${generation.theme}`}
                            fill
                            sizes="(max-width: 768px) 33vw, 16vw"
                            className="object-cover"
                          />
                          {isSelected && (
                            <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow">
                              ✓
                            </span>
                          )}
                        </div>
                        <span
                          className={`block text-[10px] py-1 text-center font-medium truncate ${
                            isSelected ? 'text-blue-700 bg-blue-50' : 'text-gray-600 bg-gray-50'
                          }`}
                        >
                          {IMAGE_STYLE_LABELS.personnalisee}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute top-1.5 left-1.5 text-[10px] font-medium bg-white/90 hover:bg-white text-gray-700 px-1.5 py-0.5 rounded shadow border border-gray-200 disabled:opacity-60"
                      >
                        {uploading ? '…' : 'Remplacer'}
                      </button>
                    </div>
                  )
                }
                return (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="group flex flex-col rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-all bg-gray-50 hover:bg-blue-50/40 disabled:opacity-60 disabled:cursor-wait"
                  >
                    <div className="relative w-full aspect-[16/9] flex items-center justify-center text-gray-400 group-hover:text-blue-500">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-xl leading-none">{uploading ? '…' : '+'}</span>
                        <span className="text-[10px] font-medium">
                          {uploading ? 'Upload…' : 'Uploader la mienne'}
                        </span>
                      </div>
                    </div>
                    <span className="block text-[10px] py-1 text-center font-medium truncate text-gray-500 bg-gray-100">
                      {IMAGE_STYLE_LABELS.personnalisee}
                    </span>
                  </button>
                )
              })()}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
            <p className="mt-1.5 text-[11px] text-gray-400">
              Format recommandé : 16:9 (ex. 1536×1024) — PNG, JPG ou WEBP, 5 Mo max.
            </p>
            {pickError && (
              <p className="mt-2 text-[11px] text-red-600">{pickError}</p>
            )}
            {uploadError && (
              <p className="mt-2 text-[11px] text-red-600">{uploadError}</p>
            )}
            {selectedImage && (
              <div className="mt-2 text-right">
                <button
                  onClick={downloadSelected}
                  disabled={downloading}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 underline disabled:opacity-50"
                >
                  {downloading ? 'Téléchargement…' : '↓ Télécharger l\'image sélectionnée'}
                </button>
              </div>
            )}
          </div>
        ) : fallbackImage ? (
          <div className="rounded-2xl overflow-hidden border border-gray-200">
            <Image
              src={fallbackImage}
              alt={generation.article_blog?.alt_image ?? generation.theme}
              width={1792}
              height={1024}
              className="w-full h-auto block"
            />
          </div>
        ) : null}
      </div>

      {/* Alerte aucun réseau configuré */}
      {!reseauxConfigured && (
        <div className="mb-5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-amber-700">
            Activez la publication automatique sur vos réseaux sociaux (LinkedIn et Facebook) en réservant un appel gratuit.
          </p>
          <a
            href={CALENDLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0 whitespace-nowrap"
          >
            Réserver →
          </a>
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
          {(['posts', 'article', 'faq'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                tab === t ? 'border-b-2 border-blue-700 text-blue-700 bg-white' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'posts' ? 'Posts réseaux' : t === 'article' ? 'Article de blog' : 'FAQ'}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── POSTS ── */}
          {tab === 'posts' && (
            <div className="space-y-5">
              {posts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-8">Aucun post généré.</p>
              )}
              {posts.map((post, i) => {
                const isEditing = editingIndex === i
                const isSaved = savedIndexes.has(i)
                const isSuccess = successIndexes.has(i)
                const isFailed = failedIndexes.has(i)
                const isPublishing = publishingIndex === i
                const isScheduling = schedulingIndex === i

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
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                            Hashtags
                          </label>
                          <input
                            type="text"
                            value={editTags}
                            onChange={e => setEditTags(e.target.value)}
                            placeholder="droit, avocat, ..."
                            className="w-full text-sm text-gray-700 border border-blue-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                          />
                          <p className="mt-1 text-[11px] text-gray-400">
                            Séparez par des espaces ou des virgules. Le « # » est ajouté automatiquement. 10 max.
                          </p>
                        </div>
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
                          {isSuccess ? (
                            <span className="text-xs font-semibold text-green-600">✓ Publié</span>
                          ) : (
                            <>
                              <div className="flex flex-wrap items-center gap-2">
                                <button
                                  onClick={() => startEdit(post, i)}
                                  className="text-xs font-medium text-gray-600 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 px-2.5 py-1.5 rounded-lg transition-colors"
                                >
                                  Modifier
                                </button>
                                {reseauxConfigured && (
                                  <>
                                    <button
                                      onClick={() => publier(post, i)}
                                      disabled={isPublishing}
                                      className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      {isPublishing && !isScheduling ? 'Envoi…' : 'Publier'}
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

                              {isFailed && !isPublishing && (
                                <p className="mt-2 text-xs font-medium text-red-600">
                                  Publication échouée, vérifier la connexion sur Make.
                                </p>
                              )}
                            </>
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

'use client'

import Image from 'next/image'
import { useState } from 'react'
import {
  type ImagesByStyle,
  type ImageStyle,
  IMAGE_STYLE_LABELS,
  IMAGE_STYLE_ORDER,
} from '@/types'

interface Props {
  generationId: string
  images: ImagesByStyle
  selected: string | null
  onSelectedChange: (url: string) => void
  themeForFilename?: string
  persistOnSelect?: boolean
}

export function ImagePicker({
  generationId,
  images,
  selected,
  onSelectedChange,
  themeForFilename,
  persistOnSelect = true,
}: Props) {
  const [downloading, setDownloading] = useState(false)
  const [persisting, setPersisting] = useState(false)
  const [error, setError] = useState('')

  const available: Array<{ style: ImageStyle; url: string }> = IMAGE_STYLE_ORDER
    .map((style) => ({ style, url: (images?.[style] ?? null) as string | null }))
    .filter((entry): entry is { style: ImageStyle; url: string } => !!entry.url)

  if (available.length === 0) return null

  async function select(url: string) {
    if (url === selected) return
    onSelectedChange(url)
    if (!persistOnSelect) return
    setPersisting(true)
    setError('')
    try {
      const res = await fetch('/api/content/select-image', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generation_id: generationId, image_url: url }),
      })
      if (!res.ok) {
        let data: Record<string, unknown> = {}
        try { data = await res.json() } catch {}
        throw new Error((data.error as string) || `Erreur ${res.status}`)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sélection')
    } finally {
      setPersisting(false)
    }
  }

  async function download() {
    if (!selected) return
    setDownloading(true)
    try {
      const res = await fetch(selected)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const slug = (themeForFilename || 'visuel').replace(/[^a-z0-9]/gi, '-').toLowerCase()
      a.download = `${slug}.png`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // silently fail
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
      <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
        <p className="text-sm font-semibold text-gray-700">Choisissez votre image</p>
        {persisting && (
          <span className="text-xs text-gray-400">Enregistrement…</span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {available.map(({ style, url }) => {
          const isSelected = url === selected
          return (
            <button
              key={style}
              type="button"
              onClick={() => select(url)}
              className={`group flex flex-col gap-2 rounded-xl overflow-hidden border-2 transition-all bg-white ${
                isSelected ? 'border-blue-600 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="relative w-full aspect-[16/9] bg-gray-100">
                <Image
                  src={url}
                  alt={IMAGE_STYLE_LABELS[style]}
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
                {isSelected && (
                  <span className="absolute top-2 right-2 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold shadow">
                    ✓
                  </span>
                )}
              </div>
              <span
                className={`mb-2 mx-auto text-xs font-medium px-2.5 py-1 rounded-full ${
                  isSelected ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {IMAGE_STYLE_LABELS[style]}
              </span>
            </button>
          )
        })}
      </div>

      {error && <p className="mt-3 text-xs text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end">
        <button
          onClick={download}
          disabled={downloading || !selected}
          className="text-xs font-medium text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {downloading ? 'Téléchargement…' : '↓ Télécharger l\'image sélectionnée'}
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

type Generation = {
  id: string
  theme: string
  specialite: string | null
  statut: string
  image_url: string | null
  created_at: string
}

export function ContenuListItem({ gen }: { gen: Generation }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (deleting) return
    const ok = confirm(
      "Supprimer cet article ainsi que les posts programmés liés ?\n\nLes posts déjà publiés sur vos réseaux ne seront pas dépubliés."
    )
    if (!ok) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/content/${gen.id}`, { method: 'DELETE' })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        alert(json.error ?? 'Erreur lors de la suppression.')
        setDeleting(false)
        return
      }
      router.refresh()
    } catch {
      alert('Erreur lors de la suppression.')
      setDeleting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between hover:border-blue-300 hover:shadow-sm transition-all group">
      <Link
        href={`/dashboard/contenu/${gen.id}`}
        className="flex items-center gap-4 flex-1 min-w-0"
      >
        {gen.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={gen.image_url} alt="" className="w-16 h-10 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">
            {gen.theme}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {gen.specialite} · {format(new Date(gen.created_at), 'd MMM yyyy', { locale: fr })}
          </p>
        </div>
      </Link>
      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
        <span
          className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            gen.statut === 'publie'
              ? 'bg-green-100 text-green-700'
              : gen.statut === 'programme'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {gen.statut}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-label="Supprimer cet article"
          title="Supprimer"
          className="p-1.5 rounded-lg text-gray-300 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M3 6h18" />
            <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
        <Link
          href={`/dashboard/contenu/${gen.id}`}
          aria-hidden
          tabIndex={-1}
          className="text-gray-300 group-hover:text-blue-400 transition-colors text-lg"
        >
          →
        </Link>
      </div>
    </div>
  )
}

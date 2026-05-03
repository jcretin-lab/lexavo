'use client'

import { useState } from 'react'
import { format, addMonths, subMonths } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CalendrierPost {
  id: string
  contenu: string
  date_programmee: string
  statut: 'en_attente' | 'publie'
  image_url?: string | null
  generation_id?: string | null
}

interface Props {
  posts: CalendrierPost[]
  linkedinConnected: boolean
}

type ModalMode = 'view' | 'edit' | 'changeDate' | 'confirmDelete'

function buildCalendarDays(date: Date): (Date | null)[] {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  // Lundi = 0 dans notre grille (JS: 0=dim, 1=lun … 6=sam)
  const firstDow = (firstDay.getDay() + 6) % 7
  const days: (Date | null)[] = []
  for (let i = 0; i < firstDow; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function CalendrierView({ posts: initialPosts, linkedinConnected }: Props) {
  const [posts, setPosts] = useState<CalendrierPost[]>(initialPosts)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedPost, setSelectedPost] = useState<CalendrierPost | null>(null)
  const [modalMode, setModalMode] = useState<ModalMode>('view')
  const [editText, setEditText] = useState('')
  const [editDate, setEditDate] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [actionError, setActionError] = useState('')

  const calendarDays = buildCalendarDays(currentDate)
  const DAY_HEADERS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

  function openModal(post: CalendrierPost) {
    setSelectedPost(post)
    setModalMode('view')
    setActionError('')
  }

  function closeModal() {
    if (saving || deleting || publishing) return
    setSelectedPost(null)
    setModalMode('view')
    setEditText('')
    setEditDate('')
    setActionError('')
  }

  function enterEdit() {
    if (!selectedPost) return
    setEditText(selectedPost.contenu)
    setModalMode('edit')
    setActionError('')
  }

  function enterChangeDate() {
    if (!selectedPost) return
    setEditDate(format(new Date(selectedPost.date_programmee), "yyyy-MM-dd'T'HH:mm"))
    setModalMode('changeDate')
    setActionError('')
  }

  async function saveText() {
    if (!selectedPost || !editText.trim()) return
    setSaving(true)
    setActionError('')
    try {
      const res = await fetch(`/api/calendrier/${selectedPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenu: editText }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, contenu: editText } : p))
      setSelectedPost(prev => prev ? { ...prev, contenu: editText } : null)
      setModalMode('view')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function saveDate() {
    if (!selectedPost || !editDate) return
    setSaving(true)
    setActionError('')
    try {
      const isoDate = new Date(editDate).toISOString()
      const res = await fetch(`/api/calendrier/${selectedPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date_programmee: isoDate }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, date_programmee: isoDate } : p))
      setSelectedPost(prev => prev ? { ...prev, date_programmee: isoDate } : null)
      setModalMode('view')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  async function deletePost() {
    if (!selectedPost) return
    setDeleting(true)
    setActionError('')
    try {
      const res = await fetch(`/api/calendrier/${selectedPost.id}`, { method: 'DELETE' })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)
      setPosts(prev => prev.filter(p => p.id !== selectedPost.id))
      closeModal()
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  async function publishNow() {
    if (!selectedPost) return
    setPublishing(true)
    setActionError('')
    try {
      const res = await fetch(`/api/calendrier/${selectedPost.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publish: true }),
      })
      let data: Record<string, unknown> = {}
      try { data = await res.json() } catch { /* non-JSON */ }
      if (!res.ok) throw new Error((data.error as string) || `Erreur ${res.status}`)
      setPosts(prev => prev.map(p => p.id === selectedPost.id ? { ...p, statut: 'publie' } : p))
      setSelectedPost(prev => prev ? { ...prev, statut: 'publie' } : null)
      setModalMode('view')
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erreur lors de la publication')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div>
      {/* Alerte Facebook */}
      {!linkedinConnected && (
        <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-800">Facebook non connecté</p>
            <p className="text-xs text-amber-600 mt-0.5">Connectez votre page Facebook pour programmer vos posts.</p>
          </div>
          <a href="/dashboard/reseaux" className="text-xs font-semibold text-amber-700 hover:underline flex-shrink-0">
            Configurer →
          </a>
        </div>
      )}

      {/* Navigation mois */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentDate(d => subMonths(d, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Mois précédent"
        >
          ←
        </button>
        <h2 className="text-base font-semibold text-gray-900 capitalize">
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button
          onClick={() => setCurrentDate(d => addMonths(d, 1))}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      {/* Grille calendrier */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {/* En-têtes jours */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {DAY_HEADERS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Cellules */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, idx) => {
            const dayPosts = day
              ? posts.filter(p => sameDay(new Date(p.date_programmee), day))
              : []
            const isToday = day ? sameDay(day, new Date()) : false
            const isCurrentMonth = day?.getMonth() === currentDate.getMonth()

            return (
              <div
                key={idx}
                className={`min-h-[80px] p-1.5 border-b border-r border-gray-100 ${
                  idx % 7 === 6 ? 'border-r-0' : ''
                } ${Math.floor(idx / 7) === Math.floor((calendarDays.length - 1) / 7) ? 'border-b-0' : ''}`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-medium block mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                      isToday ? 'bg-blue-700 text-white' :
                      isCurrentMonth ? 'text-gray-700' : 'text-gray-300'
                    }`}>
                      {day.getDate()}
                    </span>
                    <div className="space-y-0.5">
                      {dayPosts.map(post => (
                        <button
                          key={post.id}
                          onClick={() => openModal(post)}
                          className={`w-full text-left text-xs px-1.5 py-0.5 rounded truncate font-medium transition-opacity hover:opacity-80 ${
                            post.statut === 'publie'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {post.contenu.slice(0, 30)}…
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Légende */}
      <div className="flex items-center gap-4 mt-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-orange-100 border border-orange-200 inline-block" />
          Programmé
        </span>
        <span className="flex items-center gap-1.5 text-xs text-gray-500">
          <span className="w-3 h-3 rounded-sm bg-green-100 border border-green-200 inline-block" />
          Publié
        </span>
      </div>

      {/* Modale */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            {/* Header modale */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  selectedPost.statut === 'publie'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedPost.statut === 'publie' ? '✓ Publié' : '⏳ Programmé'}
                </span>
                <p className="text-xs text-gray-400 mt-1.5">
                  {selectedPost.statut === 'en_attente' ? 'Prévu le ' : 'Publié le '}
                  {format(new Date(selectedPost.date_programmee), "d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none flex-shrink-0"
              >
                ×
              </button>
            </div>

            {/* Erreur */}
            {actionError && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                {actionError}
              </div>
            )}

            {/* Contenu selon le mode */}
            {modalMode === 'view' && (
              <>
                <p className="text-sm text-gray-700 whitespace-pre-wrap mb-5 max-h-48 overflow-y-auto">
                  {selectedPost.contenu}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={enterEdit}
                    className="text-xs font-semibold text-gray-700 border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Modifier
                  </button>
                  {selectedPost.statut === 'en_attente' && (
                    <button
                      onClick={enterChangeDate}
                      className="text-xs font-semibold text-gray-700 border border-gray-300 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Changer la date
                    </button>
                  )}
                  {selectedPost.statut === 'en_attente' && linkedinConnected && (
                    <button
                      onClick={publishNow}
                      disabled={publishing}
                      className="text-xs font-semibold text-white bg-[#1877F2] hover:bg-[#0d65d9] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {publishing ? 'Envoi…' : 'Publier maintenant'}
                    </button>
                  )}
                  <button
                    onClick={() => { setModalMode('confirmDelete'); setActionError('') }}
                    className="text-xs font-semibold text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors ml-auto"
                  >
                    Supprimer
                  </button>
                </div>
              </>
            )}

            {modalMode === 'edit' && (
              <>
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={8}
                  className="w-full text-sm text-gray-700 border border-blue-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500 resize-y mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveText}
                    disabled={saving || !editText.trim()}
                    className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={() => setModalMode('view')}
                    disabled={saving}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}

            {modalMode === 'changeDate' && (
              <>
                <p className="text-sm text-gray-600 mb-3">Choisissez la nouvelle date et heure de publication :</p>
                <input
                  type="datetime-local"
                  value={editDate}
                  min={format(new Date(), "yyyy-MM-dd'T'HH:mm")}
                  onChange={e => setEditDate(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveDate}
                    disabled={saving || !editDate}
                    className="text-xs font-semibold text-white bg-blue-700 hover:bg-blue-800 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Sauvegarde…' : 'Confirmer'}
                  </button>
                  <button
                    onClick={() => setModalMode('view')}
                    disabled={saving}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}

            {modalMode === 'confirmDelete' && (
              <>
                <p className="text-sm text-gray-700 mb-4">
                  Êtes-vous sûr de vouloir supprimer ce post du calendrier ? Cette action est irréversible.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={deletePost}
                    disabled={deleting}
                    className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {deleting ? 'Suppression…' : 'Supprimer'}
                  </button>
                  <button
                    onClick={() => setModalMode('view')}
                    disabled={deleting}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

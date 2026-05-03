'use client'

import { useState } from 'react'

export function ContactForm() {
  const [form, setForm] = useState({
    nom: '',
    email: '',
    cabinet: '',
    sujet: 'Question générale',
    message: '',
    privacy: false,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setSuccess(true)
      setForm({ nom: '', email: '', cabinet: '', sujet: 'Question générale', message: '', privacy: false })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl bg-green-50 border border-green-200 p-8 text-center">
        <p className="text-green-800 font-semibold text-lg mb-1">Message envoyé !</p>
        <p className="text-green-700 text-sm">Votre message a bien été envoyé. Nous vous répondrons sous 24h ouvrées.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1.5">Nom et prénom <span className="text-red-500">*</span></label>
          <input
            id="nom"
            name="nom"
            type="text"
            required
            value={form.nom}
            onChange={handleChange}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400"
            placeholder="Jean Dupont"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">Email <span className="text-red-500">*</span></label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full text-sm text-gray-900 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400"
            placeholder="jean@cabinet.fr"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cabinet" className="block text-sm font-medium text-gray-700 mb-1.5">Nom du cabinet <span className="text-gray-400 font-normal">(optionnel)</span></label>
        <input
          id="cabinet"
          name="cabinet"
          type="text"
          value={form.cabinet}
          onChange={handleChange}
          className="w-full text-sm text-gray-900 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400"
          placeholder="Cabinet Dupont & Associés"
        />
      </div>

      <div>
        <label htmlFor="sujet" className="block text-sm font-medium text-gray-700 mb-1.5">Sujet <span className="text-red-500">*</span></label>
        <select
          id="sujet"
          name="sujet"
          value={form.sujet}
          onChange={handleChange}
          className="w-full text-sm text-gray-900 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400 bg-white"
        >
          <option>Question générale</option>
          <option>Problème technique</option>
          <option>Facturation</option>
          <option>Partenariat</option>
          <option>Autre</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={form.message}
          onChange={handleChange}
          className="w-full text-sm text-gray-900 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-400 resize-none"
          placeholder="Votre message..."
        />
      </div>

      <div className="flex items-start gap-3">
        <input
          id="privacy"
          name="privacy"
          type="checkbox"
          required
          checked={form.privacy}
          onChange={handleChange}
          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="privacy" className="text-sm text-gray-600">
          J&apos;accepte la{' '}
          <a href="/politique-confidentialite" className="text-blue-600 hover:underline" target="_blank">politique de confidentialité</a>
          {' '}<span className="text-red-500">*</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-8 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Envoi en cours…' : 'Envoyer le message'}
      </button>
    </form>
  )
}

'use client'

import Link from 'next/link'
import { useState } from 'react'

type ForfaitOption = { id: string; nom: string }

function Facultatif() {
  return <span className="lx-champ__facultatif">facultatif</span>
}

export function ContactForm({ forfaitInitial = '', forfaits }: { forfaitInitial?: string; forfaits: ForfaitOption[] }) {
  const vide = { nom: '', email: '', cabinet: '', forfait: forfaitInitial, siteActuel: '', message: '', privacy: false }
  const [form, setForm] = useState(vide)
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
      setForm(vide)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "La demande n'a pas pu être envoyée. Réessayez ou écrivez-nous directement.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="lx-envoye" role="status">
        <p className="lx-envoye__titre">Demande envoyée.</p>
        <p>Merci. Nous revenons vers vous sous 48 h ouvrées pour convenir d&apos;un échange.</p>
        <Link href="/" className="lx-btn lx-btn--ligne">Retour à l&apos;accueil</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="lx-form">
      {error && <div className="lx-form__erreur" role="alert">{error}</div>}

      <div className="lx-form__duo">
        <div className="lx-champ">
          <label htmlFor="nom">Nom et prénom</label>
          <input id="nom" name="nom" type="text" required autoComplete="name" value={form.nom} onChange={handleChange} placeholder="Jean Dupont" />
          <span className="lx-champ__trait" />
        </div>
        <div className="lx-champ">
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" value={form.email} onChange={handleChange} placeholder="jean@cabinet.fr" />
          <span className="lx-champ__trait" />
        </div>
      </div>

      <div className="lx-champ">
        <label htmlFor="cabinet">Nom du cabinet <Facultatif /></label>
        <input id="cabinet" name="cabinet" type="text" autoComplete="organization" value={form.cabinet} onChange={handleChange} placeholder="Cabinet Dupont & Associés" />
        <span className="lx-champ__trait" />
      </div>

      <div className="lx-form__duo">
        <div className="lx-champ">
          <label htmlFor="forfait">Forfait envisagé</label>
          <select id="forfait" name="forfait" value={form.forfait} onChange={handleChange}>
            <option value="">Je ne sais pas encore</option>
            {forfaits.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
          <span className="lx-champ__trait" />
        </div>
        <div className="lx-champ">
          <label htmlFor="siteActuel">Site actuel <Facultatif /></label>
          <input id="siteActuel" name="siteActuel" type="text" autoComplete="url" value={form.siteActuel} onChange={handleChange} placeholder="www.cabinet-dupont.fr" />
          <span className="lx-champ__trait" />
        </div>
      </div>

      <div className="lx-champ">
        <label htmlFor="message">Votre projet</label>
        <textarea id="message" name="message" required rows={6} value={form.message} onChange={handleChange} placeholder="Votre barreau, vos domaines d'intervention, ce que vous attendez du site, un délai souhaité…" />
        <span className="lx-champ__trait" />
      </div>

      <label className="lx-form__accord" htmlFor="privacy">
        <input id="privacy" name="privacy" type="checkbox" required checked={form.privacy} onChange={handleChange} />
        <span>
          J&apos;accepte la <a href="/politique-confidentialite" target="_blank">politique de confidentialité</a>.
        </span>
      </label>

      <div className="lx-form__actions">
        <button type="submit" disabled={loading} className="lx-btn lx-btn--robe">
          {loading ? 'Envoi en cours…' : 'Envoyer ma demande'}
          {!loading && <span className="lx-btn__trait" aria-hidden="true" />}
        </button>
        <p className="lx-form__note">Réponse sous 48 h ouvrées.</p>
      </div>
    </form>
  )
}

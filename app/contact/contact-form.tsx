'use client'

import { useState } from 'react'

const NAVY = '#0F2247'
const INK  = '#0F0E0C'
const MID  = '#6E6860'
const RULE = '#D0CBC0'
const GOLD = '#B8872A'

const inputStyle = {
  width: '100%',
  fontSize: '0.875rem',
  color: INK,
  border: `1px solid ${RULE}`,
  borderRadius: 0,
  padding: '0.625rem 0.875rem',
  background: '#FAF8F3',
  outline: 'none',
  fontFamily: 'inherit',
}

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-jetbrains-mono)',
  fontSize: '10px',
  letterSpacing: '0.15em',
  color: MID,
  marginBottom: '0.5rem',
}

type ForfaitOption = { id: string; nom: string }

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
      setError(err instanceof Error ? err.message : "Erreur lors de l'envoi")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ border: `1px solid ${GOLD}`, padding: '2rem', textAlign: 'center' }}>
        <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', fontStyle: 'italic', color: INK, marginBottom: '0.5rem' }}>Demande envoyée.</p>
        <p style={{ fontSize: '0.875rem', color: MID }}>Nous revenons vers vous sous 48 h ouvrées.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div style={{ border: '1px solid #d97070', padding: '0.75rem 1rem', fontSize: '0.875rem', color: '#7a2020' }}>{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="nom" style={labelStyle}>NOM ET PRÉNOM <span style={{ color: GOLD }}>*</span></label>
          <input id="nom" name="nom" type="text" required value={form.nom} onChange={handleChange} style={inputStyle} placeholder="Jean Dupont" />
        </div>
        <div>
          <label htmlFor="email" style={labelStyle}>EMAIL <span style={{ color: GOLD }}>*</span></label>
          <input id="email" name="email" type="email" required value={form.email} onChange={handleChange} style={inputStyle} placeholder="jean@cabinet.fr" />
        </div>
      </div>

      <div>
        <label htmlFor="cabinet" style={labelStyle}>NOM DU CABINET <span style={{ color: RULE }}>— OPTIONNEL</span></label>
        <input id="cabinet" name="cabinet" type="text" value={form.cabinet} onChange={handleChange} style={inputStyle} placeholder="Cabinet Dupont & Associés" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="forfait" style={labelStyle}>FORFAIT ENVISAGÉ</label>
          <select id="forfait" name="forfait" value={form.forfait} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
            <option value="">Je ne sais pas encore</option>
            {forfaits.map((f) => (
              <option key={f.id} value={f.id}>{f.nom}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="siteActuel" style={labelStyle}>SITE ACTUEL <span style={{ color: RULE }}>— OPTIONNEL</span></label>
          <input id="siteActuel" name="siteActuel" type="text" value={form.siteActuel} onChange={handleChange} style={inputStyle} placeholder="www.cabinet-dupont.fr" />
        </div>
      </div>

      <div>
        <label htmlFor="message" style={labelStyle}>VOTRE PROJET <span style={{ color: GOLD }}>*</span></label>
        <textarea id="message" name="message" required rows={5} value={form.message} onChange={handleChange} style={{ ...inputStyle, resize: 'none' }} placeholder="Votre barreau, vos domaines d'intervention, ce que vous attendez du site, un délai souhaité…" />
      </div>

      <div className="flex items-start gap-3">
        <input id="privacy" name="privacy" type="checkbox" required checked={form.privacy} onChange={handleChange} style={{ marginTop: '0.125rem', accentColor: NAVY, width: '16px', height: '16px', flexShrink: 0 }} />
        <label htmlFor="privacy" style={{ fontSize: '0.8125rem', color: MID }}>
          J&apos;accepte la{' '}
          <a href="/politique-confidentialite" style={{ color: GOLD, textDecoration: 'none' }} className="hover:underline" target="_blank">politique de confidentialité</a>
          {' '}<span style={{ color: GOLD }}>*</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          padding: '0.75rem 2rem',
          background: loading ? MID : NAVY,
          color: '#F3EFE5',
          fontFamily: 'var(--font-jetbrains-mono)',
          fontSize: '11px',
          letterSpacing: '0.15em',
          border: 'none',
          borderRadius: 0,
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {loading ? 'ENVOI EN COURS…' : 'ENVOYER MA DEMANDE'}
      </button>
    </form>
  )
}

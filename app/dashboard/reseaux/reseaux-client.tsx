'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Props {
  plan: string
  fbWebhook: string
  fbPageUrl: string
  liWebhook: string
  fbActive: boolean
}

function Badge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--success-50)', color: 'var(--success)', border: '1px solid #cfe6da' }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
        Actif ✓
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'var(--ink-100)', color: 'var(--ink-500)', border: '1px solid var(--ink-200)' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ink-400)' }} />
      Non configuré
    </span>
  )
}

interface WebhookCardProps {
  title: string
  logo: React.ReactNode
  guideHref: string
  webhookValue: string
  isActive: boolean
  locked?: boolean
  lockedMessage?: string
  onSave: (url: string) => Promise<void>
  onEdit: () => void
  isEditing: boolean
}

function WebhookCard({ title, logo, guideHref, webhookValue, isActive, locked, lockedMessage, onSave, onEdit, isEditing }: WebhookCardProps) {
  const [inputValue, setInputValue] = useState(webhookValue)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setError('')
    if (!inputValue.startsWith('https://')) {
      setError("L'URL doit commencer par https://")
      return
    }
    setSaving(true)
    try {
      await onSave(inputValue)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl p-6 flex flex-col gap-5" style={{
      background: locked ? 'var(--ink-50)' : 'var(--white)',
      border: `1px solid ${locked ? 'var(--ink-200)' : 'var(--ink-200)'}`,
      opacity: locked ? 0.7 : 1,
    }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logo}
          <span className="font-semibold" style={{ color: 'var(--ink-900)', fontSize: '0.9375rem' }}>{title}</span>
        </div>
        <Badge active={isActive && !locked} />
      </div>

      {locked ? (
        <div className="rounded-lg px-4 py-3" style={{ background: 'var(--ocre-50)', border: '1px solid var(--ocre-100)' }}>
          <p className="text-sm" style={{ color: 'var(--ocre-900)' }}>{lockedMessage}</p>
          <Link href="/dashboard/parametres" className="text-xs font-medium mt-1 inline-block hover:underline" style={{ color: 'var(--ocre-700)' }}>
            Voir les plans →
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm" style={{ color: 'var(--ink-500)' }}>
            Connectez votre page {title} pour publier automatiquement.
          </p>

          <Link
            href={guideHref}
            target="_blank"
            className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{ background: 'var(--navy-700)', color: 'var(--white)' }}
          >
            Voir le guide (5 min) →
          </Link>

          <div className="space-y-2">
            <label className="block text-xs font-medium" style={{ color: 'var(--ink-700)' }}>
              URL webhook Make.com {title}
            </label>

            {isActive && !isEditing ? (
              <div className="space-y-1.5">
                <div className="w-full px-3 py-2.5 rounded-lg text-sm truncate" style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-200)', color: 'var(--ink-500)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '12px' }}>
                  {webhookValue}
                </div>
                <button onClick={onEdit} className="text-xs hover:underline" style={{ color: 'var(--ink-400)' }}>
                  Modifier
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="url"
                  value={inputValue}
                  onChange={e => { setInputValue(e.target.value); setError('') }}
                  placeholder="https://hook.make.com/..."
                  className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                  style={{
                    border: `1px solid ${error ? 'var(--error)' : 'var(--ink-200)'}`,
                    background: 'var(--white)',
                    color: 'var(--ink-900)',
                    fontFamily: 'var(--font-jetbrains-mono)',
                    fontSize: '12px',
                    boxShadow: error ? '0 0 0 3px var(--error-50)' : undefined,
                  }}
                  onFocus={e => { if (!error) e.target.style.boxShadow = '0 0 0 3px var(--navy-100)'; e.target.style.borderColor = 'var(--navy-700)' }}
                  onBlur={e => { if (!error) { e.target.style.boxShadow = ''; e.target.style.borderColor = 'var(--ink-200)' } }}
                />
                {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
                <button
                  onClick={handleSave}
                  disabled={saving || !inputValue}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  style={{ background: 'var(--navy-700)', color: 'var(--white)' }}
                >
                  {saving ? 'Enregistrement…' : 'Enregistrer'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// C3 — Carte Facebook avec champ URL de page séparé
interface FacebookCardProps {
  webhookValue: string
  pageUrl: string
  isActive: boolean
  isEditing: boolean
  onSave: (webhookUrl: string, pageUrl: string) => Promise<void>
  onEdit: () => void
}

function FacebookCard({ webhookValue, pageUrl, isActive, isEditing, onSave, onEdit }: FacebookCardProps) {
  const [webhookInput, setWebhookInput] = useState(webhookValue)
  const [pageInput, setPageInput] = useState(pageUrl)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setError('')
    if (!webhookInput.startsWith('https://')) {
      setError("L'URL webhook doit commencer par https://")
      return
    }
    if (!pageInput.startsWith('https://')) {
      setError("L'URL de votre page Facebook doit commencer par https://")
      return
    }
    setSaving(true)
    try {
      await onSave(webhookInput, pageInput)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erreur lors de l\'enregistrement. Réessayez.')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = (hasError: boolean) => ({
    border: `1px solid ${hasError ? 'var(--error)' : 'var(--ink-200)'}`,
    background: 'var(--white)',
    color: 'var(--ink-900)',
    fontFamily: 'var(--font-jetbrains-mono)',
    fontSize: '12px',
    boxShadow: hasError ? '0 0 0 3px var(--error-50)' : undefined,
  })

  return (
    <div className="rounded-xl p-6 flex flex-col gap-5" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FacebookLogo />
          <span className="font-semibold" style={{ color: 'var(--ink-900)', fontSize: '0.9375rem' }}>Facebook</span>
        </div>
        <Badge active={isActive} />
      </div>

      <p className="text-sm" style={{ color: 'var(--ink-500)' }}>
        Connectez votre page Facebook pour publier automatiquement.
      </p>

      <Link
        href="/guide-facebook"
        target="_blank"
        className="inline-flex items-center gap-2 self-start px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        style={{ background: 'var(--navy-700)', color: 'var(--white)' }}
      >
        Voir le guide (5 min) →
      </Link>

      {isActive && !isEditing ? (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-700)' }}>URL webhook Make.com</p>
            <div className="w-full px-3 py-2.5 rounded-lg text-sm truncate" style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-200)', color: 'var(--ink-500)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '12px' }}>
              {webhookValue}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--ink-700)' }}>Page Facebook</p>
            <div className="w-full px-3 py-2.5 rounded-lg text-sm truncate" style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-200)', color: 'var(--ink-500)', fontFamily: 'var(--font-jetbrains-mono)', fontSize: '12px' }}>
              {pageUrl}
            </div>
          </div>
          <button onClick={onEdit} className="text-xs hover:underline" style={{ color: 'var(--ink-400)' }}>
            Modifier
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-700)' }}>
              URL webhook Make.com Facebook
            </label>
            <input
              type="url"
              value={webhookInput}
              onChange={e => { setWebhookInput(e.target.value); setError('') }}
              placeholder="https://hook.make.com/..."
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={inputStyle(false)}
              onFocus={e => { e.target.style.boxShadow = '0 0 0 3px var(--navy-100)'; e.target.style.borderColor = 'var(--navy-700)' }}
              onBlur={e => { e.target.style.boxShadow = ''; e.target.style.borderColor = 'var(--ink-200)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: 'var(--ink-700)' }}>
              URL de votre page Facebook
            </label>
            <input
              type="url"
              value={pageInput}
              onChange={e => { setPageInput(e.target.value); setError('') }}
              placeholder="https://www.facebook.com/votre-cabinet"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={inputStyle(false)}
              onFocus={e => { e.target.style.boxShadow = '0 0 0 3px var(--navy-100)'; e.target.style.borderColor = 'var(--navy-700)' }}
              onBlur={e => { e.target.style.boxShadow = ''; e.target.style.borderColor = 'var(--ink-200)' }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--ink-400)' }}>
              Ex : https://www.facebook.com/cabinetdupont
            </p>
          </div>
          {error && <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>}
          <button
            onClick={handleSave}
            disabled={saving || !webhookInput || !pageInput}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            style={{ background: 'var(--navy-700)', color: 'var(--white)' }}
          >
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      )}
    </div>
  )
}

const FacebookLogo = () => (
  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#1877F2' }}>
    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  </div>
)

const LinkedinLogo = ({ locked }: { locked: boolean }) => (
  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: locked ? 'var(--ink-300)' : '#0A66C2' }}>
    <svg viewBox="0 0 24 24" fill="white" className="w-5 h-5">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  </div>
)

export function ReseauxClient({ plan, fbWebhook, fbPageUrl, liWebhook, fbActive }: Props) {
  const canLinkedin = plan === 'pro' || plan === 'cabinet'

  const [fbWebhookState, setFbWebhookState] = useState(fbWebhook)
  const [fbPageState, setFbPageState] = useState(fbPageUrl)
  const [liWebhookState, setLiWebhookState] = useState(liWebhook)
  const [fbActiveState, setFbActiveState] = useState(fbActive)
  const [liActiveState, setLiActiveState] = useState(!!liWebhook)
  const [fbEditing, setFbEditing] = useState(!fbActive)
  const [liEditing, setLiEditing] = useState(!liWebhook)

  async function saveFacebook(webhookUrl: string, pageUrl: string) {
    const res = await fetch('/api/update-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reseau: 'facebook', url: webhookUrl, facebook_page_url: pageUrl }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erreur serveur.')
    }
    setFbWebhookState(webhookUrl)
    setFbPageState(pageUrl)
    setFbActiveState(true)
    setFbEditing(false)
  }

  async function saveLinkedin(url: string) {
    const res = await fetch('/api/update-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reseau: 'linkedin', url }),
    })
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Erreur serveur.')
    }
    setLiWebhookState(url)
    setLiActiveState(true)
    setLiEditing(false)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-1" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.875rem', color: 'var(--ink-900)', letterSpacing: '-0.015em' }}>
          Activer la publication automatique
        </h1>
        <p className="text-sm" style={{ color: 'var(--ink-500)' }}>
          Collez ici l&apos;URL de votre scénario Make.com pour chaque réseau.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl">
        <FacebookCard
          webhookValue={fbWebhookState}
          pageUrl={fbPageState}
          isActive={fbActiveState}
          isEditing={fbEditing}
          onSave={saveFacebook}
          onEdit={() => setFbEditing(true)}
        />

        <WebhookCard
          title="LinkedIn"
          logo={<LinkedinLogo locked={!canLinkedin} />}
          guideHref="/guide-linkedin"
          webhookValue={liWebhookState}
          isActive={liActiveState}
          isEditing={liEditing}
          onSave={saveLinkedin}
          onEdit={() => setLiEditing(true)}
          locked={!canLinkedin}
          lockedMessage="Disponible à partir du plan Actif (69 €/mois)."
        />
      </div>
    </div>
  )
}

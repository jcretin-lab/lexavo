import { LoginForm } from './login-form'

type Mode = 'login' | 'signup' | 'reset'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; invite?: string; email?: string }>
}) {
  const { mode: modeParam, invite, email } = await searchParams

  let initialMode: Mode = 'login'
  if (invite || modeParam === 'signup') {
    initialMode = 'signup'
  } else if (modeParam === 'reset') {
    initialMode = 'reset'
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20" style={{ background: 'var(--paper)' }}>
      {/* Barre de menu fixe en haut, alignee sur l'onboarding et le dashboard */}
      <header
        className="fixed top-0 left-0 right-0 z-30 h-14 flex items-center px-4"
        style={{ background: 'var(--navy-900)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <svg width="18" height="18" viewBox="0 0 17 17" fill="none" style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>
            <rect x="1" y="1" width="15" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3.5 16L6 12.5H1L3.5 16Z" fill="currentColor" />
          </svg>
          <span style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.375rem', fontWeight: 600, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
          </span>
        </div>
      </header>

      <div className="w-full max-w-md">
        {/* Sous-titre */}
        <div className="text-center mb-10">
          <p className="text-sm" style={{ color: 'var(--ink-500)' }}>Publiez facilement pour faire entendre votre droit.</p>
        </div>

        <LoginForm
          key={`${initialMode}|${invite ?? ''}`}
          initialMode={initialMode}
          initialEmail={email ? decodeURIComponent(email) : ''}
          inviteId={invite ?? null}
        />

        <p className="mt-6 text-center text-xs" style={{ color: 'var(--ink-400)' }}>
          Conforme au décret du 12 juillet 2005 et au RIN du barreau
        </p>
      </div>
    </div>
  )
}

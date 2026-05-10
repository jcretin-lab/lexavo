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
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--paper)' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="mb-1" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '2.25rem', color: 'var(--navy-700)', letterSpacing: '-0.02em' }}>
            Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--ink-500)' }}>Publiez facilement pour faire entendre votre droit.</p>
        </div>

        <LoginForm
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

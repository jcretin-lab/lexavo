import Link from 'next/link'

const NAVY  = '#0F2247'
const PAPER = '#F3EFE5'
const GOLD  = '#B8872A'

export function LandingNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{ background: NAVY, borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 17 17" fill="none" style={{ color: 'rgba(243,239,229,0.5)', flexShrink: 0 }}>
            <rect x="1" y="1" width="15" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M3.5 16L6 12.5H1L3.5 16Z" fill="currentColor"/>
          </svg>
          <Link href="/" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: PAPER, letterSpacing: '-0.02em', textDecoration: 'none' }}>
            Lex<em>avo</em><span style={{ color: GOLD }}>.</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-8" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)' }}>
          <Link href="/#fonctionnalites" className="hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>FONCTIONNALITÉS</Link>
          <Link href="/#tarifs" className="hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>TARIFS</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login" className="ed-cta-outlined" style={{ padding: '0.375rem 0.75rem', fontSize: '0.6875rem' }}>
            Se connecter
          </Link>
        </div>
      </div>
    </nav>
  )
}

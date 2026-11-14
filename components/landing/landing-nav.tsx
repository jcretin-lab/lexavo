import Link from 'next/link'

const PAPER = '#F3EFE5'
const GOLD  = '#B8872A'

export function LandingNav() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(15,34,71,0.72)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="max-w-6xl mx-auto px-6 h-12 flex items-center justify-between">
        <Link href="/" style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: PAPER, letterSpacing: '-0.02em', textDecoration: 'none' }}>
          Lex<em>avo</em><span style={{ color: GOLD }}>.</span>
        </Link>

        <div className="hidden md:flex items-center gap-8" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.85)' }}>
          <Link href="/#methode" className="hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>MÉTHODE</Link>
          <Link href="/#deontologie" className="hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>DÉONTOLOGIE</Link>
          <Link href="/#tarifs" className="hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>FORFAITS</Link>
          <Link href="/#faq" className="hover:text-white transition-colors" style={{ color: 'inherit', textDecoration: 'none' }}>FAQ</Link>
        </div>

        <Link href="/contact" className="landing-nav-cta">
          Demander un devis
        </Link>
      </div>
    </nav>
  )
}

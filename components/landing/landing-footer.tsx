import Link from 'next/link'

const NAVY  = '#0F2247'
const PAPER = '#F3EFE5'
const GOLD  = '#B8872A'

export function LandingFooter() {
  return (
    <footer style={{ background: NAVY, padding: '2.5rem 1.5rem' }}>
      <div
        className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start justify-between gap-10"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: PAPER, letterSpacing: '-0.02em' }}>
            Lex<em>avo</em><span style={{ color: GOLD }}>.</span>
          </span>
          <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: PAPER, lineHeight: 1.2, letterSpacing: '-0.015em' }}>
            Publiez facilement pour faire entendre<br />
            <em>votre droit</em><span style={{ color: GOLD }}>.</span>
          </p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, maxWidth: '22rem' }}>
            La plateforme de communication digitale conçue pour les cabinets d&apos;avocats français.
          </p>
        </div>

        <div className="flex flex-wrap gap-6" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.85)' }}>
          <Link href="/mentions-legales" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>MENTIONS LÉGALES</Link>
          <Link href="/cgv" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>CGV</Link>
          <Link href="/politique-confidentialite" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>CONFIDENTIALITÉ</Link>
          <Link href="/contact" className="hover:text-white transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>CONTACT</Link>
        </div>

        <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.4)' }}>
          © 2026 LEXAVO
        </p>
      </div>
    </footer>
  )
}

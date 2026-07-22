export function RainingLettersBg() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Photo de fond */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        opacity: 0.85,
      }} />
      {/* Dégradé de lisibilité */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: [
          'linear-gradient(to right, rgba(15,14,12,0.45) 0%, rgba(15,14,12,0.18) 55%, rgba(15,14,12,0.30) 100%)',
          'linear-gradient(to bottom, rgba(15,14,12,0.18) 0%, rgba(15,14,12,0.05) 45%, rgba(15,14,12,0.28) 100%)',
        ].join(', '),
      }} />
    </div>
  )
}

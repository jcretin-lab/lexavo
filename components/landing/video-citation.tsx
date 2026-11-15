'use client'

import { useEffect, useRef, useState } from 'react'

// Vidéo d'ambiance (bureau d'avocat de nuit, générée par IA) avec la citation par-dessus.
// Règles : muette, bouton pause, arrêtée hors écran, image fixe en mouvement réduit.
export function VideoCitation({ src, poster }: { src: string; poster: string }) {
  const video = useRef<HTMLVideoElement>(null)
  const section = useRef<HTMLElement>(null)
  const [lecture, setLecture] = useState(true)
  const voulue = useRef(true) // choix du visiteur (pause manuelle)

  useEffect(() => {
    const v = video.current
    const s = section.current
    if (!v || !s) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      voulue.current = false
      v.pause()
      const t = window.setTimeout(() => setLecture(false), 0)
      return () => window.clearTimeout(t)
    }
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && voulue.current) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.2 })
    obs.observe(s)
    return () => obs.disconnect()
  }, [])

  const basculer = () => {
    const v = video.current
    if (!v) return
    if (v.paused) { voulue.current = true; v.play().catch(() => {}); setLecture(true) }
    else { voulue.current = false; v.pause(); setLecture(false) }
  }

  return (
    <section ref={section} className="lx-video" aria-label="Citation">
      <video ref={video} className="lx-video__media" src={src} poster={poster} muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="lx-video__voile" aria-hidden="true" />
      <div className="lx-wrap lx-video__contenu">
        <blockquote className="lx-reveal">
          <p>La compétence se prouve au cabinet. La confiance commence en ligne.</p>
          <span className="lx-video__filet" aria-hidden="true" />
        </blockquote>
      </div>
      <button type="button" className="lx-video__bouton" onClick={basculer} aria-label={lecture ? 'Mettre la vidéo en pause' : 'Lire la vidéo'}>
        {lecture ? <svg viewBox="0 0 16 16" aria-hidden><rect x="4" y="3" width="3" height="10" /><rect x="9" y="3" width="3" height="10" /></svg>
          : <svg viewBox="0 0 16 16" aria-hidden><path d="M5 3l8 5-8 5z" /></svg>}
      </button>
    </section>
  )
}

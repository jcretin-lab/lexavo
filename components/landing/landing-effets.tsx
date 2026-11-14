'use client'

import { useEffect } from 'react'

// Tous les effets de la landing, en un seul composant sans rendu :
// - navigation opaque dès qu'on a défilé (html[data-scrolled])
// - apparition unique des éléments .lx-reveal / .lx-reveal-image / .lx-etapes li
// - parallaxe des images [data-parallax]
// - vitrine : l'étape au centre de l'écran choisit la page affichée dans le cadre
export function LandingEffets() {
  useEffect(() => {
    const html = document.documentElement
    const reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Apparitions
    const apparition = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            apparition.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
    )
    document.querySelectorAll('.lx-reveal, .lx-reveal-image, .lx-etapes li').forEach((el) => apparition.observe(el))

    // Vitrine
    const etapes = Array.from(document.querySelectorAll<HTMLElement>('[data-etape]'))
    const pages = Array.from(document.querySelectorAll<HTMLElement>('[data-page]'))
    const activer = (index: string) => {
      etapes.forEach((el) => el.classList.toggle('is-active', el.dataset.etape === index))
      pages.forEach((el) => el.classList.toggle('is-active', el.dataset.page === index))
    }
    const vitrine = new IntersectionObserver(
      (entrees) => {
        entrees.forEach((e) => {
          if (e.isIntersecting) activer((e.target as HTMLElement).dataset.etape ?? '0')
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    etapes.forEach((el) => vitrine.observe(el))

    // Défilement : navigation + parallaxe
    const parallaxes = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    let enAttente = false
    const auDefilement = () => {
      if (enAttente) return
      enAttente = true
      requestAnimationFrame(() => {
        html.dataset.scrolled = window.scrollY > 40 ? 'true' : 'false'
        if (!reduit) {
          const h = window.innerHeight
          parallaxes.forEach((el) => {
            const parent = el.parentElement
            if (!parent) return
            const r = parent.getBoundingClientRect()
            if (r.bottom < 0 || r.top > h) return
            const progression = (r.top + r.height / 2 - h / 2) / h // -1 … 1 environ
            const vitesse = Number(el.dataset.parallax) || 0.15
            el.style.transform = `translate3d(0, ${(-progression * vitesse * 100).toFixed(2)}%, 0)`
          })
        }
        enAttente = false
      })
    }
    auDefilement()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auDefilement)

    return () => {
      apparition.disconnect()
      vitrine.disconnect()
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auDefilement)
      delete html.dataset.scrolled
    }
  }, [])

  return null
}

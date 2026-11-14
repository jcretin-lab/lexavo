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

    // Hero : le halo du « plan » suit la souris, avec un léger retard (souris uniquement)
    const hero = document.querySelector<HTMLElement>('.lx-hero')
    const plan = document.querySelector<HTMLElement>('.lx-hero__plan')
    let suivreHalo: ((e: PointerEvent) => void) | null = null
    let rafHalo = 0
    if (hero && plan && !reduit && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      let cx = 0, cy = 0, tx = 0, ty = 0, actif = false
      const boucle = () => {
        cx += (tx - cx) * 0.12
        cy += (ty - cy) * 0.12
        plan.style.setProperty('--halo-x', `${cx.toFixed(1)}px`)
        plan.style.setProperty('--halo-y', `${cy.toFixed(1)}px`)
        rafHalo = Math.abs(tx - cx) + Math.abs(ty - cy) > 0.5 ? requestAnimationFrame(boucle) : 0
      }
      suivreHalo = (e: PointerEvent) => {
        const r = hero.getBoundingClientRect()
        tx = e.clientX - r.left
        ty = e.clientY - r.top
        if (!actif) {
          actif = true
          cx = r.width * 0.72
          cy = r.height * 0.42
          plan.classList.add('is-suivi')
        }
        if (!rafHalo) rafHalo = requestAnimationFrame(boucle)
      }
      hero.addEventListener('pointermove', suivreHalo)
    }

    return () => {
      if (hero && suivreHalo) hero.removeEventListener('pointermove', suivreHalo)
      cancelAnimationFrame(rafHalo)
      apparition.disconnect()
      vitrine.disconnect()
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auDefilement)
      delete html.dataset.scrolled
    }
  }, [])

  return null
}

'use client'

import { useEffect } from 'react'

// Tous les effets de la landing, en un seul composant sans rendu :
// - navigation opaque dès qu'on a défilé (html[data-scrolled])
// - apparition unique des éléments .lx-reveal / .lx-reveal-image / .lx-etapes li
// - parallaxe des images [data-parallax]
// - défilement horizontal de la section « À quoi ressemblera votre site »
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

    // Défilement horizontal (« À quoi ressemblera votre site ») :
    // sur grand écran, la hauteur de la section = longueur de la piste ; le défilement vertical la fait glisser.
    const defile = document.querySelector<HTMLElement>('.lx-defile')
    const piste = defile?.querySelector<HTMLElement>('.lx-defile__piste')
    const panneaux = defile ? Array.from(defile.querySelectorAll<HTMLElement>('.lx-defile__panneau')) : []
    const compteur = defile?.querySelector<HTMLElement>('.lx-defile__compteur b')
    const modeHorizontal = window.matchMedia('(min-width: 1024px) and (prefers-reduced-motion: no-preference)')
    let distance = 0
    const mesurerDefile = () => {
      if (!defile || !piste) return
      if (modeHorizontal.matches) {
        // fin de la piste = bord droit du dernier panneau + la même marge qu'à gauche
        const dernier = panneaux[panneaux.length - 1]
        const marge = parseFloat(getComputedStyle(piste).paddingLeft) || 0
        const fin = dernier ? dernier.offsetLeft + dernier.offsetWidth + marge : piste.scrollWidth
        distance = Math.max(0, fin - window.innerWidth)
        defile.style.height = `${distance + window.innerHeight}px`
      } else {
        distance = 0
        defile.style.height = ''
        piste.style.transform = ''
      }
    }
    const majDefile = () => {
      if (!defile || !piste) return
      let avance = 0
      if (modeHorizontal.matches && distance > 0) {
        const r = defile.getBoundingClientRect()
        avance = Math.min(1, Math.max(0, -r.top / distance))
        piste.style.transform = `translate3d(${(-avance * distance).toFixed(1)}px, 0, 0)`
      } else {
        avance = piste.scrollWidth > piste.clientWidth ? piste.scrollLeft / (piste.scrollWidth - piste.clientWidth) : 0
      }
      defile.style.setProperty('--avance', avance.toFixed(4))
      // panneau courant = le plus proche du centre de l'écran
      const centre = window.innerWidth / 2
      let courant = 0, ecart = Infinity
      panneaux.forEach((el, i) => {
        const b = el.getBoundingClientRect()
        const d = Math.abs(b.left + b.width / 2 - centre)
        if (d < ecart) { ecart = d; courant = i }
      })
      panneaux.forEach((el, i) => el.classList.toggle('is-actif', i === courant))
      if (compteur) compteur.textContent = String(courant + 1).padStart(2, '0')
    }
    const surRedimension = () => { mesurerDefile(); majDefile() }
    mesurerDefile()
    piste?.addEventListener('scroll', majDefile, { passive: true })
    modeHorizontal.addEventListener('change', surRedimension)

    // Défilement : navigation + parallaxe
    const parallaxes = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'))
    let enAttente = false
    const auDefilement = () => {
      if (enAttente) return
      enAttente = true
      requestAnimationFrame(() => {
        html.dataset.scrolled = window.scrollY > 40 ? 'true' : 'false'
        majDefile()
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
    window.addEventListener('resize', surRedimension)
    // les images de la piste peuvent changer sa largeur une fois chargées
    window.addEventListener('load', surRedimension)

    return () => {
      apparition.disconnect()
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auDefilement)
      window.removeEventListener('resize', surRedimension)
      window.removeEventListener('load', surRedimension)
      piste?.removeEventListener('scroll', majDefile)
      modeHorizontal.removeEventListener('change', surRedimension)
      if (defile) defile.style.height = ''
      delete html.dataset.scrolled
    }
  }, [])

  return null
}

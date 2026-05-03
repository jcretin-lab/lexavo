'use client'

import { useEffect } from 'react'

export function ScrollAnimationInit() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
    )
    const selector = '.fade-in, .fade-in-left, .fade-in-right, .fade-in-scale'
    document.querySelectorAll(selector).forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return null
}

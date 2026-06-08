"use client"

import { useEffect, useRef, useState } from "react"

class TextScramble {
  el: HTMLElement
  chars: string
  queue: Array<{ from: string; to: string; start: number; end: number; char?: string }>
  frame: number
  frameRequest: number
  resolve: (value: void | PromiseLike<void>) => void

  constructor(el: HTMLElement) {
    this.el = el
    this.chars = '!<>-_\\/[]{}—=+*^?#'
    this.queue = []
    this.frame = 0
    this.frameRequest = 0
    this.resolve = () => {}
    this.update = this.update.bind(this)
  }

  setText(newText: string) {
    const oldText = this.el.innerText
    const length = Math.max(oldText.length, newText.length)
    const promise = new Promise<void>((resolve) => (this.resolve = resolve))
    this.queue = []
    for (let i = 0; i < length; i++) {
      const from = oldText[i] || ''
      const to = newText[i] || ''
      const start = Math.floor(Math.random() * 40)
      const end = start + Math.floor(Math.random() * 40)
      this.queue.push({ from, to, start, end })
    }
    cancelAnimationFrame(this.frameRequest)
    this.frame = 0
    this.update()
    return promise
  }

  update() {
    let output = ''
    let complete = 0
    for (let i = 0, n = this.queue.length; i < n; i++) {
      const { to, start, end } = this.queue[i]
      let { from, char } = this.queue[i]
      if (this.frame >= end) {
        complete++
        output += to
      } else if (this.frame >= start) {
        if (!char || Math.random() < 0.28) {
          char = this.chars[Math.floor(Math.random() * this.chars.length)]
          this.queue[i].char = char
        }
        output += `<span style="color:#B8872A;opacity:0.7">${char}</span>`
      } else {
        output += from
      }
    }
    this.el.innerHTML = output
    if (complete === this.queue.length) {
      this.resolve()
    } else {
      this.frameRequest = requestAnimationFrame(this.update)
      this.frame++
    }
  }
}

const PHRASES = [
  'Du contenu juridique en 1 minute.',
  'LinkedIn et Facebook, sans effort.',
  'Votre cabinet, visible chaque semaine.',
  'Une présence régulière sur LinkedIn et Facebook, sans y consacrer du temps.',
]

export function ScrambledHeroTitle({ style, className }: { style?: React.CSSProperties; className?: string }) {
  const elRef = useRef<HTMLHeadingElement>(null)
  const scramblerRef = useRef<TextScramble | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (elRef.current && !scramblerRef.current) {
      scramblerRef.current = new TextScramble(elRef.current)
      setMounted(true)
    }
  }, [])

  useEffect(() => {
    if (!mounted || !scramblerRef.current) return
    let counter = 0
    let timeout: ReturnType<typeof setTimeout>

    const next = () => {
      scramblerRef.current!.setText(PHRASES[counter]).then(() => {
        timeout = setTimeout(next, counter === PHRASES.length - 1 ? 4000 : 2200)
      })
      counter = (counter + 1) % PHRASES.length
    }

    next()
    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(scramblerRef.current?.frameRequest ?? 0)
    }
  }, [mounted])

  return (
    <h1 ref={elRef} className={className} style={style}>
      Une présence régulière sur LinkedIn et Facebook, sans y consacrer du temps.
    </h1>
  )
}

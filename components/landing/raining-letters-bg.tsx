"use client"

import { useState, useEffect, useCallback } from "react"

interface Character {
  char: string
  x: number
  y: number
  speed: number
}

export function RainingLettersBg() {
  const [characters, setCharacters] = useState<Character[]>([])
  const [activeIndices, setActiveIndices] = useState<Set<number>>(new Set())

  const createCharacters = useCallback(() => {
    const allChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"
    const charCount = 300
    const newCharacters: Character[] = []
    for (let i = 0; i < charCount; i++) {
      newCharacters.push({
        char: allChars[Math.floor(Math.random() * allChars.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        speed: 0.1 + Math.random() * 0.3,
      })
    }
    return newCharacters
  }, [])

  useEffect(() => {
    setCharacters(createCharacters())
  }, [createCharacters])

  useEffect(() => {
    const updateActiveIndices = () => {
      const newActiveIndices = new Set<number>()
      const numActive = Math.floor(Math.random() * 3) + 3
      for (let i = 0; i < numActive; i++) {
        newActiveIndices.add(Math.floor(Math.random() * characters.length))
      }
      setActiveIndices(newActiveIndices)
    }
    const flickerInterval = setInterval(updateActiveIndices, 50)
    return () => clearInterval(flickerInterval)
  }, [characters.length])

  useEffect(() => {
    let animationFrameId: number
    const updatePositions = () => {
      setCharacters(prevChars =>
        prevChars.map(char => ({
          ...char,
          y: char.y + char.speed,
          ...(char.y >= 100 && {
            y: -5,
            x: Math.random() * 100,
            char: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?"[
              Math.floor(Math.random() * 63)
            ],
          }),
        }))
      )
      animationFrameId = requestAnimationFrame(updatePositions)
    }
    animationFrameId = requestAnimationFrame(updatePositions)
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Photo de fond */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        opacity: 0.10,
      }} />
      {/* Dégradé de lisibilité */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: [
          'linear-gradient(to right, rgba(15,14,12,0.72) 0%, rgba(15,14,12,0.38) 55%, rgba(15,14,12,0.55) 100%)',
          'linear-gradient(to bottom, rgba(15,14,12,0.32) 0%, rgba(15,14,12,0.10) 45%, rgba(15,14,12,0.48) 100%)',
        ].join(', '),
      }} />
      {characters.map((char, index) => (
        <span
          key={index}
          style={{
            position: 'absolute',
            left: `${char.x}%`,
            top: `${char.y}%`,
            transform: `translate(-50%, -50%) ${activeIndices.has(index) ? 'scale(1.25)' : 'scale(1)'}`,
            fontSize: '1.8rem',
            fontFamily: 'monospace',
            color: activeIndices.has(index) ? '#B8872A' : 'rgba(255,255,255,0.06)',
            textShadow: activeIndices.has(index)
              ? '0 0 8px rgba(184,135,42,0.6), 0 0 16px rgba(184,135,42,0.3)'
              : 'none',
            opacity: activeIndices.has(index) ? 0.85 : 1,
            transition: 'color 0.1s, transform 0.1s, text-shadow 0.1s',
            willChange: 'transform, top',
            fontWeight: activeIndices.has(index) ? 700 : 300,
            zIndex: activeIndices.has(index) ? 1 : 0,
          }}
        >
          {char.char}
        </span>
      ))}
    </div>
  )
}

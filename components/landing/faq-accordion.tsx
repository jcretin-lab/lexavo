'use client'

import { useState } from 'react'

interface FaqItem {
  q: string
  r: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {items.map(({ q, r }, i) => {
        const isOpen = open === i
        return (
          <div
            key={q}
            className="overflow-hidden"
            style={{
              background: 'var(--white)',
              borderRadius: '20px',
              border: `1px solid ${isOpen ? 'var(--navy-200, #c0cfe8)' : 'var(--ink-100)'}`,
              transition: 'border-color 0.2s, box-shadow 0.2s',
              boxShadow: isOpen ? '0 20px 50px -18px rgba(15,34,71,0.22)' : '0 16px 40px -22px rgba(15,34,71,0.16)',
            }}
          >
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-medium text-sm" style={{ color: 'var(--ink-900)' }}>{q}</span>
              <span
                aria-hidden
                style={{
                  color: isOpen ? 'var(--navy-900)' : 'var(--ink-400)',
                  transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), color 0.2s',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  flexShrink: 0,
                  fontSize: '1.375rem',
                  lineHeight: 1,
                  fontWeight: 300,
                  display: 'block',
                  width: '20px',
                  textAlign: 'center',
                }}
              >
                +
              </span>
            </button>
            <div
              style={{
                maxHeight: isOpen ? '500px' : '0',
                overflow: 'hidden',
                transition: 'max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              <p
                className={isOpen ? 'faq-body-open' : ''}
                style={{ padding: '0 1.25rem 1.25rem', fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--ink-500)' }}
              >
                {r}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

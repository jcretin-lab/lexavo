'use client'

import { useId, useState } from 'react'

interface FaqItem {
  q: string
  r: string
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0)
  const base = useId()

  return (
    <div>
      {items.map(({ q, r }, i) => {
        const isOpen = open === i
        const idReponse = `${base}-r${i}`
        return (
          <div key={q} className={`lx-faq__item${isOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              className="lx-faq__question"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={idReponse}
            >
              {q}
              <span className="lx-faq__signe" aria-hidden />
            </button>
            <div id={idReponse} className="lx-faq__reponse" role="region">
              <div>
                <p>{r}</p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

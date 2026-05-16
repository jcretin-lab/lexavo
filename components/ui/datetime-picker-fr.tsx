'use client'

import { useMemo } from 'react'

interface Props {
  value: string
  onChange: (next: string) => void
  minDate?: string
  className?: string
  autoFocus?: boolean
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

function parseValue(value: string): { date: string; hour: string; minute: string } {
  if (!value) return { date: '', hour: '09', minute: '00' }
  const [d, t] = value.split('T')
  const [h = '09', m = '00'] = (t ?? '').split(':')
  return { date: d ?? '', hour: pad(Number(h) || 0), minute: pad(Number(m) || 0) }
}

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i))
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5))

export function DateTimePickerFr({ value, onChange, minDate, className, autoFocus }: Props) {
  const { date, hour, minute } = useMemo(() => parseValue(value), [value])

  const todayMin = useMemo(() => {
    if (minDate) return minDate
    const now = new Date()
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  }, [minDate])

  function emit(nextDate: string, nextHour: string, nextMinute: string) {
    if (!nextDate) return
    onChange(`${nextDate}T${nextHour}:${nextMinute}`)
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className ?? ''}`}>
      <input
        type="date"
        value={date}
        min={todayMin}
        autoFocus={autoFocus}
        onChange={e => emit(e.target.value, hour, minute)}
        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400"
      />
      <select
        value={hour}
        aria-label="Heure"
        onChange={e => emit(date, e.target.value, minute)}
        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 bg-white"
      >
        {HOURS.map(h => (
          <option key={h} value={h}>{h}h</option>
        ))}
      </select>
      <select
        value={minute}
        aria-label="Minutes"
        onChange={e => emit(date, hour, e.target.value)}
        className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 bg-white"
      >
        {MINUTES.map(m => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
    </div>
  )
}

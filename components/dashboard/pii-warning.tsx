'use client'

import type { PIIFinding } from '@/lib/pii-detection'
import { summarizeFindings } from '@/lib/pii-detection'

interface Props {
  findings: PIIFinding[]
  confirmed: boolean
  onConfirmChange: (v: boolean) => void
  fieldId?: string
}

export function PIIWarning({ findings, confirmed, onConfirmChange, fieldId }: Props) {
  if (findings.length === 0) return null

  const summary = summarizeFindings(findings)
  const checkboxId = fieldId ? `pii-confirm-${fieldId}` : 'pii-confirm'

  return (
    <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-semibold mb-1">
        Données potentiellement sensibles détectées
      </p>
      <p className="text-amber-900/90 mb-2">
        Le texte saisi semble contenir : {summary}. Vérifiez qu&apos;aucune
        information permettant d&apos;identifier un client ou un dossier
        n&apos;est présente avant de lancer la génération.
      </p>
      <ul className="list-disc pl-5 mb-3 space-y-0.5 text-amber-800/90">
        {findings.map((f, i) => (
          <li key={`${f.kind}-${i}`}>
            <span className="font-medium">{f.label}</span>{' '}
            <span className="text-amber-700/80">— {f.sample}</span>
          </li>
        ))}
      </ul>
      <label htmlFor={checkboxId} className="flex items-start gap-2 cursor-pointer">
        <input
          id={checkboxId}
          type="checkbox"
          checked={confirmed}
          onChange={(e) => onConfirmChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-700 focus:ring-amber-500"
        />
        <span className="text-amber-900/90">
          Je confirme avoir anonymisé ces informations et assume ma
          responsabilité au titre du secret professionnel.
        </span>
      </label>
    </div>
  )
}

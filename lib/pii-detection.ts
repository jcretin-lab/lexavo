export type PIIKind =
  | 'email'
  | 'phone'
  | 'iban'
  | 'nir'
  | 'siret'
  | 'siren'
  | 'address'
  | 'civilite'

export interface PIIFinding {
  kind: PIIKind
  label: string
  sample: string
}

const LABELS: Record<PIIKind, string> = {
  email: 'Adresse e-mail',
  phone: 'Numéro de téléphone',
  iban: 'IBAN bancaire',
  nir: 'Numéro de sécurité sociale',
  siret: 'Numéro SIRET',
  siren: 'Numéro SIREN',
  address: 'Adresse postale',
  civilite: 'Nom de personne (civilité)',
}

const PATTERNS: Array<{ kind: Exclude<PIIKind, 'siren'>; regex: RegExp }> = [
  { kind: 'email', regex: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g },
  { kind: 'iban', regex: /\bFR\d{2}(?:\s?\d{4}){5}\s?\d{3}\b/gi },
  {
    kind: 'nir',
    regex:
      /\b[12]\s?\d{2}\s?(?:0\d|1[0-2])\s?(?:\d{2}|2[AB])\s?\d{3}\s?\d{3}(?:\s?\d{2})?\b/g,
  },
  { kind: 'siret', regex: /\b\d{3}\s?\d{3}\s?\d{3}\s?\d{5}\b/g },
  { kind: 'phone', regex: /(?:\+33\s?|0)[1-9](?:[\s.\-]?\d{2}){4}/g },
  {
    kind: 'address',
    regex:
      /\b\d{1,4}\s+(?:rue|avenue|av\.|bd|boulevard|impasse|place|allée|chemin|route|cours|quai)\s+[A-ZÀ-Ÿ][\wÀ-ÿ'\-]+/giu,
  },
  {
    kind: 'civilite',
    regex: /\b(?:M\.|Mme|Monsieur|Madame|Maître|Me)\s+[A-ZÀ-Ÿ][\wÀ-ÿ\-]+/gu,
  },
]

function maskEmail(s: string): string {
  const [local, domain] = s.split('@')
  if (!local || !domain) return '***'
  const dotIdx = domain.lastIndexOf('.')
  const domainHead = dotIdx > 0 ? domain.slice(0, dotIdx) : domain
  const tld = dotIdx > 0 ? domain.slice(dotIdx) : ''
  return `${local[0]}***@${domainHead[0]}***${tld}`
}

function maskDigits(s: string, keepFirst = 2, keepLast = 2): string {
  const digits = s.replace(/\D/g, '')
  if (digits.length <= keepFirst + keepLast) return '***'
  const head = digits.slice(0, keepFirst)
  const tail = digits.slice(-keepLast)
  const middle = '*'.repeat(Math.max(2, digits.length - keepFirst - keepLast))
  return `${head} ${middle} ${tail}`
}

function maskCivilite(s: string): string {
  const parts = s.split(/\s+/)
  if (parts.length < 2) return s
  const [civ, name] = parts
  return `${civ} ${name[0]}***`
}

function maskAddress(s: string): string {
  const parts = s.split(/\s+/)
  return parts.length <= 3 ? `${parts[0]} ${parts[1]} ***` : `${parts[0]} ${parts[1]} ${parts[2]} ***`
}

function maskSample(kind: PIIKind, raw: string): string {
  switch (kind) {
    case 'email':
      return maskEmail(raw)
    case 'phone':
      return maskDigits(raw, 2, 2)
    case 'iban':
      return maskDigits(raw, 4, 3)
    case 'nir':
      return maskDigits(raw, 1, 2)
    case 'siret':
      return maskDigits(raw, 3, 0)
    case 'siren':
      return maskDigits(raw, 3, 0)
    case 'civilite':
      return maskCivilite(raw)
    case 'address':
      return maskAddress(raw)
  }
}

export function detectPII(text: string): PIIFinding[] {
  if (!text || text.length < 6) return []

  const findings: PIIFinding[] = []
  const seen = new Set<string>()
  let residual = text

  for (const { kind, regex } of PATTERNS) {
    const matches = residual.match(regex)
    if (!matches) continue
    for (const raw of matches) {
      const sample = maskSample(kind, raw)
      const key = `${kind}:${sample}`
      if (seen.has(key)) continue
      seen.add(key)
      findings.push({ kind, label: LABELS[kind], sample })
    }
    if (kind === 'siret') {
      residual = residual.replace(regex, ' ')
    }
  }

  const sirenRegex = /\b\d{3}\s?\d{3}\s?\d{3}\b/g
  const sirenMatches = residual.match(sirenRegex)
  if (sirenMatches) {
    for (const raw of sirenMatches) {
      const sample = maskSample('siren', raw)
      const key = `siren:${sample}`
      if (seen.has(key)) continue
      seen.add(key)
      findings.push({ kind: 'siren', label: LABELS.siren, sample })
    }
  }

  return findings
}

export function summarizeFindings(findings: PIIFinding[]): string {
  if (findings.length === 0) return ''
  const counts = new Map<PIIKind, number>()
  for (const f of findings) counts.set(f.kind, (counts.get(f.kind) ?? 0) + 1)
  return Array.from(counts.entries())
    .map(([kind, n]) => {
      const label = LABELS[kind].toLowerCase()
      return n === 1 ? `1 ${label}` : `${n} ${label}s`
    })
    .join(', ')
}

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// M2 — Rate limiting en mémoire (5 requêtes / heure / IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const MAX_REQUESTS = 5
const WINDOW_MS = 60 * 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= MAX_REQUESTS) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  // M2 — Vérification du rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Trop de messages envoyés. Réessayez dans une heure.' },
      { status: 429 }
    )
  }

  const { nom, email, cabinet, forfait, siteActuel, message, privacy } = await request.json()
  const champ = (v: unknown) => (typeof v === 'string' ? v.slice(0, 5000) : '')

  if (typeof nom !== 'string' || typeof email !== 'string' || typeof message !== 'string' || !nom || !email || !message || !privacy) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Lexavo <onboarding@resend.dev>'
  const adminEmail = process.env.ADMIN_EMAIL ?? 'contact@lexavo.fr'

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: adminEmail,
    replyTo: email,
    subject: `[Devis site] ${champ(forfait) ? `${esc(champ(forfait))} — ` : ''}${esc(nom)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h2 style="color: #1A3F7C; margin-bottom: 24px;">Nouvelle demande de devis</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #555; width: 120px;"><strong>Nom</strong></td><td style="padding: 8px 0;">${esc(nom)}</td></tr>
          <tr><td style="padding: 8px 0; color: #555;"><strong>Email</strong></td><td style="padding: 8px 0;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          ${champ(cabinet) ? `<tr><td style="padding: 8px 0; color: #555;"><strong>Cabinet</strong></td><td style="padding: 8px 0;">${esc(champ(cabinet))}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #555;"><strong>Forfait</strong></td><td style="padding: 8px 0;">${esc(champ(forfait) || 'Non précisé')}</td></tr>
          ${champ(siteActuel) ? `<tr><td style="padding: 8px 0; color: #555;"><strong>Site actuel</strong></td><td style="padding: 8px 0;">${esc(champ(siteActuel))}</td></tr>` : ''}
        </table>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="white-space: pre-wrap; color: #333; line-height: 1.6;">${esc(champ(message))}</p>
      </div>
    `,
  })

  if (error) {
    console.error('[contact] Erreur Resend :', JSON.stringify(error))
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export async function POST(request: NextRequest) {
  const { nom, email, cabinet, sujet, message, privacy } = await request.json()

  if (!nom || !email || !message || !privacy) {
    return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Lexavo <onboarding@resend.dev>'

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: 'jcretin@gmail.com',
    replyTo: email,
    subject: `[Contact Lexavo] ${esc(sujet)} — ${esc(nom)}`,
    html: `
      <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h2 style="color: #1A3F7C; margin-bottom: 24px;">Nouveau message via le formulaire de contact</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #555; width: 120px;"><strong>Nom</strong></td><td style="padding: 8px 0;">${esc(nom)}</td></tr>
          <tr><td style="padding: 8px 0; color: #555;"><strong>Email</strong></td><td style="padding: 8px 0;"><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
          ${cabinet ? `<tr><td style="padding: 8px 0; color: #555;"><strong>Cabinet</strong></td><td style="padding: 8px 0;">${esc(cabinet)}</td></tr>` : ''}
          <tr><td style="padding: 8px 0; color: #555;"><strong>Sujet</strong></td><td style="padding: 8px 0;">${esc(sujet)}</td></tr>
        </table>
        <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;" />
        <p style="white-space: pre-wrap; color: #333; line-height: 1.6;">${esc(message)}</p>
      </div>
    `,
  })

  if (error) {
    console.error('[contact] Erreur Resend :', JSON.stringify(error))
    return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

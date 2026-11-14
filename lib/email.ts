import { Resend } from 'resend'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Lexavo <onboarding@resend.dev>'

export async function send(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await getResend().emails.send({ from: FROM, to, subject, html })
  if (error) {
    console.error(`[email] Erreur envoi à ${to} :`, JSON.stringify(error))
    return { ok: false, error: JSON.stringify(error) }
  }
  void data
  return { ok: true }
}

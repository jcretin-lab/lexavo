import { Resend } from 'resend'
import { NOM_PAR_PLAN, PRIX_PAR_PLAN } from '@/types'

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Lexavo <onboarding@resend.dev>'
// M4 — ADMIN_EMAIL en variable d'environnement
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'contact@lexavo.fr'

function layout(content: string): string {
  return `
    <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      <h1 style="font-size: 24px; font-weight: bold; color: #1A3F7C; margin-bottom: 4px;">Lexavo</h1>
      <p style="color: #888; font-size: 13px; margin-bottom: 32px; margin-top: 0;">Votre présence juridique sur Facebook &amp; LinkedIn</p>
      ${content}
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />
      <p style="font-size: 12px; color: #aaa; margin: 0;">Lexavo · lexavo.fr</p>
    </div>
  `
}

function btn(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;background:#1A3F7C;color:white;text-decoration:none;font-weight:bold;font-size:14px;padding:12px 24px;border-radius:8px;margin-top:8px;">${label} →</a>`
}

export async function send(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await getResend().emails.send({ from: FROM, to, subject, html })
  if (error) {
    console.error(`[email] Erreur envoi à ${to} :`, JSON.stringify(error))
    return { ok: false, error: JSON.stringify(error) }
  }
  void data
  return { ok: true }
}

// ── 1. Bienvenue après onboarding ───────────────────────────────────────────
export async function sendBienvenue(email: string, nomCabinet?: string) {
  const salutation = nomCabinet ? `Bienvenue sur Lexavo, ${nomCabinet} !` : 'Bienvenue sur Lexavo !'
  const html = layout(`
    <p style="font-size:16px;font-weight:600;margin-bottom:16px;">${salutation}</p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:16px;">
      Votre cabinet est configuré. Pour démarrer, vous bénéficiez de
      <strong>3 publications gratuites</strong> — générez votre premier contenu juridique
      dès maintenant, sans engagement.
    </p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:8px;">Ce que vous pouvez faire avec vos 3 essais :</p>
    <ul style="font-size:14px;color:#444;line-height:2;margin:0 0 24px 0;padding-left:20px;">
      <li>Un article de blog optimisé SEO</li>
      <li>3 posts Facebook prêts à publier</li>
      <li>Une FAQ juridique + une image générée par IA</li>
    </ul>
    ${btn('https://www.lexavo.fr/dashboard/generer', 'Commencer maintenant')}
    <p style="font-size:12px;color:#aaa;margin-top:24px;">
      Une question ? Répondez directement à cet email — nous sommes là.
    </p>
  `)
  return send(email, salutation, html)
}

// ── 2. Notification admin — nouvelle inscription (signup) ───────────────────
export async function sendNotifInscription(email: string) {
  const html = layout(`
    <p style="font-size:16px;font-weight:600;margin-bottom:16px;">Nouvelle inscription</p>
    <table style="font-size:14px;color:#444;border-collapse:collapse;">
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Email</td><td><a href="mailto:${email}" style="color:#1A3F7C;">${email}</a></td></tr>
      <tr><td style="padding:6px 16px 6px 0;color:#888;">Date</td><td>${new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })}</td></tr>
    </table>
  `)
  return send(ADMIN_EMAIL, `Nouvelle inscription Lexavo — ${email}`, html)
}

// ── 2b. Notification admin — nouveau client après onboarding ─────────────────
export async function sendNotifNouveauClient(data: {
  email: string
  nom: string
  plan: string
  ville: string
  barreau: string
}) {
  const { email, nom, plan, ville, barreau } = data
  const nomPlan = NOM_PAR_PLAN[plan as keyof typeof NOM_PAR_PLAN] ?? plan
  const dateStr = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' })
  const html = layout(`
    <p style="font-size:16px;font-weight:600;margin-bottom:16px;">Nouveau client inscrit sur Lexavo</p>
    <table style="font-size:14px;color:#444;border-collapse:collapse;width:100%;">
      <tr><td style="padding:7px 20px 7px 0;color:#888;white-space:nowrap;">Cabinet</td><td style="font-weight:600;">${nom}</td></tr>
      <tr><td style="padding:7px 20px 7px 0;color:#888;">Email</td><td><a href="mailto:${email}" style="color:#1A3F7C;">${email}</a></td></tr>
      <tr><td style="padding:7px 20px 7px 0;color:#888;">Plan souscrit</td><td>${nomPlan}</td></tr>
      <tr><td style="padding:7px 20px 7px 0;color:#888;">Date d'inscription</td><td>${dateStr}</td></tr>
      <tr><td style="padding:7px 20px 7px 0;color:#888;">Ville</td><td>${ville}</td></tr>
      <tr><td style="padding:7px 20px 7px 0;color:#888;">Barreau</td><td>${barreau}</td></tr>
    </table>
  `)
  return send(ADMIN_EMAIL, `Nouveau client Lexavo — ${nom}`, html)
}

// ── 3. Confirmation d'abonnement ─────────────────────────────────────────────
// Mo3 — Noms de plans harmonisés avec types/index.ts
export async function sendConfirmationAbonnement(email: string, planId: string) {
  const planKey = planId as keyof typeof PRIX_PAR_PLAN
  const nomPlan = NOM_PAR_PLAN[planId as keyof typeof NOM_PAR_PLAN] ?? planId
  const prixPlan = planKey in PRIX_PAR_PLAN ? PRIX_PAR_PLAN[planKey] : ''

  const html = layout(`
    <p style="font-size:16px;font-weight:600;margin-bottom:16px;">Votre abonnement est activé ✓</p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:16px;">
      Merci pour votre confiance. Votre plan <strong>${nomPlan}</strong>${prixPlan ? ` (${prixPlan})` : ''} est maintenant actif.
    </p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:24px;">
      Vous pouvez dès maintenant générer du contenu et programmer vos publications sur Facebook${planId !== 'essentiel' ? ' et LinkedIn' : ''}.
    </p>
    ${btn('https://www.lexavo.fr/dashboard', 'Accéder à mon tableau de bord')}
    <p style="font-size:12px;color:#aaa;margin-top:24px;">
      Pour gérer votre abonnement, rendez-vous dans Paramètres → Abonnement.
    </p>
  `)
  return send(email, `Votre abonnement ${nomPlan} est activé — Lexavo`, html)
}

// ── 4. Rappel expiration LinkedIn ────────────────────────────────────────────
export async function sendLinkedinRappel(email: string) {
  const html = layout(`
    <p style="font-size:16px;font-weight:600;margin-bottom:16px;">Votre connexion LinkedIn expire dans 7 jours</p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:16px;">
      Bonjour,<br/><br/>
      Votre connexion LinkedIn à Lexavo expire dans <strong>7 jours</strong>.
      Pour continuer à publier automatiquement, il vous faut la renouveler en 2 minutes.
    </p>
    <p style="font-size:14px;font-weight:600;color:#1A3F7C;margin-bottom:12px;">Pour la renouveler :</p>
    <ol style="font-size:14px;color:#444;line-height:2;margin:0 0 24px 0;padding-left:20px;">
      <li>Retournez sur <a href="https://www.make.com" style="color:#1A3F7C;">make.com</a></li>
      <li>Ouvrez votre scénario LinkedIn</li>
      <li>Cliquez sur le module LinkedIn</li>
      <li>Cliquez « Reconnect »</li>
      <li>Revenez sur Lexavo et ré-enregistrez votre URL webhook</li>
    </ol>
    ${btn('https://www.lexavo.fr/guide-linkedin', 'Renouveler ma connexion')}
    <p style="font-size:12px;color:#aaa;margin-top:24px;">
      Si vous avez des difficultés, contactez-nous à <a href="mailto:contact@lexavo.fr" style="color:#aaa;">contact@lexavo.fr</a>
    </p>
  `)
  return send(email, 'Votre connexion LinkedIn expire dans 7 jours — Lexavo', html)
}

// ── 5. Quota d'essai atteint ────────────────────────────────────────────────
export async function sendQuotaAtteint(email: string) {
  const html = layout(`
    <p style="font-size:16px;font-weight:600;margin-bottom:16px;">Vos 3 publications gratuites sont épuisées</p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:16px;">
      Vous avez utilisé vos 3 générations d'essai. Pour continuer à créer du contenu juridique
      sans limite, choisissez un plan adapté à votre cabinet.
    </p>
    ${btn('https://www.lexavo.fr/dashboard/parametres', 'Voir les plans')}
    <p style="font-size:12px;color:#aaa;margin-top:24px;">
      Une question ? Contactez-nous à <a href="mailto:contact@lexavo.fr" style="color:#aaa;">contact@lexavo.fr</a>
    </p>
  `)
  return send(email, 'Vos 3 publications gratuites sont épuisées — Lexavo', html)
}

// ── 6. Publication réussie ───────────────────────────────────────────────────
export async function sendPublicationReussie(email: string, nomCabinet?: string) {
  const cabinet = nomCabinet ? ` pour ${nomCabinet}` : ''
  const html = layout(`
    <p style="font-size:16px;font-weight:600;margin-bottom:16px;">Publication programmée avec succès ✓</p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:16px;">
      Votre publication${cabinet} a bien été transmise à Make.com et sera publiée à l'heure prévue.
    </p>
    ${btn('https://www.lexavo.fr/dashboard/calendrier', 'Voir mon calendrier')}
  `)
  return send(email, `Publication programmée — Lexavo`, html)
}

// ── 7. Résiliation d'abonnement ───────────────────────────────────────────────
export async function sendResiliation(email: string) {
  const html = layout(`
    <p style="font-size:16px;font-weight:600;margin-bottom:16px;">Votre abonnement a été résilié</p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:16px;">
      Nous avons bien pris en compte la résiliation de votre abonnement Lexavo.
      Vous conservez l'accès à votre compte jusqu'à la fin de la période en cours.
    </p>
    <p style="font-size:14px;color:#444;line-height:1.7;margin-bottom:24px;">
      Si c'est une erreur ou si vous souhaitez vous réabonner, vous pouvez le faire à tout moment depuis vos paramètres.
    </p>
    ${btn('https://www.lexavo.fr/dashboard/parametres', 'Gérer mon abonnement')}
    <p style="font-size:12px;color:#aaa;margin-top:24px;">
      Une question ? Contactez-nous à <a href="mailto:contact@lexavo.fr" style="color:#aaa;">contact@lexavo.fr</a>
    </p>
  `)
  return send(email, 'Résiliation de votre abonnement Lexavo', html)
}

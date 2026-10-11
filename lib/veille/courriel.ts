// E-mail de confirmation d'inscription à la veille (double confirmation). Utilise l'envoi Resend déjà configuré pour l'application.
import { send } from '@/lib/email'
import { LISTE_PAR_DEFAUT, trouverListe, type Liste } from './listes'

/** Adresse du site de la veille (pages de confirmation et de désinscription). */
export const BASE_VEILLE = process.env.VEILLE_BASE_URL ?? 'https://veille.lexavo.fr'

export function lienConfirmation(jeton: string): string {
  return `${BASE_VEILLE}/confirmer.html?jeton=${encodeURIComponent(jeton)}`
}

export function htmlConfirmation(lien: string, liste: Liste = trouverListe(LISTE_PAR_DEFAUT)!): string {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #0E1320;">
      <p style="font-family: Georgia, serif; font-style: italic; font-size: 28px; color: #1A3F7C; margin: 0 0 4px;">Lexavo<span style="color:#D4A24C;">.</span></p>
      <p style="font-family: Arial, sans-serif; font-size: 12px; letter-spacing: .06em; text-transform: uppercase; color: #52606d; margin: 0 0 28px;">Veille · ${liste.nom}</p>
      <p style="font-size: 17px; line-height: 1.6; margin: 0 0 14px;">Bonjour,</p>
      <p style="font-size: 17px; line-height: 1.6; margin: 0 0 14px;">
        Vous avez demandé à recevoir la veille Lexavo tous les quinze jours : ${liste.description}.
      </p>
      <p style="font-size: 17px; line-height: 1.6; margin: 0 0 22px;">Pour terminer votre inscription, confirmez votre adresse :</p>
      <p style="margin: 0 0 22px;">
        <a href="${lien}" style="display:inline-block;background:#1A3F7C;color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:bold;font-size:15px;padding:13px 24px;border-radius:6px;">Confirmer mon inscription</a>
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #52606d; margin: 0 0 8px;">
        Ce lien est valable 7 jours. Si le bouton ne fonctionne pas, copiez cette adresse dans votre navigateur :<br>
        <span style="word-break: break-all;">${lien}</span>
      </p>
      <p style="font-family: Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #52606d; margin: 0 0 8px;">
        <strong>Vous n'êtes pas à l'origine de cette demande ?</strong> Ignorez simplement ce message : sans votre confirmation,
        aucune inscription n'est enregistrée et vous ne recevrez rien.
      </p>
      <hr style="margin: 28px 0 14px; border: none; border-top: 1px solid #D9E2EC;" />
      <p style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.5; color: #7b8794; margin: 0;">
        Lexavo — nom commercial de Julien Pretet, entrepreneur individuel, SIRET 949 978 894 00028 ·
        <a href="https://www.lexavo.fr/mentions-legales" style="color:#7b8794;">Mentions légales</a> ·
        <a href="https://www.lexavo.fr/politique-confidentialite" style="color:#7b8794;">Confidentialité</a>
      </p>
    </div>
  `
}

/** Objet du message : inchangé pour la veille d'origine, avec le nom de la veille pour les autres. */
export function sujetConfirmation(liste: Liste): string {
  return liste.slug === LISTE_PAR_DEFAUT ? 'Confirmez votre inscription à la veille Lexavo' : `Confirmez votre inscription à la veille Lexavo « ${liste.nom} »`
}

export async function envoyerConfirmationVeille(email: string, jeton: string, slug: string = LISTE_PAR_DEFAUT): Promise<boolean> {
  const liste = trouverListe(slug) ?? trouverListe(LISTE_PAR_DEFAUT)!
  const resultat = await send(email, sujetConfirmation(liste), htmlConfirmation(lienConfirmation(jeton), liste))
  return resultat.ok
}

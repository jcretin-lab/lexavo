// Newsletter « Veille Lexavo » — règles métier de l'inscription (double confirmation) et de la désinscription.
// Aucun import : la base de données, l'envoi d'e-mail, l'horloge et les jetons sont fournis par l'appelant (`Outils`),
// ce qui permet de tester toutes les règles avec de fausses dépendances (voir service.test.ts).

export type Statut = 'en_attente' | 'confirme' | 'desinscrit'

export type Abonne = {
  id: string
  email: string
  nom: string | null
  profil: string
  statut: Statut
  jeton_confirmation: string
  jeton_desinscription: string
  consentement_version: string
  consentement_texte: string
  cree_le: string
  derniere_demande_le: string
  confirme_le: string | null
  desinscrit_le: string | null
}

export interface Depot {
  trouverParEmail(email: string): Promise<Abonne | null>
  trouverParJetonConfirmation(jeton: string): Promise<Abonne | null>
  trouverParJetonDesinscription(jeton: string): Promise<Abonne | null>
  creer(abonne: Omit<Abonne, 'id'>): Promise<void>
  mettreAJour(id: string, champs: Partial<Omit<Abonne, 'id'>>): Promise<void>
  lister(): Promise<Abonne[]>
  /** Supprime les demandes en attente dont la dernière demande précède `enAttenteAvant`, et les désinscrits désinscrits avant `desinscritsAvant`. */
  supprimerAnciens(limites: { enAttenteAvant: string; desinscritsAvant: string }): Promise<{ enAttente: number; desinscrits: number }>
}

export interface Outils {
  depot: Depot
  /** Envoie l'e-mail de confirmation ; renvoie faux en cas d'échec. */
  envoyerConfirmation(email: string, jetonConfirmation: string): Promise<boolean>
  nouveauJeton(): string
  maintenant(): Date
  consentement: { version: string; texte: string }
}

/** Un lien de confirmation est valable 7 jours. */
export const DELAI_CONFIRMATION_MS = 7 * 24 * 60 * 60 * 1000
/** On ne renvoie pas d'e-mail de confirmation à la même adresse plus d'une fois toutes les 10 minutes. */
export const DELAI_RENVOI_MS = 10 * 60 * 1000
/** Une demande jamais confirmée est supprimée au bout de 30 jours (annoncé dans la politique de confidentialité, section 3.10). */
export const DELAI_PURGE_EN_ATTENTE_MS = 30 * 24 * 60 * 60 * 1000
/** Après désinscription, l'adresse n'est conservée que 3 ans, pour respecter le choix de la personne (annoncé en 3.10). */
export const DELAI_CONSERVATION_DESINSCRIT_MS = 3 * 365 * 24 * 60 * 60 * 1000

export type ResultatInscription = 'confirmation_envoyee' | 'deja_confirme' | 'trop_tot' | 'echec_envoi'

export async function inscrire(
  o: Outils,
  demande: { email: string; nom: string | null; profil: string },
): Promise<ResultatInscription> {
  const maintenant = o.maintenant()
  const iso = maintenant.toISOString()
  const existant = await o.depot.trouverParEmail(demande.email)

  if (existant?.statut === 'confirme') return 'deja_confirme'
  if (existant?.statut === 'en_attente' && maintenant.getTime() - Date.parse(existant.derniere_demande_le) < DELAI_RENVOI_MS) {
    return 'trop_tot'
  }

  const jetonConfirmation = o.nouveauJeton()
  if (!existant) {
    await o.depot.creer({
      email: demande.email,
      nom: demande.nom,
      profil: demande.profil,
      statut: 'en_attente',
      jeton_confirmation: jetonConfirmation,
      jeton_desinscription: o.nouveauJeton(),
      consentement_version: o.consentement.version,
      consentement_texte: o.consentement.texte,
      cree_le: iso,
      derniere_demande_le: iso,
      confirme_le: null,
      desinscrit_le: null,
    })
  } else {
    // en attente depuis plus de 10 minutes, ou désinscrit qui revient : nouvelle demande, nouveaux jetons, nouveau consentement
    await o.depot.mettreAJour(existant.id, {
      nom: demande.nom ?? existant.nom,
      profil: demande.profil,
      statut: 'en_attente',
      jeton_confirmation: jetonConfirmation,
      jeton_desinscription: existant.statut === 'desinscrit' ? o.nouveauJeton() : existant.jeton_desinscription,
      consentement_version: o.consentement.version,
      consentement_texte: o.consentement.texte,
      derniere_demande_le: iso,
      confirme_le: null,
      desinscrit_le: null,
    })
  }
  return (await o.envoyerConfirmation(demande.email, jetonConfirmation)) ? 'confirmation_envoyee' : 'echec_envoi'
}

export type ResultatConfirmation = 'confirme' | 'deja_confirme' | 'expire' | 'invalide'

export async function confirmer(o: Outils, jeton: string): Promise<ResultatConfirmation> {
  const abonne = await o.depot.trouverParJetonConfirmation(jeton)
  if (!abonne) return 'invalide'
  if (abonne.statut === 'confirme') return 'deja_confirme'
  if (abonne.statut === 'desinscrit') return 'invalide'
  const maintenant = o.maintenant()
  if (maintenant.getTime() - Date.parse(abonne.derniere_demande_le) > DELAI_CONFIRMATION_MS) return 'expire'
  await o.depot.mettreAJour(abonne.id, { statut: 'confirme', confirme_le: maintenant.toISOString() })
  return 'confirme'
}

export type ResultatDesinscription = 'desinscrit' | 'deja_desinscrit' | 'invalide'

export async function desinscrire(o: Outils, jeton: string): Promise<ResultatDesinscription> {
  const abonne = await o.depot.trouverParJetonDesinscription(jeton)
  if (!abonne) return 'invalide'
  if (abonne.statut === 'desinscrit') return 'deja_desinscrit'
  await o.depot.mettreAJour(abonne.id, { statut: 'desinscrit', desinscrit_le: o.maintenant().toISOString() })
  return 'desinscrit'
}

export type Export = {
  genere_le: string
  abonnes: {
    email: string
    nom: string | null
    profil: string
    confirme_le: string | null
    jeton_desinscription: string
    consentement_version: string
  }[]
  /** Adresses à ne plus jamais écrire (désinscrites) : l'envoi doit aussi écarter celles de sa propre liste manuelle. */
  desinscrits: string[]
}

export async function exporter(o: Outils): Promise<Export> {
  const tous = await o.depot.lister()
  return {
    genere_le: o.maintenant().toISOString(),
    abonnes: tous
      .filter((a) => a.statut === 'confirme')
      .map((a) => ({
        email: a.email,
        nom: a.nom,
        profil: a.profil,
        confirme_le: a.confirme_le,
        jeton_desinscription: a.jeton_desinscription,
        consentement_version: a.consentement_version,
      })),
    desinscrits: tous.filter((a) => a.statut === 'desinscrit').map((a) => a.email),
  }
}

export async function purger(o: Outils): Promise<{ enAttente: number; desinscrits: number }> {
  const t = o.maintenant().getTime()
  return o.depot.supprimerAnciens({
    enAttenteAvant: new Date(t - DELAI_PURGE_EN_ATTENTE_MS).toISOString(),
    desinscritsAvant: new Date(t - DELAI_CONSERVATION_DESINSCRIT_MS).toISOString(),
  })
}

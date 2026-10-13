// Newsletters « Veille Lexavo » (une liste d'abonnés par veille) — règles métier de l'inscription (double confirmation) et de la désinscription.
// Aucun import : la base de données, l'envoi d'e-mail, l'horloge et les jetons sont fournis par l'appelant (`Outils`),
// ce qui permet de tester toutes les règles avec de fausses dépendances (voir service.test.ts).

export type Statut = 'en_attente' | 'confirme' | 'desinscrit'

export type Abonne = {
  id: string
  email: string
  /** Veille à laquelle la personne est inscrite (slug, voir listes.ts) : la même adresse peut figurer dans plusieurs listes. */
  liste: string
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
  trouverParEmailEtListe(email: string, liste: string): Promise<Abonne | null>
  trouverParJetonConfirmation(jeton: string): Promise<Abonne | null>
  trouverParJetonDesinscription(jeton: string): Promise<Abonne | null>
  creer(abonne: Omit<Abonne, 'id'>): Promise<void>
  mettreAJour(id: string, champs: Partial<Omit<Abonne, 'id'>>): Promise<void>
  /** Les abonnés d'une liste, tous statuts confondus. */
  lister(liste: string): Promise<Abonne[]>
  /** Toutes les lignes d'une adresse (une par veille), tous statuts confondus. */
  listerParEmail(email: string): Promise<Abonne[]>
  /** Supprime les demandes en attente dont la dernière demande précède `enAttenteAvant`, et les désinscrits désinscrits avant `desinscritsAvant`. */
  supprimerAnciens(limites: { enAttenteAvant: string; desinscritsAvant: string }): Promise<{ enAttente: number; desinscrits: number }>
}

/** Ce que l'éditeur apprend quand une personne confirme son inscription (voir `Outils.prevenir`). */
export type NouvelAbonne = {
  email: string
  nom: string | null
  profil: string
  /** Les veilles confirmées par ce clic (slugs). */
  listes: string[]
  confirme_le: string
  /** Nombre d'abonnés confirmés de chacune de ces veilles, celui-ci compris. */
  effectifs: Record<string, number>
}

/** L'alerte n'attend pas plus longtemps : une messagerie lente ne doit pas retarder la page de confirmation. */
export const DELAI_ALERTE_MS = 5000

export interface Outils {
  depot: Depot
  /** Envoie UN e-mail de confirmation pour toutes les veilles demandées en même temps ; renvoie faux en cas d'échec. `jetonConfirmation` : celui de la première. */
  envoyerConfirmation(email: string, jetonConfirmation: string, listes: string[]): Promise<boolean>
  /** Facultatif : prévient l'éditeur qu'une personne vient de confirmer. Au mieux : une erreur ou un délai dépassé n'empêchent jamais la confirmation. */
  prevenir?(abonne: NouvelAbonne): Promise<void>
  nouveauJeton(): string
  maintenant(): Date
  /** Version et texte exacts du consentement affiché sous la liste des veilles du formulaire. */
  consentement(): { version: string; texte: string }
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

/**
 * Inscription à une ou plusieurs veilles (`listes`, sans doublon) : une ligne, des jetons et un consentement par veille, mais UN SEUL e-mail de confirmation
 * qui les énumère toutes, et un seul clic pour les confirmer (voir `confirmer`). Une veille déjà confirmée, ou demandée il y a moins de 10 minutes, est
 * laissée de côté sans rien révéler : s'il n'en reste aucune à confirmer, aucun e-mail n'est envoyé.
 */
export async function inscrire(
  o: Outils,
  demande: { email: string; nom: string | null; profil: string; listes: string[] },
): Promise<ResultatInscription> {
  const maintenant = o.maintenant()
  const iso = maintenant.toISOString()
  const consentement = o.consentement()
  const aConfirmer: { liste: string; jeton: string }[] = []
  let dejaConfirmee = false

  for (const liste of demande.listes) {
    const existant = await o.depot.trouverParEmailEtListe(demande.email, liste)
    if (existant?.statut === 'confirme') {
      dejaConfirmee = true
      continue
    }
    if (existant?.statut === 'en_attente' && maintenant.getTime() - Date.parse(existant.derniere_demande_le) < DELAI_RENVOI_MS) continue

    const jetonConfirmation = o.nouveauJeton()
    if (!existant) {
      await o.depot.creer({
        email: demande.email,
        liste,
        nom: demande.nom,
        profil: demande.profil,
        statut: 'en_attente',
        jeton_confirmation: jetonConfirmation,
        jeton_desinscription: o.nouveauJeton(),
        consentement_version: consentement.version,
        consentement_texte: consentement.texte,
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
        consentement_version: consentement.version,
        consentement_texte: consentement.texte,
        derniere_demande_le: iso,
        confirme_le: null,
        desinscrit_le: null,
      })
    }
    aConfirmer.push({ liste, jeton: jetonConfirmation })
  }

  if (aConfirmer.length === 0) return dejaConfirmee ? 'deja_confirme' : 'trop_tot'
  const envoye = await o.envoyerConfirmation(demande.email, aConfirmer[0].jeton, aConfirmer.map((a) => a.liste))
  return envoye ? 'confirmation_envoyee' : 'echec_envoi'
}

export type ResultatConfirmation = 'confirme' | 'deja_confirme' | 'expire' | 'invalide'

export async function confirmer(o: Outils, jeton: string): Promise<ResultatConfirmation> {
  const abonne = await o.depot.trouverParJetonConfirmation(jeton)
  if (!abonne) return 'invalide'
  if (abonne.statut === 'confirme') return 'deja_confirme'
  if (abonne.statut === 'desinscrit') return 'invalide'
  const maintenant = o.maintenant()
  if (maintenant.getTime() - Date.parse(abonne.derniere_demande_le) > DELAI_CONFIRMATION_MS) return 'expire'
  const iso = maintenant.toISOString()
  await o.depot.mettreAJour(abonne.id, { statut: 'confirme', confirme_le: iso })
  // Les autres veilles demandées avec celle-ci (même adresse, même instant de demande) sont énumérées dans le même e-mail : le même clic les confirme.
  const memeDemande = (await o.depot.listerParEmail(abonne.email)).filter(
    (a) => a.id !== abonne.id && a.statut === 'en_attente' && a.derniere_demande_le === abonne.derniere_demande_le,
  )
  for (const autre of memeDemande) await o.depot.mettreAJour(autre.id, { statut: 'confirme', confirme_le: iso })
  if (o.prevenir) await alerter(o, abonne, [abonne, ...memeDemande], iso)
  return 'confirme'
}

function signalerEchecAlerte(erreur: unknown): void {
  console.error('[veille] alerte « nouvel abonné » non envoyée :', erreur instanceof Error ? erreur.message : 'erreur')   // jamais l'adresse de la personne
}

/** Prévient l'éditeur d'une nouvelle confirmation. N'échoue jamais : l'inscription est déjà enregistrée, l'alerte n'est qu'un confort. */
async function alerter(o: Outils, abonne: Abonne, confirmees: Abonne[], confirmeLe: string): Promise<void> {
  let minuteur: ReturnType<typeof setTimeout> | undefined
  try {
    const effectifs: Record<string, number> = {}
    for (const a of confirmees) effectifs[a.liste] = (await o.depot.lister(a.liste)).filter((x) => x.statut === 'confirme').length
    // l'erreur est rattachée tout de suite : si le délai l'emporte, l'alerte qui échoue plus tard ne doit pas devenir une erreur non gérée
    const alerte = Promise.resolve(o.prevenir!({ email: abonne.email, nom: abonne.nom, profil: abonne.profil, listes: confirmees.map((a) => a.liste), confirme_le: confirmeLe, effectifs }))
      .catch(signalerEchecAlerte)
    const delai = new Promise<void>((resolve) => { minuteur = setTimeout(resolve, DELAI_ALERTE_MS) })
    await Promise.race([alerte, delai])
  } catch (erreur) {
    signalerEchecAlerte(erreur)
  } finally {
    if (minuteur) clearTimeout(minuteur)
  }
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

export async function exporter(o: Outils, liste: string): Promise<Export> {
  const tous = await o.depot.lister(liste)
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

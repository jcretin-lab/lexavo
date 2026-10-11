// Les veilles Lexavo (une « liste » d'abonnés par newsletter). Aucun import : module pur, testé par `npm test` (voir listes.test.ts).
//
// Une veille n'accepte d'inscriptions que si `ouverte` est vrai. Les autres sont préparées mais dormantes : leur page n'est pas en ligne et
// la route d'inscription les refuse. Pour en ouvrir une : relecteur du domaine ayant validé sa liste de textes, puis `ouverte: true` ici
// et déploiement (voir notes/activation-newsletters.md du projet de veille). Les `slug` sont ceux de config/newsletters/<slug>.toml du projet de veille.

export type Liste = {
  slug: string
  /** Nom affiché (formulaire, e-mail de confirmation). */
  nom: string
  /** Ce que reçoit l'abonné, pour l'e-mail de confirmation (complète « la veille Lexavo tous les quinze jours : »). */
  description: string
  ouverte: boolean
}

export const LISTE_PAR_DEFAUT = 'baux-copropriete'

export const LISTES: readonly Liste[] = [
  {
    slug: 'baux-copropriete',
    nom: "Baux d'habitation et copropriété",
    description: "les arrêts récents qui citent les textes sur les baux d'habitation et la copropriété, et les modifications de ces textes quand il y en a",
    ouverte: true,
  },
  {
    slug: 'baux-commerciaux-fonds',
    nom: 'Baux commerciaux et fonds de commerce',
    description: 'les arrêts récents qui citent le Code de commerce sur le fonds de commerce et le bail commercial, et les modifications de ces articles quand il y en a',
    ouverte: false,
  },
  {
    slug: 'construction-urbanisme',
    nom: 'Construction et urbanisme',
    description: "les arrêts récents qui citent les textes de la construction et de l'urbanisme, et les modifications de ces textes quand il y en a",
    ouverte: false,
  },
  {
    slug: 'assurance-dommage-corporel',
    nom: 'Assurance, responsabilité civile et dommage corporel',
    description: 'les arrêts récents qui citent le Code des assurances, la loi du 5 juillet 1985 et le Code civil sur la responsabilité, et les modifications de ces textes quand il y en a',
    ouverte: false,
  },
  {
    slug: 'societes-cessions',
    nom: "Sociétés et cessions d'entreprise",
    description: 'les arrêts récents qui citent le Code de commerce sur les sociétés et les fonds de commerce, et le Code civil sur la société et la vente, et les modifications de ces textes quand il y en a',
    ouverte: false,
  },
  {
    slug: 'entreprises-en-difficulte',
    nom: 'Entreprises en difficulté',
    description: 'les arrêts récents qui citent le livre VI du Code de commerce, et les modifications de ces articles quand il y en a',
    ouverte: false,
  },
  {
    slug: 'contrats-cour-de-cassation',
    nom: 'Contrats, Cour de cassation',
    description: 'les arrêts récents de la Cour de cassation sur le droit commun des contrats, et les modifications des articles 1101 à 1233 du Code civil',
    ouverte: false,
  },
]

export function trouverListe(slug: unknown): Liste | null {
  return typeof slug === 'string' ? (LISTES.find((l) => l.slug === slug) ?? null) : null
}

/** Liste demandée par un formulaire : absente ou vide = la veille d'origine ; sinon elle doit exister ET être ouverte aux inscriptions. */
export function listeOuverte(valeur: unknown): Liste | null {
  if (valeur === undefined || valeur === null || valeur === '') return trouverListe(LISTE_PAR_DEFAUT)
  const liste = trouverListe(valeur)
  return liste?.ouverte ? liste : null
}

export const CONSENTEMENT_VERSION_LISTE = '2026-10-v3'

/**
 * Texte EXACT du consentement affiché sur le formulaire d'une liste, enregistré comme preuve. Celui de la veille d'origine est inchangé depuis la
 * version 2026-10-v3 ; les autres suivent le même modèle avec le nom de la veille. Le formulaire de chaque page doit afficher ce texte à l'identique.
 */
export function consentementPour(liste: Liste): { version: string; texte: string } {
  const objet = liste.slug === LISTE_PAR_DEFAUT ? 'la veille Lexavo' : `la veille Lexavo « ${liste.nom} »`
  return {
    version: CONSENTEMENT_VERSION_LISTE,
    texte: `J'accepte de recevoir ${objet} par e-mail, tous les quinze jours. Mon adresse sert uniquement à cet envoi, et je peux me désinscrire à tout moment, en un clic.`,
  }
}

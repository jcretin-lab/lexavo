// Les veilles Lexavo (une « liste » d'abonnés par newsletter). Aucun import : module pur, testé par `npm test` (voir listes.test.ts).
//
// Une veille n'accepte d'inscriptions que si `ouverte` est vrai : la route d'inscription refuse les autres, et leur case est grisée « Bientôt » sur la
// page de veille.lexavo.fr. Les veilles présentées sont toutes ouvertes depuis le 12 octobre 2026 (demande de l'utilisatrice ou de l'utilisateur, avant la relecture
// de leur liste de textes par un avocat du domaine). `ouverte` doit rester égal au statut « actif » de config/newsletters/<slug>.toml du projet de veille
// (scripts/phase7/verifier_listes.py le contrôle ; voir notes/activation-newsletters.md). Les `slug` sont ceux de ces fichiers.

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
    description: "les arrêts récents de la Cour de cassation qui citent les textes sur les baux d'habitation et la copropriété, et les modifications de ces textes quand il y en a",
    ouverte: true,
  },
  // Regroupements du 11 octobre 2026 : « baux commerciaux et fonds » rejoint les sociétés, « construction et urbanisme » rejoint l'assurance.
  // La veille « entreprises en difficulté » (livre VI du Code de commerce) a été supprimée le 13 octobre 2026, sans abonné confirmé.
  {
    slug: 'societes-fonds-baux-commerciaux',
    nom: 'Sociétés, fonds de commerce et baux commerciaux',
    description: 'les arrêts récents de la Cour de cassation qui citent le Code de commerce sur les sociétés, les fonds de commerce et les baux commerciaux, et le Code civil sur la société et la vente, et les modifications de ces textes quand il y en a',
    ouverte: true,
  },
  {
    slug: 'assurance-responsabilite-construction',
    nom: 'Assurance, responsabilité et construction',
    description: 'les arrêts récents de la Cour de cassation qui citent le Code des assurances, la loi du 5 juillet 1985, la responsabilité civile et les textes de la construction, et les modifications de ces textes quand il y en a',
    ouverte: true,
  },
  {
    slug: 'contrats-cour-de-cassation',
    nom: 'Contrats, Cour de cassation',
    description: 'les arrêts récents de la Cour de cassation qui citent le droit commun des contrats, et les modifications des articles 1101 à 1233 du Code civil quand il y en a',
    ouverte: true,
  },
  // Ouverte le 13 octobre 2026, avant la relecture de sa liste d'articles par un avocat en droit de la famille et un notaire.
  {
    slug: 'famille-regimes-successions',
    nom: 'Famille, régimes matrimoniaux et successions',
    description: "les arrêts récents de la Cour de cassation qui citent les articles du Code civil sur le mariage, le divorce, la filiation, l'autorité parentale, la protection des majeurs, les successions, les libéralités et les régimes matrimoniaux, et les modifications de ces articles quand il y en a",
    ouverte: true,
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

/**
 * Texte EXACT du consentement affiché sous la liste des veilles du formulaire (une seule page d'inscription pour toutes les veilles, avec une case par
 * veille), enregistré comme preuve avec chaque inscription. Les veilles choisies sont les lignes enregistrées (une par veille cochée). La page doit
 * afficher ce texte à l'identique (scripts/phase7/verifier_listes.py du projet de veille le vérifie).
 * Versions : 2026-10-v3 = « la veille Lexavo » (une seule veille, avant le 12 octobre 2026) ; 2026-10-v4 = formulaire à choix multiple.
 */
export const CONSENTEMENT = {
  version: '2026-10-v4',
  texte:
    "J'accepte de recevoir par e-mail, tous les quinze jours, la ou les veilles Lexavo cochées ci-dessus. Mon adresse sert uniquement à ces envois, et je peux me désinscrire à tout moment, en un clic.",
} as const

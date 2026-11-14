// Offre « création de sites internet pour avocats » : source unique des forfaits, prix et délais.
// Modifier ici met à jour la page d'accueil, la page contact (liste des forfaits) et les CGV.
//
// ⚠ PRIX PROVISOIRES — à valider avant mise en production.

export type Forfait = {
  id: 'essentiel' | 'cabinet' | 'sur-mesure'
  nom: string
  prix: string          // affiché tel quel (« à partir de » géré par `aPartirDe`)
  aPartirDe: boolean
  accroche: string
  inclus: string[]
  delai: string
  misEnAvant?: boolean
}

export const FORFAITS: Forfait[] = [
  {
    id: 'essentiel',
    nom: 'Essentiel',
    prix: '1 490 €',
    aPartirDe: true,
    accroche: 'Une présence en ligne claire et professionnelle.',
    inclus: [
      "Site vitrine jusqu'à 5 pages (accueil, cabinet, domaines d'intervention, honoraires, contact)",
      'Design sur mesure aux couleurs du cabinet',
      'Adapté au mobile et rapide à charger',
      'Mentions légales et politique de confidentialité',
      'Formulaire de contact et plan d’accès',
      'Référencement de base (balises, sitemap, Google Search Console)',
    ],
    delai: '3 semaines',
  },
  {
    id: 'cabinet',
    nom: 'Cabinet',
    prix: '2 490 €',
    aPartirDe: true,
    accroche: 'Le site complet, textes rédigés pour vous.',
    inclus: [
      "Tout le forfait Essentiel, jusqu'à 10 pages",
      'Rédaction des textes à partir d’un entretien avec vous',
      'Une page par domaine d’intervention',
      'Référencement local (fiche Google Business Profile, ville, barreau)',
      'Blog ou rubrique « actualités » prête à l’emploi',
      'Prise de rendez-vous en ligne',
    ],
    delai: '4 à 5 semaines',
    misEnAvant: true,
  },
  {
    id: 'sur-mesure',
    nom: 'Sur mesure',
    prix: 'Sur devis',
    aPartirDe: false,
    accroche: 'Pour les cabinets aux besoins spécifiques.',
    inclus: [
      'Cabinets à plusieurs associés ou plusieurs bureaux',
      'Site bilingue ou multilingue',
      'Refonte et reprise d’un site existant',
      'Fonctionnalités particulières (espace documents, paiement de consultation…)',
    ],
    delai: 'Selon le projet',
  },
]

export const MAINTENANCE = {
  prix: '49 € / mois',
  inclus: 'Hébergement, nom de domaine, certificat HTTPS, sauvegardes, mises à jour de sécurité et petites modifications de contenu.',
}

export const MENTION_TVA = 'TVA non applicable, art. 293 B du CGI.'

export const EMAIL_CONTACT = 'contact@lexavo.fr'

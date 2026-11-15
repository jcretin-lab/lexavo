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
    prix: '890 €',
    aPartirDe: true,
    accroche: 'Une présence en ligne claire et professionnelle.',
    inclus: [
      'Jusqu’à 3 pages',
      'Design adapté et travaillé avec vous',
      'Formulaire de contact inclus',
      'Module : édition des textes',
      'Hébergement et nom de domaine à votre nom',
    ],
    delai: '2 semaines',
  },
  {
    id: 'cabinet',
    nom: 'Cabinet',
    prix: '1 990 €',
    aPartirDe: true,
    accroche: 'Le site complet, avec blog et référencement.',
    inclus: [
      'Jusqu’à 10 pages, une page par domaine d’intervention',
      'Design adapté et travaillé avec vous',
      'Formulaire de contact inclus',
      'Référencement SEO et GEO travaillé page par page, et référencement local',
      'Module : édition des textes + blog + SEO/GEO',
      'Hébergement et nom de domaine à votre nom',
    ],
    delai: '3 à 4 semaines',
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

export const MENTION_TVA = 'TVA non applicable, art. 293 B du CGI.'

export const EMAIL_CONTACT = 'contact@lexavo.fr'

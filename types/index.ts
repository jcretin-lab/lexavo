export type Plan = 'trial' | 'essentiel' | 'pro' | 'cabinet'

export interface Cabinet {
  id: string
  user_id: string
  nom: string
  specialites: string[]
  ville: string
  barreau: string
  site_web?: string
  stripe_customer_id?: string
  stripe_subscription_id?: string
  plan: Plan
  max_membres: number
  make_webhook_url?: string | null
  created_at: string
}

export interface Membre {
  id: string
  cabinet_id: string
  user_id?: string | null
  nom: string
  email: string
  role: 'admin' | 'membre'
  statut: 'invite' | 'actif'
  created_at: string
}

export interface PostLinkedin {
  texte: string
  hashtags: string[]
}

export interface ArticleBlog {
  titre: string
  meta_description: string
  contenu: string
  mots_cles: string[]
  slug?: string
  alt_image?: string
  reading_time?: number
}

export interface FaqItem {
  question: string
  reponse: string
}

export interface GenerationContent {
  article_blog: ArticleBlog
  posts_linkedin: PostLinkedin[]
  faq: FaqItem[]
  prompt_image: string
}

export interface Generation {
  id: string
  cabinet_id: string
  theme: string
  specialite: string
  article_blog?: ArticleBlog
  posts_linkedin?: PostLinkedin[]
  faq?: FaqItem[]
  image_url?: string
  statut: 'brouillon' | 'publie' | 'programme'
  date_publication?: string
  created_at: string
}

export type Ton = 'Pédagogique' | 'Rassurant' | 'Expert' | 'Accessible'

export const SPECIALITES = [
  'Droit de la famille',
  'Droit du travail',
  'Droit immobilier',
  'Droit des successions',
  'Droit pénal',
  'Droit des affaires',
  'Droit administratif',
  'Autre',
] as const

export const BARREAUX_FR = [
  'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Nantes', 'Strasbourg',
  'Lille', 'Nice', 'Rennes', 'Grenoble', 'Montpellier', 'Versailles', 'Aix-en-Provence',
  'Rouen', 'Metz', 'Reims', 'Saint-Étienne', 'Toulon', 'Caen', 'Clermont-Ferrand',
  'Dijon', 'Angers', 'Brest', 'Amiens', 'Tours', 'Limoges', 'Besançon', 'Nîmes',
  'Pau', 'Perpignan', 'Mulhouse', 'Nancy', 'Valenciennes', 'Orléans', 'Avignon',
  'Ajaccio', 'Bastia', 'Fort-de-France', 'Cayenne', 'Pointe-à-Pitre', 'Saint-Denis de La Réunion',
] as const

export const NOM_PAR_PLAN: Record<Plan, string> = {
  trial: 'Essai gratuit',
  essentiel: 'Essentiel',
  pro: 'Pro',
  cabinet: 'Cabinet',
}

export const PRIX_PAR_PLAN: Record<Exclude<Plan, 'trial'>, string> = {
  essentiel: '49 €/mois',
  pro: '69 €/mois',
  cabinet: '149 €/mois',
}

export const MAX_MEMBRES_PAR_PLAN: Record<Plan, number> = {
  trial: 1,
  essentiel: 1,
  pro: 1,
  cabinet: 3,
}

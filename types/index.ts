export type Plan = 'trial' | 'pro' | 'cabinet'

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

// On ne genere plus qu'une seule image (style "conceptuelle"). Les anciens records
// peuvent contenir d'autres styles ('humains', 'photorealiste') dans le JSONB,
// mais ils ne sont plus produits ni affiches.
export type ImageStyle = 'conceptuelle'

// L'utilisateur peut egalement uploader sa propre image, stockee sous la cle 'personnalisee'.
export type ImageSlot = ImageStyle | 'personnalisee'

export interface ImagePromptSpec {
  style: ImageStyle
  keywords?: string
  prompt: string
}

export type ImagesByStyle = Partial<Record<ImageSlot, string | null>>

export interface GenerationContent {
  article_blog: ArticleBlog
  posts_linkedin: PostLinkedin[]
  faq: FaqItem[]
  prompts_images: ImagePromptSpec[]
}

export interface Generation {
  id: string
  cabinet_id: string
  theme: string
  specialite: string
  article_blog?: ArticleBlog
  posts_linkedin?: PostLinkedin[]
  faq?: FaqItem[]
  image_url?: string | null
  images?: ImagesByStyle | null
  image_selectionnee?: string | null
  statut: 'brouillon' | 'publie' | 'programme'
  date_publication?: string
  created_at: string
}

export const IMAGE_STYLE_LABELS: Record<ImageSlot, string> = {
  conceptuelle: 'Conceptuelle',
  personnalisee: 'La mienne',
}

export const IMAGE_STYLE_ORDER: ImageStyle[] = ['conceptuelle']

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
  pro: 'Pro',
  cabinet: 'Cabinet',
}

export const PRIX_PAR_PLAN: Record<Exclude<Plan, 'trial'>, string> = {
  pro: '49 €/mois',
  cabinet: '119 €/mois',
}

export const MAX_MEMBRES_PAR_PLAN: Record<Plan, number> = {
  trial: 1,
  pro: 1,
  cabinet: 3,
}

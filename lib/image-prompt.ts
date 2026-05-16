// Dictionnaires + helpers pour construire le prompt final envoyé à gpt-image-1.
// 3 axes indépendants (scène / cadrage / lumière) choisis par Claude → 64 variantes
// possibles, tout en conservant la signature visuelle Lexavo.

export const SCENE_KEYS = ['office_desk', 'environment', 'domestic', 'client_space'] as const
export const FRAMING_KEYS = ['flat_lay', 'close_up_50mm', 'wide_context', 'macro_detail'] as const
export const LIGHTING_KEYS = [
  'morning_window',
  'golden_hour',
  'evening_lamp',
  'overcast_daylight',
] as const

export type SceneKey = (typeof SCENE_KEYS)[number]
export type FramingKey = (typeof FRAMING_KEYS)[number]
export type LightingKey = (typeof LIGHTING_KEYS)[number]

const SCENE_DESC: Record<SceneKey, string> = {
  office_desk: 'Staged on a wooden desk inside a French law office',
  environment:
    'Wide public location tied to the topic (storefront, building lobby, parking lot, courthouse exterior, empty meeting room)',
  domestic:
    'Sober French domestic interior tied to the topic (entryway, living-room corner, home desk, kitchen)',
  client_space:
    "Client's professional space tied to the topic (workshop, showroom, retail counter, medical waiting room, HR office)",
}

const FRAMING_DESC: Record<FramingKey, string> = {
  flat_lay: 'Flat-lay 90° top-down view, graphic composition',
  close_up_50mm: '50mm close-up, 2 to 3 objects filling about 70% of the frame',
  wide_context: 'Wide-context shot where the environment contributes to the meaning',
  macro_detail: 'Macro detail of a single object, texture highlighted',
}

const LIGHTING_DESC: Record<LightingKey, string> = {
  morning_window: 'Soft morning window light',
  golden_hour: 'Late-afternoon golden-hour light, warm raking light',
  evening_lamp: 'Evening desk-lamp glow with deep shadows',
  overcast_daylight: 'Overcast diffuse daylight, soft and almost shadowless',
}

// Charte visuelle non négociable : palette, qualité, absence de personne et de texte.
const BRAND_SUFFIX =
  'Editorial photographic composition, cinematic depth of field, fine realistic textures, palette of navy blue, off-white and brushed gold accents. Magazine editorial quality (Le Monde, Les Echos, Forbes France style). No people in frame, no legible text on any document or screen (papers and screens are blank or blurred). Wide format 16:9.'

export interface SceneChoice {
  scene: SceneKey
  framing: FramingKey
  lighting: LightingKey
}

export const DEFAULT_SCENE_CHOICE: SceneChoice = {
  scene: 'office_desk',
  framing: 'flat_lay',
  lighting: 'morning_window',
}

function isKey<T extends string>(value: unknown, keys: readonly T[]): value is T {
  return typeof value === 'string' && (keys as readonly string[]).includes(value)
}

export function normalizeSceneChoice(raw: {
  scene?: unknown
  framing?: unknown
  lighting?: unknown
}): SceneChoice {
  return {
    scene: isKey(raw.scene, SCENE_KEYS) ? raw.scene : DEFAULT_SCENE_CHOICE.scene,
    framing: isKey(raw.framing, FRAMING_KEYS) ? raw.framing : DEFAULT_SCENE_CHOICE.framing,
    lighting: isKey(raw.lighting, LIGHTING_KEYS) ? raw.lighting : DEFAULT_SCENE_CHOICE.lighting,
  }
}

export function buildImageSuffix(choice: SceneChoice): string {
  return ` ${SCENE_DESC[choice.scene]}. ${FRAMING_DESC[choice.framing]}. ${LIGHTING_DESC[choice.lighting]}. ${BRAND_SUFFIX}`
}

// Bloc inséré dans les prompts système envoyés à Claude pour qu'il choisisse
// scene/framing/lighting et écrive un prompt visuel sans répéter le décor ni
// la signature de marque (qui sont ajoutés automatiquement par buildImageSuffix).
export const SCENE_INSTRUCTIONS_FR = `MISE EN SCÈNE — choisir 1 valeur dans CHACUNE des 3 listes, en veillant à ce que la combinaison soit physiquement plausible.

SCÈNE :
- "office_desk" : bureau en bois d'un cabinet d'avocat français
- "environment" : lieu public lié au sujet (vitrine de commerce, hall d'immeuble, parking, palais de justice extérieur, salle de réunion vide…)
- "domestic" : intérieur domestique sobre lié au sujet (entrée, coin salon, bureau à la maison, cuisine…)
- "client_space" : espace professionnel du client lié au sujet (atelier, salle d'exposition, comptoir de commerce, salle d'attente médicale, bureau RH…)

CADRAGE :
- "flat_lay" : vue plongée à 90°, composition graphique
- "close_up_50mm" : plan rapproché 50mm, 2-3 objets occupent ~70% du cadre
- "wide_context" : plan large, l'environnement contribue au sens
- "macro_detail" : un seul objet ultra rapproché, texture mise en avant

LUMIÈRE :
- "morning_window" : lumière de fenêtre tamisée du matin
- "golden_hour" : fin d'après-midi, lumière chaude rasante
- "evening_lamp" : lumière de lampe de bureau le soir, ombres profondes
- "overcast_daylight" : jour gris doux, sans ombres marquées

Le champ "prompt" (60 mots max, anglais) doit décrire UNIQUEMENT les 2 ou 3 éléments visuels concrets du sujet — ne PAS y répéter le décor, le cadrage, la lumière ni la palette : ils seront ajoutés automatiquement à partir des 3 clés ci-dessus.`

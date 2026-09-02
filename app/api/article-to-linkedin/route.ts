import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { type ImageStyle, type ImagesByStyle, IMAGE_STYLE_ORDER } from '@/types'
import { buildLinkedinRules, FAQ_STYLE_RULES, LEGAL_PRUDENCE_RULES } from '@/lib/prompts'
import {
  buildImageSuffix,
  normalizeSceneChoice,
  SCENE_INSTRUCTIONS_FR,
  DEFAULT_SCENE_CHOICE,
  type SceneChoice,
} from '@/lib/image-prompt'

export const maxDuration = 90

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// M1 — Verrou par cabinet pour éviter la race condition sur le quota trial
const inProgress = new Set<string>()

export async function POST(request: NextRequest) {
  console.log('[article-to-linkedin] Requête reçue')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, nom, plan, site_web')
    .eq('user_id', user.id)
    .single()

  if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })

  // M1 — Bloquer les requêtes simultanées pour le même cabinet
  if (inProgress.has(cabinet.id)) {
    return NextResponse.json({ error: 'Une génération est déjà en cours. Veuillez patienter.' }, { status: 429 })
  }

  if (cabinet.plan === 'trial') {
    const { count: totalCount } = await supabase
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('cabinet_id', cabinet.id)

    if ((totalCount ?? 0) >= 10) {
      return NextResponse.json(
        { error: "Vos 10 générations d'essai sont épuisées. Abonnez-vous pour continuer.", trial_exhausted: true },
        { status: 402 }
      )
    }
  }

  const body = await request.json()
  const { article, ton } = body

  if (!article || !ton) {
    return NextResponse.json({ error: 'Champs manquants : article, ton' }, { status: 400 })
  }

  const systemPrompt = `Tu es un expert en communication LinkedIn pour avocats français.
À partir de l'article juridique fourni, génère 3 posts LinkedIn distincts conformes à la déontologie du barreau français.

RÈGLES DÉONTOLOGIQUES :
- Interdit : promesse de résultat
- Interdit : comparaison avec confrères
- Obligatoire : appel à consultation en fin de post
- Ton : professionnel et accessible

${LEGAL_PRUDENCE_RULES}

RÈGLES TEMPORELLES ABSOLUES :
- Ne jamais mentionner une année (2024, 2025, 2026...) pour désigner "aujourd'hui" ou "actuellement". Utiliser des formulations intemporelles : "actuellement", "en vigueur", "depuis la loi de...", "à ce jour"
- Les années sont autorisées uniquement pour référencer un texte précis (ex : "la loi du 14 juin 2013", "le décret de 2008") ou une date historique identifiable
- Exemples interdits : "en 2024, la réglementation...", "depuis 2025...", "en cette année..."
- Exemples autorisés : "la loi Macron de 2015 prévoit...", "depuis la réforme des retraites de 2023..."

${buildLinkedinRules(ton)}

Génère aussi les MÉTADONNÉES pour publier l'article importé sur un blog d'avocat :
- titre : 60 à 70 caractères, clair et SEO, contient le mot-clé principal du sujet de l'article
- meta_description : 150 à 160 caractères, résume l'article et incite au clic
- mots_cles : 4 entrées exactement (1 mot-clé principal + 3 secondaires sémantiquement proches)
- alt_image : 50 à 100 caractères, descriptif visuel sans bourrage de mot-clé
Tu ne dois PAS réécrire ni résumer le corps de l'article : son contenu sera repris tel quel à partir du texte fourni.

Génère aussi 5 questions/réponses de FAQ juridique tirées de l'article.

${FAQ_STYLE_RULES}

Génère aussi 1 prompt en anglais pour une image professionnelle (qualité magazine éditorial juridique type Le Monde, Les Échos, Forbes France).

OBJECTIF VISUEL : que le lecteur reconnaisse INSTANTANÉMENT le sujet juridique de l'article rien qu'en voyant l'image.

ÉTAPE 1 — Identifie 2 ou 3 ÉLÉMENTS VISUELS CONCRETS tirés du sujet :
- OBJETS RÉELS du quotidien, pas des concepts abstraits
- immédiatement reconnaissables par un justiciable français
- évite "balance", "marteau", "livres reliés", "colonnes de tribunal" — ce sont des clichés vides

Exemples de mapping :
- "Licenciement pour faute grave" → badge d'accès retourné, carton de bureau avec affaires personnelles, lettre recommandée ouverte
- "Rupture brutale relations commerciales" → contrat déchiré en deux, poignée de main qui se sépare, calendrier biffé
- "Droit de rétractation" → enveloppe LRAR cachetée, calendrier marqué "14 jours", colis non ouvert avec bordereau
- "Divorce" → deux alliances séparées, deux clés sur des porte-clés différents, valise prête près de la porte
- "Bail commercial" → vitrine de commerce, clés de boutique, contrat de bail tamponné
- "Succession" → horloge familiale, dossier notarié relié, coffre de famille ouvert
- "Avis Google diffamatoire" → écran d'ordinateur affichant une note 1 étoile, smartphone, capture d'écran imprimée

ÉTAPE 2 — Choisis la mise en scène (3 axes ci-dessous) puis rédige le prompt "conceptuelle" en anglais (60 mots max) autour des éléments visuels uniquement.

${SCENE_INSTRUCTIONS_FR}

INTERDIT dans le prompt anglais : "minimalist", "single object", "flat illustration", "icon", "vast empty background", "abstract".

Génère UNIQUEMENT un JSON valide, sans markdown, sans texte avant ou après :
{
  "article_blog": {
    "titre": "string (60-70 caractères, contient le mot-clé principal)",
    "meta_description": "string (150-160 caractères)",
    "mots_cles": ["mot-clé principal", "secondaire 1", "secondaire 2", "secondaire 3"],
    "alt_image": "string (50-100 caractères)"
  },
  "posts_linkedin": [
    { "angle": "string (un des 8 angles proposés)", "texte": "string" },
    { "angle": "string (un des 8 angles proposés)", "texte": "string" },
    { "angle": "string (un des 8 angles proposés)", "texte": "string" }
  ],
  "faq": [
    { "question": "string", "reponse": "string (2-3 phrases)" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" }
  ],
  "prompts_images": [
    {
      "style": "conceptuelle",
      "keywords": "string (2 à 3 expressions visuelles concrètes en anglais, séparées par virgule)",
      "prompt": "string (60 mots max, anglais — UNIQUEMENT les éléments visuels, sans répéter décor, cadrage, lumière ni palette)",
      "scene": "office_desk | environment | domestic | client_space",
      "framing": "flat_lay | close_up_50mm | wide_context | macro_detail",
      "lighting": "morning_window | golden_hour | evening_lamp | overcast_daylight"
    }
  ]
}`

  type ApiResult = {
    article_blog?: {
      titre?: string
      meta_description?: string
      mots_cles?: string[]
      alt_image?: string
    }
    posts_linkedin: Array<{ angle: string; texte: string; hashtags?: string[] }>
    faq?: Array<{ question?: string; reponse?: string }>
    prompts_images: Array<{
      style?: string
      keywords?: string
      prompt?: string
      scene?: string
      framing?: string
      lighting?: string
    }>
  }

  function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  }

  function slugify(s: string): string {
    return s
      .normalize('NFD').replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
  }

  function articleToHtml(raw: string): string {
    const paragraphs = raw
      .split(/\n{2,}/)
      .map(p => p.replace(/\s+\n/g, '\n').trim())
      .filter(p => p.length > 0)
    return paragraphs
      .map(p => `<p>${escapeHtml(p).replace(/\n/g, '<br />')}</p>`)
      .join('\n')
  }

  inProgress.add(cabinet.id)
  let result: ApiResult | null = null

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4500,
          system: systemPrompt,
          messages: [{ role: 'user', content: `ARTICLE :\n\n${article}` }],
        })

        const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
        const cleaned = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
        result = JSON.parse(cleaned) as ApiResult
        break
      } catch (err) {
        console.error(`[article-to-linkedin] Tentative ${attempt + 1} échouée :`, err)
        if (attempt === 1) {
          return NextResponse.json({ error: 'Erreur lors de la génération. Réessayez.' }, { status: 500 })
        }
      }
    }

    if (!result) return NextResponse.json({ error: 'Contenu non généré' }, { status: 500 })

    // M1 — Re-vérification atomique du quota trial juste avant l'insertion
    if (cabinet.plan === 'trial') {
      const { count: finalCount } = await supabase
        .from('generations')
        .select('id', { count: 'exact', head: true })
        .eq('cabinet_id', cabinet.id)

      if ((finalCount ?? 0) >= 10) {
        return NextResponse.json(
          { error: "Vos 10 générations d'essai sont épuisées. Abonnez-vous pour continuer.", trial_exhausted: true },
          { status: 402 }
        )
      }
    }

    // Sujet de l'article reduit a un theme exploitable dans les prompts/fallback.
    const rawTheme = article.trim().slice(0, 80)
    const theme = rawTheme + (article.trim().length > 80 ? '…' : '')

    // 1 seul style genere via gpt-image-1. Le suffixe technique est désormais dynamique :
    // construit à partir des 3 axes (scène/cadrage/lumière) choisis par Claude.
    type GptImageConfig = {
      model: 'gpt-image-1'
      size: '1536x1024'
      quality: 'low' | 'medium' | 'high'
    }
    const STYLE_CONFIG: Record<ImageStyle, GptImageConfig> = {
      conceptuelle: { model: 'gpt-image-1', size: '1536x1024', quality: 'medium' },
    }
    const FALLBACK_VISUAL: Record<ImageStyle, string> = {
      conceptuelle: `Two or three concrete objects tied to the topic of the article ("${theme}").`,
    }

    const prompts: Record<ImageStyle, string> = { conceptuelle: '' }
    const sceneChoices: Record<ImageStyle, SceneChoice> = { conceptuelle: DEFAULT_SCENE_CHOICE }

    if (Array.isArray(result.prompts_images)) {
      for (const item of result.prompts_images) {
        if (item?.style && IMAGE_STYLE_ORDER.includes(item.style as ImageStyle)) {
          const style = item.style as ImageStyle
          const visualCore = (item.prompt?.trim()) || FALLBACK_VISUAL[style]
          const keywords = item.keywords?.trim()
          // Les mots-cles visuels sont concaténés en tete pour que gpt-image-1 leur donne plus de poids.
          prompts[style] = keywords ? `Visual focus: ${keywords}. ${visualCore}` : visualCore
          sceneChoices[style] = normalizeSceneChoice({
            scene: item.scene,
            framing: item.framing,
            lighting: item.lighting,
          })
        }
      }
    }
    // Si Claude n'a renvoyé aucun prompt pour un style attendu, on remplit avec le fallback.
    for (const style of IMAGE_STYLE_ORDER) {
      if (!prompts[style]) prompts[style] = FALLBACK_VISUAL[style]
    }

    const cabinetId = cabinet.id
    async function storeBuffer(buffer: Buffer | ArrayBuffer, style: ImageStyle): Promise<string | null> {
      const fileName = `${cabinetId}/${Date.now()}-${style}.png`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, buffer, { contentType: 'image/png', upsert: false })
      if (uploadError || !uploadData) return null
      const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
      return urlData.publicUrl
    }

    async function generateAndStore(style: ImageStyle, prompt: string): Promise<string | null> {
      const cfg = STYLE_CONFIG[style]
      const suffix = buildImageSuffix(sceneChoices[style])
      try {
        const resp = await openai.images.generate({
          model: cfg.model,
          prompt: prompt + suffix,
          size: cfg.size,
          quality: cfg.quality,
          n: 1,
        })
        const b64 = resp.data?.[0]?.b64_json
        if (!b64) return null
        const buf = Buffer.from(b64, 'base64')
        return await storeBuffer(buf, style)
      } catch (err) {
        console.error(`[article-to-linkedin] Erreur image (${style}, ${cfg.model}) :`, err)
        return null
      }
    }

    const conceptuelle = await generateAndStore('conceptuelle', prompts.conceptuelle)
    const images: ImagesByStyle = { conceptuelle }
    const defaultImageUrl = conceptuelle ?? null

    const postsLinkedin = result.posts_linkedin.map(({ texte }) => ({ texte, hashtags: [] as string[] }))
    const faq = Array.isArray(result.faq)
      ? result.faq
          .filter((item): item is { question: string; reponse: string } =>
            !!item && typeof item.question === 'string' && typeof item.reponse === 'string'
          )
          .map(({ question, reponse }) => ({ question, reponse }))
      : []

    // Reprise de l'article importé tel quel dans l'onglet "Article de blog",
    // enrichi des métadonnées (titre, meta, mots-clés, alt_image) fournies par Claude.
    const articleRaw = (article as string).trim()
    const contenuHtml = articleToHtml(articleRaw)
    const wordCount = articleRaw.split(/\s+/).filter(Boolean).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))
    const meta = result.article_blog ?? {}
    const titre = (typeof meta.titre === 'string' && meta.titre.trim()) || theme
    const metaDescription =
      (typeof meta.meta_description === 'string' && meta.meta_description.trim()) ||
      articleRaw.slice(0, 160)
    const motsCles = Array.isArray(meta.mots_cles) && meta.mots_cles.length > 0
      ? meta.mots_cles.filter((m): m is string => typeof m === 'string' && m.trim().length > 0)
      : []
    const altImage = (typeof meta.alt_image === 'string' && meta.alt_image.trim()) || titre
    const articleBlog = {
      titre,
      meta_description: metaDescription,
      contenu: contenuHtml,
      mots_cles: motsCles,
      slug: slugify(titre),
      alt_image: altImage,
      reading_time: readingTime,
    }

    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        cabinet_id: cabinet.id,
        theme,
        specialite: 'Article importé',
        article_blog: articleBlog,
        posts_linkedin: postsLinkedin,
        faq,
        image_url: defaultImageUrl,
        images,
        image_selectionnee: defaultImageUrl,
        statut: 'brouillon',
      })
      .select()
      .single()

    if (dbError) {
      console.error('[article-to-linkedin] Erreur DB :', dbError)
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ generation, images, image_selectionnee: defaultImageUrl })
  } finally {
    inProgress.delete(cabinet.id)
  }
}

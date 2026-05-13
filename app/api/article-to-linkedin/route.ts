import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { type ImageStyle, type ImagesByStyle, IMAGE_STYLE_ORDER } from '@/types'

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
    .select('id, nom, plan')
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

RÈGLES TEMPORELLES :
- Ne jamais mentionner une année pour désigner "aujourd'hui" ou "actuellement" — utiliser "actuellement", "en vigueur", "à ce jour"
- Les années sont autorisées uniquement pour référencer un texte précis (ex : "la loi du 14 juin 2013") ou une date historique identifiable

LES 3 POSTS DOIVENT AVOIR CES ANGLES DISTINCTS :
- Post 1 : angle pédagogique (expliquer le concept clé de l'article)
- Post 2 : angle cas pratique (situation concrète du justiciable)
- Post 3 : angle conseil (tip actionnable tiré de l'article)

Chaque post :
- 150-200 mots
- Ton souhaité : ${ton}
- Accroche forte en première ligne
- 3-5 hashtags juridiques pertinents
- Appel à consultation en conclusion

Génère aussi 5 questions/réponses de FAQ juridique tirées de l'article (questions concrètes que se pose un justiciable, réponses pédagogiques de 2-3 phrases conformes à la déontologie, sans avis juridique personnalisé).

Génère aussi 1 prompt en anglais pour une image professionnelle (qualité magazine éditorial juridique type Le Monde, Les Échos, Forbes France).

OBJECTIF VISUEL : que le lecteur reconnaisse INSTANTANÉMENT le sujet juridique de l'article rien qu'en voyant l'image.

ÉTAPE 1 — Identifie 3 ÉLÉMENTS VISUELS CONCRETS tirés du sujet :
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

ÉTAPE 2 — Rédige le prompt "conceptuelle" en anglais (60 mots max) autour de ces 3 éléments.

CONTRAINTES :
- composition éditoriale photographique mise en scène dans un vrai bureau d'avocat français
- 2 à 3 objets concrets disposés naturellement sur un bureau en bois sous lumière de fenêtre
- profondeur de champ cinématographique, textures réalistes, palette navy / off-white / touches d'or brossé
- aucune personne, aucun texte lisible (documents vierges ou flous)
- INTERDIT : "minimalist", "single object", "flat illustration", "icon", "vast empty background", "abstract"

Génère UNIQUEMENT un JSON valide, sans markdown, sans texte avant ou après :
{
  "posts_linkedin": [
    { "angle": "pedagogique", "texte": "string", "hashtags": ["string"] },
    { "angle": "cas_pratique", "texte": "string", "hashtags": ["string"] },
    { "angle": "conseil", "texte": "string", "hashtags": ["string"] }
  ],
  "faq": [
    { "question": "string", "reponse": "string (2-3 phrases)" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" }
  ],
  "prompts_images": [
    { "style": "conceptuelle", "keywords": "string (3 expressions visuelles concrètes en anglais, séparées par virgule)", "prompt": "string (60 mots max, anglais)" }
  ]
}`

  type ApiResult = {
    posts_linkedin: Array<{ angle: string; texte: string; hashtags: string[] }>
    faq?: Array<{ question?: string; reponse?: string }>
    prompts_images: Array<{ style?: string; keywords?: string; prompt?: string }>
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

    // 1 seul style genere via gpt-image-1
    type GptImageConfig = {
      model: 'gpt-image-1'
      suffix: string
      size: '1536x1024'
      quality: 'low' | 'medium' | 'high'
    }
    const STYLE_CONFIG: Record<ImageStyle, GptImageConfig> = {
      conceptuelle: {
        model: 'gpt-image-1',
        suffix:
          ' Editorial photographic composition staged in a real French law office. Show 2 to 3 concrete legal objects arranged naturally on a wooden desk under soft window light. Cinematic depth of field, fine realistic textures, warm professional tones with navy blue and brushed gold accents. Magazine editorial quality (Le Monde, Les Echos, Forbes France style). No people in frame. No legible text on any document, papers and screens are blank or blurred. Wide format 16:9.',
        size: '1536x1024',
        quality: 'medium',
      },
    }
    const FALLBACK_PROMPTS: Record<ImageStyle, string> = {
      conceptuelle: `An editorial photographic composition staged on a wooden desk in a French law office, evoking the topic of the article ("${theme}"). Two or three concrete objects tied to the topic placed naturally under window light. Realistic textures, cinematic depth of field, navy blue and gold accents, no people, no legible text.`,
    }

    const prompts: Record<ImageStyle, string> = { ...FALLBACK_PROMPTS }
    if (Array.isArray(result.prompts_images)) {
      for (const item of result.prompts_images) {
        if (item?.style && item?.prompt && IMAGE_STYLE_ORDER.includes(item.style as ImageStyle)) {
          // Les mots-cles visuels sont concaténés en tete pour que gpt-image-1 leur donne plus de poids.
          const keywords = item.keywords?.trim()
          prompts[item.style as ImageStyle] = keywords
            ? `Visual focus: ${keywords}. ${item.prompt}`
            : item.prompt
        }
      }
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
      try {
        const resp = await openai.images.generate({
          model: cfg.model,
          prompt: prompt + cfg.suffix,
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

    const postsLinkedin = result.posts_linkedin.map(({ texte, hashtags }) => ({ texte, hashtags }))
    const faq = Array.isArray(result.faq)
      ? result.faq
          .filter((item): item is { question: string; reponse: string } =>
            !!item && typeof item.question === 'string' && typeof item.reponse === 'string'
          )
          .map(({ question, reponse }) => ({ question, reponse }))
      : []

    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        cabinet_id: cabinet.id,
        theme,
        specialite: 'Article importé',
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

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

Génère aussi 2 prompts en anglais pour 2 images professionnelles distinctes.

RÈGLE ABSOLUE pour les prompts d'image : chacun des 2 prompts DOIT placer au centre de la scène un élément visuel CONCRET et SPÉCIFIQUE tiré directement du sujet de l'article fourni. Ne te contente PAS des classiques génériques (balance, marteau, livres reliés) sauf si l'article les évoque réellement. L'objectif est qu'un lecteur reconnaisse instantanément le sujet de l'article rien qu'en regardant l'image.

Exemples de traduction sujet → élément visuel central :
- "Licenciement pour faute grave" → un bureau vide, badge d'accès retourné, carton de déménagement
- "Rupture brutale de relations commerciales" → un contrat déchiré en deux, deux poignées de main qui se séparent
- "Droit de rétractation" → une enveloppe LRAR, un calendrier marqué "14 jours", un colis non ouvert
- "Divorce" → deux alliances séparées, deux clés sur des porte-clés différents
- "Bail commercial" → la vitrine d'un commerce avec un bail, une remise de clés
- "Succession / héritage" → une vieille horloge familiale, un dossier notarié relié

Identifie d'abord 2-3 éléments visuels SPÉCIFIQUES au sujet de l'article, puis construis les 2 prompts autour de ces éléments. Les 2 prompts partagent le MÊME élément central, traité différemment selon le style.

- "conceptuelle" : UNE seule icône/objet stylisé central qui évoque le sujet. Fond uni épuré, ÉNORMÉMENT d'espace vide autour. AUCUN autre élément décoratif. Pas de personnes. Pas de texte. Max 25 mots.
- "humains" : démarrer par "A candid photograph of one person…". UNE SEULE personne en interaction directe avec l'objet central (ex : un employé seul qui rend son badge, une avocate seule qui signe un document…). PAS de groupe. Tenue ordinaire et plausible, expression naturelle imparfaite, instant pris sur le vif. Lumière naturelle latérale. Arrière-plan flou. Aucun texte visible (écrans éteints, livres fermés, murs vides). Max 50 mots.

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
    { "style": "conceptuelle", "prompt": "string" },
    { "style": "humains", "prompt": "string" }
  ]
}`

  type ApiResult = {
    posts_linkedin: Array<{ angle: string; texte: string; hashtags: string[] }>
    faq?: Array<{ question?: string; reponse?: string }>
    prompts_images: Array<{ style?: string; prompt?: string }>
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

    type DalleConfig = {
      model: 'dall-e-3'
      suffix: string
      size: '1024x1024'
      quality: 'standard' | 'hd'
      style: 'vivid' | 'natural'
    }
    type GptImageConfig = {
      model: 'gpt-image-1'
      suffix: string
      size: '1536x1024'
      quality: 'low' | 'medium' | 'high'
    }
    const STYLE_CONFIG: Record<ImageStyle, DalleConfig | GptImageConfig> = {
      conceptuelle: {
        model: 'dall-e-3',
        suffix:
          ' Minimalist editorial illustration of a SINGLE central iconic subject only. Vast empty off-white background with abundant negative space around the subject. NO additional decorative elements, NO clutter, NO surrounding objects, NO secondary symbols. Strictly 2-3 colors total: navy blue, off-white, subtle gold accents. Single soft light source. Flat editorial poster style. Wide format 16:9. Completely textless image, no letters, no numbers, no labels, no writing of any kind anywhere.',
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      },
      humains: {
        model: 'gpt-image-1',
        suffix:
          ' Authentic candid photograph of an ordinary person. Real human anatomy with natural skin imperfections, asymmetric features, age-appropriate texture and pores, individual character. Authentic everyday clothing, not styled. Soft natural side light from a window. Slight imperfect framing, like a real snapshot. Photorealistic, indistinguishable from a real photograph. No visible text in the background (books, papers and signs have blank covers).',
        size: '1536x1024',
        quality: 'medium',
      },
    }
    const FALLBACK_PROMPTS: Record<ImageStyle, string> = {
      conceptuelle: `An editorial abstract composition illustrating the topic of the article ("${theme}"), with a central symbolic object visually evoking this specific topic, minimalist styling, navy blue and gold accents on a clean background, no people, no text.`,
      humains: `A candid photograph of one ordinary French professional in a situation directly related to "${theme}", realistic interaction with a concrete object tied to the topic, soft natural window light, authentic expression, no visible text.`,
    }

    const prompts: Record<ImageStyle, string> = { ...FALLBACK_PROMPTS }
    if (Array.isArray(result.prompts_images)) {
      for (const item of result.prompts_images) {
        if (item?.style && item?.prompt && IMAGE_STYLE_ORDER.includes(item.style as ImageStyle)) {
          prompts[item.style as ImageStyle] = item.prompt
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
        if (cfg.model === 'dall-e-3') {
          const resp = await openai.images.generate({
            model: 'dall-e-3',
            prompt: prompt + cfg.suffix,
            size: cfg.size,
            quality: cfg.quality,
            style: cfg.style,
            n: 1,
          })
          const tempUrl = resp.data?.[0]?.url
          if (!tempUrl) return null
          const r = await fetch(tempUrl)
          const buf = await r.arrayBuffer()
          return await storeBuffer(buf, style)
        } else {
          const resp = await openai.images.generate({
            model: 'gpt-image-1',
            prompt: prompt + cfg.suffix,
            size: cfg.size,
            quality: cfg.quality,
            n: 1,
          })
          const b64 = resp.data?.[0]?.b64_json
          if (!b64) return null
          const buf = Buffer.from(b64, 'base64')
          return await storeBuffer(buf, style)
        }
      } catch (err) {
        console.error(`[article-to-linkedin] Erreur image (${style}, ${cfg.model}) :`, err)
        return null
      }
    }

    const [conceptuelle, humains] = await Promise.all([
      generateAndStore('conceptuelle', prompts.conceptuelle),
      generateAndStore('humains', prompts.humains),
    ])
    const images: ImagesByStyle = { conceptuelle, humains }
    const defaultImageUrl = conceptuelle ?? humains ?? null

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

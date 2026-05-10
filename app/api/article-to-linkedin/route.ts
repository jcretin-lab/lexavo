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

    if ((totalCount ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Vos 3 générations d'essai sont épuisées. Abonnez-vous pour continuer.", trial_exhausted: true },
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

Génère aussi 3 prompts DALL-E 3 en anglais pour 3 images professionnelles distinctes.

RÈGLE ABSOLUE pour les prompts d'image : chacun des 3 prompts DOIT placer au centre de la scène un élément visuel CONCRET et SPÉCIFIQUE tiré directement du sujet de l'article fourni. Ne te contente PAS des classiques génériques (balance, marteau, livres reliés) sauf si l'article les évoque réellement. L'objectif est qu'un lecteur reconnaisse instantanément le sujet de l'article rien qu'en regardant l'image.

Exemples de traduction sujet → élément visuel central :
- "Licenciement pour faute grave" → un bureau vide, badge d'accès retourné, carton de déménagement
- "Rupture brutale de relations commerciales" → un contrat déchiré en deux, deux poignées de main qui se séparent
- "Droit de rétractation" → une enveloppe LRAR, un calendrier marqué "14 jours", un colis non ouvert
- "Divorce" → deux alliances séparées, deux clés sur des porte-clés différents
- "Bail commercial" → la vitrine d'un commerce avec un bail, une remise de clés
- "Succession / héritage" → une vieille horloge familiale, un dossier notarié relié

Identifie d'abord 2-3 éléments visuels SPÉCIFIQUES au sujet de l'article, puis construis les 3 prompts autour de ces éléments. Les 3 prompts partagent le MÊME élément central, traité différemment selon le style.

- "conceptuelle" : UNE seule icône/objet stylisé central qui évoque le sujet. Fond uni épuré, ÉNORMÉMENT d'espace vide autour. AUCUN autre élément décoratif. Pas de personnes. Pas de texte. Max 25 mots.
- "photorealiste" : démarrer par "A documentary photograph of…". UNE scène concrète sans personne avec UN objet/lieu central tiré du sujet, en avant-plan. ÉVITER livres avec dos visibles, panneaux, documents écrits, étiquettes — choisir des objets sans texte OU décrire toutes les surfaces comme vierges. Lumière naturelle nommée + faible profondeur de champ. Max 50 mots.
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
    { "style": "photorealiste", "prompt": "string" },
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

      if ((finalCount ?? 0) >= 3) {
        return NextResponse.json(
          { error: "Vos 3 générations d'essai sont épuisées. Abonnez-vous pour continuer.", trial_exhausted: true },
          { status: 402 }
        )
      }
    }

    // Sujet de l'article reduit a un theme exploitable dans les prompts/fallback.
    const rawTheme = article.trim().slice(0, 80)
    const theme = rawTheme + (article.trim().length > 80 ? '…' : '')

    const STYLE_CONFIG: Record<ImageStyle, {
      suffix: string
      quality: 'standard' | 'hd'
      style: 'vivid' | 'natural'
    }> = {
      conceptuelle: {
        suffix:
          ' Minimalist editorial illustration of a SINGLE central iconic subject only. Vast empty off-white background with abundant negative space around the subject. NO additional decorative elements, NO clutter, NO surrounding objects, NO secondary symbols. Strictly 2-3 colors total: navy blue, off-white, subtle gold accents. Single soft light source. Flat editorial poster style. Wide format 16:9. Completely textless image, no letters, no numbers, no labels, no writing of any kind anywhere.',
        quality: 'standard',
        style: 'vivid',
      },
      photorealiste: {
        suffix:
          ' Documentary photograph, shot on Sony A7IV with 35mm f/1.8 lens, Kodak Portra 400 film emulation, natural window light, shallow depth of field. Completely textless image: all books and folders have completely blank covers and spines (no titles, no labels), all papers are blank or face-down, no signs, no posters, no writing of any kind anywhere in the frame. No people, no faces. Wide format 16:9. Real photograph aesthetic, indistinguishable from a snapshot by a journalist. NOT an illustration, NOT digital art, NOT a 3D render, NOT CGI.',
        quality: 'hd',
        style: 'natural',
      },
      humains: {
        suffix:
          ' Genuine candid photograph, shot on Sony A7IV with 50mm f/1.4 lens, Kodak Portra 400 film emulation. ONE single ordinary person, real human anatomy with normal skin imperfections, asymmetric features, individual character, age-appropriate wrinkles and pores. Authentic everyday clothing, not styled. Subtle film grain, slight imperfect framing, soft natural side light through office window. Completely textless: all books, papers and signs in the background have blank covers, no writing visible anywhere. Wide format 16:9. Looks exactly like a real snapshot taken by a real photographer with a real camera. NOT a stock photo, NOT an AI illustration, NOT a 3D render, NOT cartoonish, NOT stylized, NOT plastic skin.',
        quality: 'hd',
        style: 'natural',
      },
    }
    const FALLBACK_PROMPTS: Record<ImageStyle, string> = {
      conceptuelle: `An editorial abstract composition illustrating the topic of the article ("${theme}"), with a central symbolic object visually evoking this specific topic, minimalist styling, navy blue and gold accents on a clean background, no people, no text.`,
      photorealiste: `A documentary photograph illustrating the topic "${theme}" in a French legal context: a relevant concrete object or place tied to this topic in the foreground, shallow depth of field, soft natural window light, true-to-life muted colors, no people, no text.`,
      humains: `A candid documentary photograph of one to three diverse French professionals in a situation directly related to "${theme}", realistic interaction with a concrete object or place tied to the topic, business or contextual attire, soft natural window light, authentic expressions, no visible text.`,
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
    async function generateAndStore(style: ImageStyle, prompt: string): Promise<string | null> {
      const cfg = STYLE_CONFIG[style]
      try {
        const imageResponse = await openai.images.generate({
          model: 'dall-e-3',
          prompt: prompt + cfg.suffix,
          size: '1792x1024',
          quality: cfg.quality,
          style: cfg.style,
          n: 1,
        })
        const tempUrl = imageResponse.data?.[0]?.url
        if (!tempUrl) return null
        const imgResp = await fetch(tempUrl)
        const imgBuffer = await imgResp.arrayBuffer()
        const fileName = `${cabinetId}/${Date.now()}-${style}.png`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(fileName, imgBuffer, { contentType: 'image/png', upsert: false })
        if (uploadError || !uploadData) return null
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
        return urlData.publicUrl
      } catch (err) {
        console.error(`[article-to-linkedin] Erreur DALL-E (${style}) :`, err)
        return null
      }
    }

    const [conceptuelle, photorealiste, humains] = await Promise.all([
      generateAndStore('conceptuelle', prompts.conceptuelle),
      generateAndStore('photorealiste', prompts.photorealiste),
      generateAndStore('humains', prompts.humains),
    ])
    const images: ImagesByStyle = { conceptuelle, photorealiste, humains }
    const defaultImageUrl = conceptuelle ?? photorealiste ?? humains ?? null

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

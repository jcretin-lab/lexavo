import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import {
  type GenerationContent,
  type ImageStyle,
  type ImagesByStyle,
  IMAGE_STYLE_ORDER,
} from '@/types'
import { sendQuotaAtteint } from '@/lib/email'

export const maxDuration = 120

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// M1 — Verrou par cabinet pour éviter la race condition sur le quota trial
const inProgress = new Set<string>()

export async function POST(request: NextRequest) {
  console.log('[generate] Requête reçue')
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, nom, ville, plan')
    .eq('user_id', user.id)
    .single()

  if (!cabinet) {
    return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })
  }

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
      if (user.email) {
        sendQuotaAtteint(user.email).catch(() => {})
      }
      return NextResponse.json(
        { error: 'Vos 3 générations d\'essai sont épuisées. Abonnez-vous pour continuer.', trial_exhausted: true },
        { status: 402 }
      )
    }
  }

  const body = await request.json()
  const { specialite, theme, ton, date_publication } = body

  if (!specialite || !theme || !ton) {
    return NextResponse.json({ error: 'Champs manquants : specialite, theme, ton' }, { status: 400 })
  }

  const systemPrompt = `Tu es un expert en communication juridique pour avocats français, spécialisé en SEO et en pédagogie juridique grand public.

Tu rédiges du contenu conforme au décret du 12 juillet 2005 et au Règlement Intérieur National du barreau français.

RÈGLES DÉONTOLOGIQUES ABSOLUES :
- Interdit : toute comparaison avec d'autres avocats ou cabinets
- Interdit : toute promesse de résultat ("vous gagnerez", "garanti", "assuré")
- Interdit : tout démarchage direct ou agressif
- Interdit : donner un avis juridique personnalisé — toujours rester dans le pédagogique général
- Obligatoire : positionner l'avocat comme expert pédagogue de confiance
- Obligatoire : terminer par un appel à consultation (jamais à l'achat)
- Ton : professionnel, rassurant, accessible à un non-juriste de niveau bac

RÈGLES QUALITÉ JURIDIQUE :
- Citer au moins 1 article de loi ou texte réglementaire pertinent
- Mentionner la juridiction compétente si pertinent (Conseil de prud'hommes, Tribunal judiciaire, etc.)
- Indiquer les délais légaux clés s'ils existent sur le sujet
- Ne jamais inventer de jurisprudence ou de chiffres — si incertain, formuler avec "en général" ou "selon les cas"

RÈGLES TEMPORELLES ABSOLUES :
- Ne jamais mentionner une année (2024, 2025, 2026…) pour désigner "aujourd'hui" ou "actuellement" — utiliser des formulations intemporelles : "actuellement", "en vigueur", "depuis la loi de…", "à ce jour"
- Les années sont autorisées uniquement pour référencer un texte précis (ex : "la loi du 14 juin 2013", "le décret de 2008") ou une date historique identifiable
- Exemples interdits : "en 2024, la réglementation…", "depuis 2025…", "en cette année…"
- Exemples autorisés : "la loi Macron de 2015 prévoit…", "depuis la réforme des retraites de 2023…"

STRUCTURE ARTICLE IMPOSÉE :
1. Introduction (2-3 phrases) : accroche + mot-clé principal + annonce du plan
2. Contexte / définition du sujet
3. Les points clés (2-3 sections h2)
4. Ce que peut faire l'avocat pour vous (1 section h2)
5. Conclusion + appel à consultation

RÈGLES SEO OBLIGATOIRES :
- Mot-clé principal dans le h1, premier paragraphe et 1 h2
- Densité mot-clé : 1-2% maximum
- Paragraphes : 3-5 lignes maximum
- Au moins 1 liste ul ou ol
- Balises strong sur les termes juridiques importants
- Longueur : 900-1200 mots

RÈGLES POSTS FACEBOOK :
Les 3 posts doivent avoir 3 angles obligatoirement différents :
- Post 1 : angle pédagogique (expliquer un concept juridique)
- Post 2 : angle cas pratique (situation concrète du justiciable)
- Post 3 : angle actualité ou conseil (tip actionnable ou changement récent)

Chaque post :
- Accroche forte en première ligne (question ou chiffre ou affirmation)
- 150-200 mots
- 3-5 hashtags pertinents
- Se termine par un appel à consultation

CONTEXTE DU CABINET :
- Nom : ${cabinet.nom}
- Spécialité : ${specialite}
- Ville : ${cabinet.ville}
- Thème : ${theme}
- Ton souhaité : ${ton}`

  // Prompt 1 — petit appel Claude qui ne génère QUE les 3 prompts DALL-E.
  // Lancé en parallèle du gros appel pour démarrer DALL-E dès que possible.
  const imagePromptUserPrompt = `Génère UNIQUEMENT un objet JSON valide contenant ce seul champ, sans markdown ni texte autour.

{
  "prompts_images": [
    {
      "style": "conceptuelle",
      "prompt": "string (prompt DALL-E 3 en anglais, abstrait et conceptuel, lié au thème juridique. Pas de personnes. Pas de texte visible. Symboles juridiques abstraits, métaphores visuelles élégantes. Palette bleu marine et or. Maximum 50 mots.)"
    },
    {
      "style": "photorealiste",
      "prompt": "string (prompt DALL-E 3 en anglais, photo réaliste documentaire d'un lieu juridique ou d'un objet lié au thème — tribunal, bureau d'avocat, dossier, balance, livre de droit, etc. Pas de personnes. Pas de texte visible. Haute qualité photographique, éclairage naturel. Maximum 50 mots.)"
    },
    {
      "style": "humains",
      "prompt": "string (prompt DALL-E 3 en anglais, photo réaliste d'une scène professionnelle juridique avec des personnes — avocat·e en consultation, équipe en réunion, client recevant un conseil, etc. Pas de texte visible. Diversité (genres, âges, origines). Tenue professionnelle. Cadre français. Maximum 50 mots.)"
    }
  ]
}`

  // Prompt 2 — gros appel Claude pour article + posts + FAQ (sans le prompt_image).
  const contentUserPrompt = `Génère UNIQUEMENT un objet JSON valide, sans markdown, sans texte avant ou après.

RÈGLES POUR article_blog.contenu (HTML rendu dans un navigateur) :
Structure obligatoire :
- 1 seul <h1> contenant le mot-clé principal
- 3 à 5 <h2> pour les sections (au moins un contient le mot-clé)
- <h3> pour les sous-sections si nécessaire
- <p> aérés de 3-5 lignes maximum
- Au minimum 1 <ul> ou <ol> pour les points clés
- <strong> sur les termes juridiques importants
- Introduction : 2-3 phrases avec le mot-clé principal en début d'article
- Conclusion avec <a href="#consultation">Prendre rendez-vous</a>

Règles SEO :
- Mot-clé dans le <h1>, le premier <p> et au moins un <h2>
- Densité mot-clé : 1-2% maximum
- Longueur : 900-1200 mots

Champs supplémentaires :
- slug : URL SEO (minuscules, tirets, sans accents ni espaces)
- alt_image : texte alt descriptif pour l'image (50-100 caractères)
- reading_time : entier = arrondi de (nombre de mots / 200)

{
  "article_blog": {
    "titre": "string (60-70 caractères, contient le mot-clé principal)",
    "meta_description": "string (150-160 caractères, contient le mot-clé, incite au clic)",
    "contenu": "string HTML (900-1200 mots : <h1>, <h2>, <h3>, <p>, <ul>, <strong>, <a href=\\"#consultation\\">)",
    "mots_cles": ["mot-clé principal", "secondaire 1", "secondaire 2", "secondaire 3"],
    "slug": "url-optimisee-exemple-droit-travail-avocat-paris",
    "alt_image": "string (texte alt descriptif pour l'image)",
    "reading_time": 6
  },
  "posts_linkedin": [
    {
      "texte": "string (150-200 mots, accroche forte en 1ère ligne)",
      "hashtags": ["string", "string", "string"]
    },
    { "texte": "string", "hashtags": ["string", "string", "string"] },
    { "texte": "string", "hashtags": ["string", "string", "string"] }
  ],
  "faq": [
    { "question": "string", "reponse": "string (2-3 phrases)" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" },
    { "question": "string", "reponse": "string" }
  ]
}`

  const DALLE_STYLE_SUFFIX =
    ' Professional French law firm atmosphere, navy blue and white color scheme, no text, premium quality, wide format 16:9, photorealistic'
  const FALLBACK_PROMPTS: Record<ImageStyle, string> = {
    conceptuelle: `An abstract symbolic composition illustrating ${specialite}, elegant minimal objects on a clean background, navy blue and gold accents, no people.`,
    photorealiste: `A photorealistic documentary photo of a French law office interior related to ${specialite}, books, balance scale, dossiers on a wooden desk, soft natural light, no people.`,
    humains: `A photorealistic professional scene of French lawyers working together related to ${specialite}, diverse team in business attire in a modern law firm, warm natural light, no visible text.`,
  }

  // Helper pour upload image dans Supabase Storage
  const cabinetId = cabinet.id
  async function uploadImageFromUrl(tempUrl: string, style: ImageStyle): Promise<string | null> {
    const imgResp = await fetch(tempUrl)
    const imgBuffer = await imgResp.arrayBuffer()
    const fileName = `${cabinetId}/${Date.now()}-${style}.png`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, imgBuffer, { contentType: 'image/png', upsert: false })
    if (uploadError || !uploadData) return null
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
    return urlData.publicUrl
  }

  async function generateAndStore(style: ImageStyle, prompt: string): Promise<string | null> {
    try {
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: prompt + DALLE_STYLE_SUFFIX,
        size: '1792x1024',
        quality: 'standard',
        n: 1,
      })
      const tempUrl = imageResponse.data?.[0]?.url
      return tempUrl ? await uploadImageFromUrl(tempUrl, style) : null
    } catch (err) {
      console.error(`[generate] Erreur DALL-E (${style}) :`, err)
      return null
    }
  }

  inProgress.add(cabinet.id)

  try {
    // Lance les 2 appels Claude en parallèle.
    const imagePromptCall = anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      system: systemPrompt,
      messages: [{ role: 'user', content: imagePromptUserPrompt }],
    })
    const contentCall = anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      system: systemPrompt,
      messages: [{ role: 'user', content: contentUserPrompt }],
    })

    // Dès que les 3 prompts sont disponibles, démarre les 3 DALL-E en parallèle
    // pour ne pas tripler le temps de génération.
    const imagesPromise: Promise<ImagesByStyle> = (async () => {
      const prompts: Record<ImageStyle, string> = { ...FALLBACK_PROMPTS }
      try {
        const imageMsg = await imagePromptCall
        const rawImg = imageMsg.content[0].type === 'text' ? imageMsg.content[0].text : ''
        const cleanedImg = rawImg.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
        const parsed = JSON.parse(cleanedImg) as { prompts_images?: Array<{ style?: string; prompt?: string }> }
        if (Array.isArray(parsed.prompts_images)) {
          for (const item of parsed.prompts_images) {
            if (item?.style && item?.prompt && IMAGE_STYLE_ORDER.includes(item.style as ImageStyle)) {
              prompts[item.style as ImageStyle] = item.prompt
            }
          }
        }
      } catch (err) {
        console.error('[generate] prompts_images parse failed, fallbacks utilisés :', err)
      }

      const [conceptuelle, photorealiste, humains] = await Promise.all([
        generateAndStore('conceptuelle', prompts.conceptuelle),
        generateAndStore('photorealiste', prompts.photorealiste),
        generateAndStore('humains', prompts.humains),
      ])
      return { conceptuelle, photorealiste, humains }
    })()

    // Parse du contenu principal avec retry (1 réessai en cas de JSON invalide).
    type ContentSansImage = Omit<GenerationContent, 'prompts_images'>
    let content: ContentSansImage | null = null

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const message = attempt === 0 ? await contentCall : await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 6000,
          system: systemPrompt,
          messages: [{ role: 'user', content: contentUserPrompt }],
        })
        const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
        const cleaned = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
        content = JSON.parse(cleaned) as ContentSansImage
        break
      } catch (err) {
        console.error(`[generate] Tentative ${attempt + 1} échouée :`, err)
        if (attempt === 1) {
          return NextResponse.json({ error: 'Erreur lors de la génération du contenu. Réessayez.' }, { status: 500 })
        }
      }
    }

    if (!content) {
      return NextResponse.json({ error: 'Contenu non généré' }, { status: 500 })
    }

    // M1 — Re-vérification atomique du quota trial juste avant l'insertion
    if (cabinet.plan === 'trial') {
      const { count: finalCount } = await supabase
        .from('generations')
        .select('id', { count: 'exact', head: true })
        .eq('cabinet_id', cabinet.id)

      if ((finalCount ?? 0) >= 3) {
        return NextResponse.json(
          { error: 'Vos 3 générations d\'essai sont épuisées. Abonnez-vous pour continuer.', trial_exhausted: true },
          { status: 402 }
        )
      }
    }

    // Attend la fin des 3 générations d'images (déjà lancées en parallèle).
    const images = await imagesPromise
    const defaultImageUrl = images.conceptuelle ?? images.photorealiste ?? images.humains ?? null

    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        cabinet_id: cabinet.id,
        theme,
        specialite,
        article_blog: content.article_blog,
        posts_linkedin: content.posts_linkedin,
        faq: content.faq,
        image_url: defaultImageUrl,
        images,
        image_selectionnee: defaultImageUrl,
        statut: 'brouillon',
        date_publication: date_publication || null,
      })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
    }

    return NextResponse.json({ generation, content, images, image_selectionnee: defaultImageUrl })
  } finally {
    inProgress.delete(cabinet.id)
  }
}

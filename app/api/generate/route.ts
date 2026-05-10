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
  const imagePromptUserPrompt = `THÈME DE L'ARTICLE : « ${theme} »
SPÉCIALITÉ : ${specialite}

RÈGLE ABSOLUE : chacun des 3 prompts DALL-E DOIT placer au centre de la scène un élément visuel CONCRET et SPÉCIFIQUE tiré directement du thème ci-dessus. Ne te contente PAS des classiques génériques (balance, marteau, livres reliés) sauf si le thème les évoque réellement. L'objectif est qu'un lecteur reconnaisse instantanément le sujet de l'article rien qu'en regardant l'image.

Exemples de traduction thème → élément visuel central :
- "Licenciement pour faute grave" → un bureau vide, badge d'accès retourné, carton de déménagement avec quelques affaires personnelles, ou une lettre recommandée ouverte sur un bureau
- "Rupture brutale des relations commerciales" → un contrat déchiré en deux, deux poignées de main qui se séparent, deux bureaux qui s'éloignent
- "Droit de rétractation" → une enveloppe LRAR fermée, un calendrier marqué "14 jours", un colis non ouvert avec un bordereau de retour
- "Divorce" → deux alliances séparées sur une table, deux clés sur des porte-clés différents, deux jeux de bagages
- "Bail commercial" → la vitrine d'un commerce avec un bail dans le cadre, une remise de clés de boutique
- "Succession / héritage" → une vieille horloge familiale, un dossier notarié relié, un coffre familial ouvert
- "Contestation PV" → une contravention sur un pare-brise, un panneau de signalisation, un radar

Identifie d'abord 2-3 éléments visuels SPÉCIFIQUES au thème « ${theme} », puis construis les 3 prompts autour de ces éléments. Les 3 prompts (conceptuelle, photorealiste, humains) doivent partager le MÊME élément central, mais traité différemment selon le style.

Les prompts photo (photorealiste, humains) doivent décrire une vraie photographie : commencer par "A documentary photograph of…", inclure le sujet spécifique, un cadrage, une lumière naturelle nommée (window light, golden hour…), une profondeur de champ. Pas de mots comme "illustration", "render", "3D", "art".

Génère UNIQUEMENT un objet JSON valide contenant ce seul champ, sans markdown ni texte autour.

{
  "prompts_images": [
    {
      "style": "conceptuelle",
      "prompt": "string (prompt DALL-E 3 en anglais. UNE seule icône/objet stylisé central qui evoque le thème. Fond uni épuré, ÉNORMÉMENT d'espace vide autour. AUCUN autre élément décoratif. Pas de personnes. Pas de texte. Maximum 25 mots.)"
    },
    {
      "style": "photorealiste",
      "prompt": "string (prompt DALL-E 3 en anglais, commençant par 'A documentary photograph of…'. UNE scène concrète sans personne avec UN objet/lieu central tiré du thème, en avant-plan. ÉVITER absolument livres avec dos visibles, panneaux, documents avec écriture, étiquettes — choisir des objets sans texte (carton fermé, dossier vierge, mur uni, etc.) OU décrire explicitement toutes les surfaces comme vierges/blanches. Lumière naturelle nommée + faible profondeur de champ. Maximum 50 mots.)"
    },
    {
      "style": "humains",
      "prompt": "string (prompt DALL-E 3 en anglais, commençant par 'A candid photograph of one person…'. UNE SEULE personne en interaction directe avec l'objet central du thème (ex : un employé seul qui rend son badge, une avocate seule qui signe un document, un commerçant seul qui ferme sa vitrine…). PAS de groupe (DALL-E rend mal les groupes). Tenue ordinaire et plausible, expression naturelle imparfaite, instant pris sur le vif. Lumière naturelle latérale. Arrière-plan flou. Aucun texte visible (écrans éteints, livres fermés, murs vides). Maximum 50 mots.)"
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

  // Suffixes ET parametres DALL-E par style.
  // - conceptuelle reste corporate (style: vivid, palette navy/or)
  // - photorealiste & humains forcent un rendu photographique (style: natural,
  //   quality: hd, vocabulaire d'appareil photo, anti "illustration/3D/render")
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
    conceptuelle: `An editorial abstract composition illustrating "${theme}" in the context of ${specialite}, with a central symbolic object visually evoking this specific topic, minimalist styling, navy blue and gold accents on a clean background, no people, no text.`,
    photorealiste: `A documentary photograph illustrating "${theme}" in a French law context (${specialite}): a relevant concrete object or place tied to this topic in the foreground, shallow depth of field, soft natural window light, true-to-life muted colors, no people, no text.`,
    humains: `A candid documentary photograph of one to three diverse French professionals in a situation directly related to "${theme}" (${specialite}), realistic interaction with a concrete object or place tied to the topic, business or contextual attire, soft natural window light, authentic expressions, no visible text.`,
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
      max_tokens: 600,
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

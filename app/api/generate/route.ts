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

    if ((totalCount ?? 0) >= 10) {
      if (user.email) {
        sendQuotaAtteint(user.email).catch(() => {})
      }
      return NextResponse.json(
        { error: 'Vos 10 générations d\'essai sont épuisées. Abonnez-vous pour continuer.', trial_exhausted: true },
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

RÈGLES POSTS LINKEDIN :

Les 3 posts ont 3 angles obligatoirement différents. Chaque post est structuré en 3 BLOCS nommés, séparés par un saut de ligne. Chaque bloc est introduit par un sous-titre court (3 à 6 mots, sans gras typographique), suivi d'un saut de ligne, puis du contenu du bloc.

- Post 1 — PÉDAGOGIQUE
  Bloc 1 — Le concept : présente la notion juridique en 2-3 phrases.
  Bloc 2 — Ce que ça change pour vous : reformulation concrète côté justiciable.
  Bloc 3 — Le piège fréquent : un point précis où les gens se trompent.

- Post 2 — CAS PRATIQUE
  Bloc 1 — La situation : description factuelle d'un cas réaliste, sans noms ni détails identifiants.
  Bloc 2 — Ce que dit le droit : référence au texte / article applicable + délai légal s'il en existe un.
  Bloc 3 — Ce qu'il faut retenir : un enseignement actionnable.

- Post 3 — CONSEIL
  Bloc 1 — Avant d'agir : le réflexe à NE PAS avoir.
  Bloc 2 — Le bon réflexe : ce qu'il faut faire à la place.
  Bloc 3 — Quand consulter : signal clair qui doit déclencher la prise de rendez-vous.

RÈGLES FORMELLES — s'appliquent aux 3 posts :

- Première ligne = ACCROCHE tirée OBLIGATOIREMENT d'un de ces 4 leviers, jamais une formule générique :
  (a) un chiffre, un délai ou un seuil légal extrait du sujet
  (b) une énumération sèche de 2 à 3 mots séparés par un point (ex : "Bail. Loyer. Préavis.")
  (c) une question fermée provocante en 8 mots maximum
  (d) un fait juridique méconnu, introduit sans préambule
- Citer au moins UN élément précis tiré du sujet : article de code, date de texte, chiffre, seuil légal, nom de procédure, juridiction compétente. Ne jamais inventer.
- Aucun paragraphe ne dépasse 3 lignes. Sauter une ligne entre chaque paragraphe et entre chaque bloc nommé. Voix active. Phrases courtes.
- Aucun emoji, aucun symbole décoratif (✅, 👇, ▸, →). Le seul caractère toléré en tête de bloc est le tiret long "—".
- Aucune formule auto-promotionnelle, aucune comparaison avec d'autres avocats.
- Appel à consultation en clôture du post (après le bloc 3), formulé DIFFÉREMMENT dans chaque post.
- Longueur : 220 à 280 mots par post, hors hashtags.
- 3 hashtags juridiques pertinents en fin de post, jamais plus, sur une ligne séparée.

CONTEXTE DU CABINET :
- Nom : ${cabinet.nom}
- Spécialité : ${specialite}
- Ville : ${cabinet.ville}
- Thème : ${theme}
- Ton souhaité : ${ton}`

  // Prompt 1 — petit appel Claude qui ne génère QUE le prompt d'image conceptuelle.
  // Lancé en parallèle du gros appel pour démarrer la génération d'image au plus tôt.
  const imagePromptUserPrompt = `THÈME DE L'ARTICLE : « ${theme} »
SPÉCIALITÉ : ${specialite}

OBJECTIF : 1 prompt (anglais) qui rend le sujet juridique IMMÉDIATEMENT identifiable d'un coup d'œil. Qualité magazine éditorial juridique (Le Monde, Les Échos, Forbes France).

ÉTAPE 1 — Identifie 3 ÉLÉMENTS VISUELS CONCRETS spécifiques au thème :
- des OBJETS RÉELS du quotidien, pas des concepts abstraits
- immédiatement reconnaissables par un justiciable français
- évite "balance", "marteau", "livres reliés", "colonnes de tribunal" — ce sont des clichés vides
- privilégie les objets qui évoquent la situation juridique précise

Exemples de mapping thème → 3 éléments visuels :
- "Licenciement pour faute grave" → badge d'accès retourné, carton de bureau avec affaires personnelles, lettre recommandée ouverte
- "Rupture brutale relations commerciales" → contrat déchiré en deux, poignée de main qui se sépare, calendrier biffé
- "Droit de rétractation" → enveloppe LRAR cachetée, calendrier marqué "14 jours", colis non ouvert avec bordereau
- "Divorce" → deux alliances séparées sur une table, deux clés sur des porte-clés différents, valise prête près de la porte
- "Bail commercial" → vitrine de commerce, clés de boutique, contrat de bail tamponné
- "Succession" → horloge familiale, dossier notarié relié, coffre de famille ouvert
- "Contestation PV" → contravention sous l'essuie-glace, panneau de signalisation, radar fixe
- "Avis Google diffamatoire" → écran d'ordinateur affichant une note 1 étoile, smartphone à côté, capture d'écran imprimée

ÉTAPE 2 — Rédige le prompt "conceptuelle" en anglais (60 mots max) autour de ces 3 éléments.

CONTRAINTES :
- composition éditoriale photographique mise en scène dans un vrai bureau d'avocat français
- 2 à 3 objets concrets disposés naturellement sur un bureau en bois sous lumière de fenêtre
- profondeur de champ cinématographique, textures réalistes, palette navy / off-white / touches d'or brossé
- aucune personne dans le cadre, aucun texte lisible (documents vierges ou flous)
- INTERDIT : "minimalist", "single object", "flat illustration", "icon", "vast empty background", "abstract"

Génère UNIQUEMENT un objet JSON valide, sans markdown ni texte autour :

{
  "prompts_images": [
    {
      "style": "conceptuelle",
      "keywords": "string (3 expressions visuelles concrètes séparées par virgule, en anglais — ex: 'returned access badge, packed office box, opened registered letter')",
      "prompt": "string (60 mots max, anglais)"
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
      "texte": "string (220-280 mots, 3 blocs nommés, accroche tirée d'un des 4 leviers, sauts de ligne entre blocs)",
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

  // 1 seul style genere via gpt-image-1 : composition editoriale photo dans un bureau d'avocat
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
    conceptuelle: `An editorial photographic composition staged on a wooden desk in a French law office, evoking "${theme}" in the context of ${specialite}. Two or three concrete objects tied to the topic placed naturally under window light. Realistic textures, cinematic depth of field, navy blue and gold accents, no people, no legible text.`,
  }

  // Helper pour stocker un buffer image dans Supabase Storage
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
      console.error(`[generate] Erreur image (${style}, ${cfg.model}) :`, err)
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

    // Dès que le prompt est disponible, lance la generation.
    const imagesPromise: Promise<ImagesByStyle> = (async () => {
      const prompts: Record<ImageStyle, string> = { ...FALLBACK_PROMPTS }
      try {
        const imageMsg = await imagePromptCall
        const rawImg = imageMsg.content[0].type === 'text' ? imageMsg.content[0].text : ''
        const cleanedImg = rawImg.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
        const parsed = JSON.parse(cleanedImg) as { prompts_images?: Array<{ style?: string; keywords?: string; prompt?: string }> }
        if (Array.isArray(parsed.prompts_images)) {
          for (const item of parsed.prompts_images) {
            if (item?.style && item?.prompt && IMAGE_STYLE_ORDER.includes(item.style as ImageStyle)) {
              // Les mots-cles visuels sont concaténés en tete pour que gpt-image-1 leur donne plus de poids.
              const keywords = item.keywords?.trim()
              prompts[item.style as ImageStyle] = keywords
                ? `Visual focus: ${keywords}. ${item.prompt}`
                : item.prompt
            }
          }
        }
      } catch (err) {
        console.error('[generate] prompts_images parse failed, fallbacks utilisés :', err)
      }

      const conceptuelle = await generateAndStore('conceptuelle', prompts.conceptuelle)
      return { conceptuelle }
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

      if ((finalCount ?? 0) >= 10) {
        return NextResponse.json(
          { error: 'Vos 10 générations d\'essai sont épuisées. Abonnez-vous pour continuer.', trial_exhausted: true },
          { status: 402 }
        )
      }
    }

    // Attend la fin de la generation d'image (deja lancee en parallele).
    const images = await imagesPromise
    const defaultImageUrl = images.conceptuelle ?? null

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

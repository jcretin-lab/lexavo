import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { type ImageStyle, type ImagesByStyle, IMAGE_STYLE_ORDER } from '@/types'

export const maxDuration = 240

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

RÈGLES POSTS LINKEDIN :

OBJECTIF : générer 3 posts qui, s'ils étaient publiés à 1 semaine d'intervalle dans le fil d'un avocat, ne donneraient JAMAIS une impression de répétition. Variabilité éditoriale = priorité absolue.

CHOIX DES ANGLES (3 angles différents parmi ces 8) :
- PÉDAGOGIQUE — expliquer une notion juridique d'apparence complexe
- CAS PRATIQUE — raconter une situation concrète et son issue
- CONSEIL ACTIONNABLE — un réflexe ou tip immédiatement applicable
- FAIT MÉCONNU — révéler une règle ou jurisprudence peu connue
- ALERTE / ERREUR CLASSIQUE — pointer une erreur fréquente et son coût
- AVANT / APRÈS — montrer le décalage entre perception courante et réalité juridique
- LES MOTS QUI COMPTENT — décrypter le sens juridique précis d'un terme courant
- LA QUESTION QU'ON N'OSE PAS POSER — répondre à une interrogation pudique mais courante

Choisir les 3 angles qui collent le mieux au sujet. Ne JAMAIS reprendre 3 fois "Pédagogique / Cas pratique / Conseil" par défaut.

STRUCTURE DE CHAQUE POST :
- 2 à 4 BLOCS, séparés par un saut de ligne — le nombre est libre, ajusté à l'angle et au sujet
- Chaque bloc est introduit par un SOUS-TITRE COURT (3 à 5 mots), suivi d'un saut de ligne, puis du contenu
- Les blocs forment une mini-narration cohérente (ex : situation → mécanisme → action, ou révélation → conséquence)

RÈGLES CRITIQUES SUR LES SOUS-TITRES :

INTERDIT — sous-titres génériques recyclables :
"Le concept", "Le contexte", "Ce qu'il faut savoir", "Pour conclure", "Ce qui change pour vous", "Le piège fréquent", "L'essentiel", "Les enjeux", "Ce que dit le droit", "La situation", "Avant d'agir", "Quand consulter", "Le bon réflexe", "Ce qu'il faut retenir".

OBLIGATOIRE — sous-titres taillés sur mesure :
- Chaque sous-titre contient un mot précis du domaine juridique traité OU une image concrète liée au sujet
- Un sous-titre ne doit JAMAIS être réutilisable tel quel sur un autre sujet juridique
- Les 9 sous-titres des 3 posts d'une même génération sont tous différents

EXEMPLES de sous-titres bien construits (pour calibrage de style, ne pas recopier) :

Sujet « Licenciement pour faute grave » :
  Post pédagogique : "Faute grave, faute lourde" — "Le bureau vidé en 48 h" — "Ce qui sauve les indemnités"
  Post cas pratique : "Un SMS au mauvais moment" — "L'article L. 1234-1 en main" — "Pourquoi il a gagné en appel"

Sujet « Droit de rétractation » :
  Post fait méconnu : "Quatorze jours, deux exceptions" — "Le bouton qu'on ne voit pas" — "Une LRAR vaut mieux"
  Post alerte : "Le piège du sur-mesure" — "L'article L. 221-28 dit ceci" — "Trois réflexes avant de cliquer"

Sujet « Rupture brutale relations commerciales » :
  Post avant/après : "Dix ans de partenariat" — "Un email, trois lignes" — "Le préavis selon les juges"

RÈGLES FORMELLES — s'appliquent aux 3 posts :

- Ton souhaité : ${ton}
- Première ligne = ACCROCHE tirée OBLIGATOIREMENT d'un de ces 4 leviers, jamais une formule générique :
  (a) un chiffre, un délai ou un seuil légal extrait du sujet
  (b) une énumération sèche de 2 à 3 mots séparés par un point (ex : "Bail. Loyer. Préavis.")
  (c) une question fermée provocante en 8 mots maximum
  (d) un fait juridique méconnu, introduit sans préambule
  Les 3 posts doivent utiliser 3 leviers d'accroche différents parmi (a, b, c, d).
- Citer au moins UN élément précis tiré du sujet : article de code, date de texte, chiffre, seuil légal, nom de procédure, juridiction compétente. Ne jamais inventer — si incertain, formuler avec "en général" ou "selon les cas".
- Aucun paragraphe ne dépasse 3 lignes. Sauter une ligne entre chaque paragraphe et entre chaque bloc. Voix active. Phrases courtes.
- Aucun emoji, aucun symbole décoratif (✅, 👇, ▸, →). Le seul caractère toléré en tête de sous-titre est le tiret long "—".
- Aucune formule auto-promotionnelle ("nous sommes les premiers à…", "je l'avais prévu…", "le meilleur cabinet…"). Aucune comparaison avec d'autres avocats.
- Appel à consultation en clôture du post, formulé DIFFÉREMMENT dans chaque post (ne jamais réutiliser une formule sur 2 posts d'une même génération).
- Longueur : 180 à 280 mots par post, ajustée au nombre de blocs (2 blocs ≈ 180-220 mots, 3 blocs ≈ 220-260, 4 blocs ≈ 260-300). Hors hashtags.
- 3 hashtags juridiques pertinents en fin de post, jamais plus, sur une ligne séparée.

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

OUTILS LÉGIFRANCE (MCP server "legifrance") :
Tu as accès au serveur MCP "legifrance" qui expose 3 outils branchés sur les bases officielles françaises :
- rechercher_code : recherche dans les 73 codes français (Code du travail, Code civil, Code de commerce, etc.)
- rechercher_jurisprudence_judiciaire : recherche dans Judilibre (Cour de cassation)
- rechercher_dans_texte_legal : recherche dans une loi/ordonnance/décret précis

PROTOCOLE STRICT (à respecter pour chaque génération) :
1. AVANT de rédiger les posts, tu fais AU MAXIMUM 2 appels d'outils Légifrance (idéalement 1 seul) pour identifier 1 à 2 références juridiques précises applicables au sujet de l'article.
2. Tu privilégies rechercher_code (le plus rapide). Tu utilises rechercher_jurisprudence_judiciaire uniquement si l'article traite spécifiquement d'une question de jurisprudence.
3. Tu cites UNIQUEMENT les références retournées par les outils — jamais une référence que tu inventes.
4. Si l'article fourni cite déjà une référence précise, tu la vérifies avec rechercher_code avant de la reprendre dans tes posts.
5. Si les outils ne renvoient rien d'exploitable, tu n'inventes pas — tu cites un délai, un seuil, une procédure ou une juridiction (qui ne nécessitent pas de vérification d'article), ou tu paraphrases sans référence précise.

Les références Légifrance vérifiées peuvent être citées dans 1 ou 2 posts (pas obligatoirement les 3). Le 3e post peut reposer sur un fait, un délai ou un cas pratique.

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
    const openlegiToken = process.env.OPENLEGI_TOKEN
    const useMcp = !!openlegiToken

    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const message = await anthropic.beta.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 4500,
          betas: useMcp ? ['mcp-client-2025-11-20'] : undefined,
          system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
          mcp_servers: useMcp
            ? [{
                name: 'legifrance',
                type: 'url',
                url: 'https://mcp.openlegi.fr/legifrance/mcp',
                authorization_token: openlegiToken!,
              }]
            : undefined,
          tools: useMcp ? [{ type: 'mcp_toolset', mcp_server_name: 'legifrance' }] : undefined,
          messages: [{ role: 'user', content: `ARTICLE :\n\n${article}` }],
        })

        // Concatène tous les blocs text (le JSON final est dans le(s) dernier(s) après les tool calls)
        const allText = message.content
          .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
          .map(b => b.text)
          .join('\n')
        const cleaned = allText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? jsonMatch[0] : cleaned
        result = JSON.parse(jsonStr) as ApiResult
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

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

Plan-canon. Inclure 5 à 6 sections h2 parmi les 7 ci-dessous, selon ce qui s'applique au thème (ne pas forcer une section qui n'a pas de sens pour le sujet) :

1. Encart "À retenir" (juste après le h1, AVANT l'introduction) — 3 puces de 1 ligne, snippet-friendly, 50-60 mots au total.
2. Introduction (2-3 phrases, voir RÈGLE ACCROCHE plus bas)
3. h2 — Définition / De quoi parle-t-on ?
4. h2 — Quand ce dispositif s'applique-t-il ? (cas typiques)
5. h2 — Quelle procédure ? (étapes ordonnées, idéalement <ol>)
6. h2 — Quels délais légaux ? (avec chiffres précis + texte de référence)
7. h2 — Quels coûts et risques ? (forfait, dépens, sanctions encourues)
8. h2 — Les erreurs fréquentes à éviter
9. h2 — Comment un avocat intervient (CTA implicite)

Avant la conclusion : checklist <ul> de 4 à 6 puces actionnables ("ce que vous devez faire / vérifier / conserver").

Conclusion (3-4 phrases) avec <a href="#consultation">Prendre rendez-vous</a>.

RÈGLE ACCROCHE INTRODUCTION :
Première phrase de l'introduction tirée OBLIGATOIREMENT d'un de ces 4 leviers, jamais une formule générique :
(a) un chiffre, un délai ou un seuil légal du sujet
(b) une énumération sèche de 2-3 mots séparés par un point
(c) une question fermée provocante (8 mots maximum)
(d) un fait juridique méconnu introduit sans préambule

DENSITÉ JURIDIQUE OBLIGATOIRE :
- Minimum 2 références textuelles précises avec date ou numéro (ex : "article L. 1232-1 du Code du travail", "la loi du 14 juin 2013", "le décret n° 2008-1339 du 16 décembre 2008")
- Minimum 1 juridiction compétente nommée (Conseil de prud'hommes, Tribunal judiciaire, Cour d'appel, Conseil d'État…)
- Minimum 1 délai légal chiffré (en jours, mois ou ans)
- Minimum 1 procédure nommée (assignation, requête, médiation préalable obligatoire, référé…)
- INTERDICTION ABSOLUE d'inventer une jurisprudence ou un numéro d'arrêt. Si la jurisprudence n'est pas certaine, formuler avec "la jurisprudence considère généralement que…" sans citer de référence précise.

RÈGLES SEO OBLIGATOIRES :
- Mot-clé principal dans le h1, dans le premier paragraphe sous le h1, et dans au moins 2 h2 (dont le premier)
- Au moins 1 h2 formulé en question (signal snippet)
- Densité mot-clé 1-2 % maximum, jamais bourrer
- Paragraphes : 3-5 lignes maximum
- Au moins 1 <ul> ou <ol> en plus de la checklist finale
- <strong> sur les termes juridiques précis (noms de procédures, noms de codes), pas sur des adjectifs
- Longueur cible : 1200 à 1600 mots (hors balises HTML)

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
- Les blocs forment une mini-narration cohérente (situation → mécanisme → action, ou révélation → conséquence)

RÈGLES CRITIQUES SUR LES SOUS-TITRES :

INTERDIT — sous-titres génériques recyclables :
"Le concept", "Le contexte", "Ce qu'il faut savoir", "Pour conclure", "Ce qui change pour vous", "Le piège fréquent", "L'essentiel", "Les enjeux", "Ce que dit le droit", "La situation", "Avant d'agir", "Quand consulter", "Le bon réflexe", "Ce qu'il faut retenir".

OBLIGATOIRE — sous-titres taillés sur mesure :
- Chaque sous-titre contient un mot précis du domaine juridique traité OU une image concrète liée au sujet
- Un sous-titre ne doit JAMAIS être réutilisable tel quel sur un autre sujet juridique
- Les 9 sous-titres (ou plus) des 3 posts d'une même génération sont tous différents

EXEMPLES de sous-titres bien construits (pour calibrage de style, ne pas recopier) :

Sujet « Licenciement pour faute grave » :
  "Faute grave, faute lourde" — "Le bureau vidé en 48 h" — "Ce qui sauve les indemnités"
  "Un SMS au mauvais moment" — "Conseil de prud'hommes saisi" — "Pourquoi il a gagné en appel"

Sujet « Droit de rétractation » :
  "Quatorze jours, deux exceptions" — "Le bouton qu'on ne voit pas" — "Une LRAR vaut mieux"
  "Le piège du sur-mesure" — "Pas de retour sur commande personnalisée" — "Trois réflexes avant de cliquer"

Sujet « Rupture brutale relations commerciales » :
  "Dix ans de partenariat" — "Un email, trois lignes" — "Le préavis selon les juges"

RÈGLES FORMELLES — s'appliquent aux 3 posts :

- Première ligne = ACCROCHE tirée OBLIGATOIREMENT d'un de ces 4 leviers, jamais une formule générique :
  (a) un chiffre, un délai ou un seuil légal extrait du sujet
  (b) une énumération sèche de 2 à 3 mots séparés par un point (ex : "Bail. Loyer. Préavis.")
  (c) une question fermée provocante en 8 mots maximum
  (d) un fait juridique méconnu, introduit sans préambule
  Les 3 posts doivent utiliser 3 leviers d'accroche différents parmi (a, b, c, d).
- Citer au moins UN élément précis tiré du sujet, en PRIVILÉGIANT les références stables et faciles à vérifier : un délai légal chiffré (en jours, mois, années), un seuil chiffré (en euros, en effectif), un nom de procédure (référé, injonction de payer, médiation préalable…), un nom de juridiction compétente (Conseil de prud'hommes, Tribunal judiciaire, Cour d'appel…). ÉVITER les numéros d'articles de code numérotés (du type "L. 1234-9") sauf pour les rares références majeures structurantes connues du grand public. En cas de doute, paraphrase : "selon le Code de la consommation", "le droit du travail prévoit que…". Ne jamais inventer une référence.
- Aucun paragraphe ne dépasse 3 lignes. Saut de ligne entre paragraphes et entre blocs. Voix active. Phrases courtes.
- Aucun emoji, aucun symbole décoratif. Seul caractère toléré en tête de sous-titre : tiret long "—".
- Aucune formule auto-promotionnelle, aucune comparaison avec d'autres avocats.
- Appel à consultation en clôture du post, formulé DIFFÉREMMENT dans chaque post (ne jamais réutiliser une formule sur 2 posts d'une même génération).
- Longueur : 180 à 280 mots par post, ajustée au nombre de blocs (2 blocs ≈ 180-220 mots, 3 blocs ≈ 220-260, 4 blocs ≈ 260-300). Hors hashtags.
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

Structure obligatoire dans cet ordre :
- 1 seul <h1> contenant le mot-clé principal
- Juste après le <h1> : un encart <div class="a-retenir"><strong>À retenir</strong><ul><li>...</li><li>...</li><li>...</li></ul></div>
- <p> d'introduction (2-3 phrases respectant la RÈGLE ACCROCHE du systemPrompt)
- 5 à 6 <h2> suivant le plan-canon du systemPrompt (au moins 1 h2 formulé en question)
- <h3> pour les sous-sections si nécessaire
- <p> aérés de 3-5 lignes maximum
- Au moins 1 <ol> pour la procédure et 1 <ul> pour la checklist finale (en plus de l'encart À retenir)
- <strong> sur les termes juridiques précis (noms de procédures, noms de codes)
- Conclusion avec <a href="#consultation">Prendre rendez-vous</a>

Règles SEO :
- Mot-clé dans le <h1>, le premier <p> sous le h1, et au moins 2 <h2>
- Densité mot-clé 1-2 % maximum
- Longueur cible : 1200 à 1600 mots (hors balises HTML)

Champs supplémentaires :
- titre : 60-70 caractères, contient le mot-clé principal
- meta_description : 150-160 caractères, structure "promesse + bénéfice + appel"
- mots_cles : 4 entrées (1 principal + 3 secondaires sémantiquement proches)
- slug : URL SEO (minuscules, tirets, sans accents ni espaces, 5-7 mots)
- alt_image : 50-100 caractères, descriptif visuel sans bourrage de mot-clé
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
      "texte": "string (180-300 mots, 2 à 4 blocs avec sous-titres SUR MESURE, accroche tirée d'un des 4 leviers, angle parmi les 8 proposés, sauts de ligne entre blocs)",
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

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

Génère aussi 3 prompts DALL-E 3 en anglais pour 3 images professionnelles distinctes du sujet de l'article :
- "conceptuelle" : illustration éditoriale abstraite, symboles juridiques (balance, marteau, plume, dossier), pas de personnes, pas de texte, palette bleu marine et or sur fond clair, max 50 mots.
- "photorealiste" : démarrer par "A documentary photograph of…". Décrire UNE scène concrète sans personne (cabinet, dossiers, livres reliés, balance, salle d'audience…). Préciser une lumière naturelle nommée (soft window light, late afternoon sun) et une faible profondeur de champ. Couleurs réalistes, pas de teinte forcée. Pas les mots "illustration", "render", "3D", "art". Max 60 mots.
- "humains" : démarrer par "A candid documentary photograph of…". 1 à 3 personnes en cadre professionnel juridique français (avocat avec client, équipe sur dossier, etc.), tenue costume/robe, diversité réaliste, lumière naturelle (window light), expressions authentiques, peau réaliste avec texture naturelle. Max 60 mots.

Génère UNIQUEMENT un JSON valide, sans markdown, sans texte avant ou après :
{
  "posts_linkedin": [
    { "angle": "pedagogique", "texte": "string", "hashtags": ["string"] },
    { "angle": "cas_pratique", "texte": "string", "hashtags": ["string"] },
    { "angle": "conseil", "texte": "string", "hashtags": ["string"] }
  ],
  "prompts_images": [
    { "style": "conceptuelle", "prompt": "string" },
    { "style": "photorealiste", "prompt": "string" },
    { "style": "humains", "prompt": "string" }
  ]
}`

  type ApiResult = {
    posts_linkedin: Array<{ angle: string; texte: string; hashtags: string[] }>
    prompts_images: Array<{ style?: string; prompt?: string }>
  }

  inProgress.add(cabinet.id)
  let result: ApiResult | null = null

  try {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const message = await anthropic.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 3000,
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

    const STYLE_CONFIG: Record<ImageStyle, {
      suffix: string
      quality: 'standard' | 'hd'
      style: 'vivid' | 'natural'
    }> = {
      conceptuelle: {
        suffix:
          ' Clean editorial illustration style, sophisticated minimal corporate design, navy blue and white color scheme with subtle gold accents, soft lighting, no text, no people, no faces, wide format 16:9, premium French law firm marketing aesthetic.',
        quality: 'standard',
        style: 'vivid',
      },
      photorealiste: {
        suffix:
          ' Professional documentary photography, shot on a full-frame DSLR with a 35mm f/1.8 lens, natural window light, shallow depth of field, sharp focus, fine film grain, true-to-life muted colors with natural color grading, no text, no people, no faces, wide format 16:9. This is a real photograph, indistinguishable from one shot by a professional photojournalist. NOT an illustration, NOT digital art, NOT a 3D render, NOT CGI.',
        quality: 'hd',
        style: 'natural',
      },
      humains: {
        suffix:
          ' Photojournalism portrait, shot on a full-frame DSLR with a 50mm f/1.4 lens, natural window light, shallow depth of field, candid composition, authentic facial expressions, photorealistic skin texture with visible pores and natural skin tones, lifelike eyes, true-to-life muted colors with natural color grading, fine film grain, no visible text, contemporary French law firm setting, wide format 16:9. This is a real photograph, indistinguishable from one shot by a professional photojournalist. NOT an illustration, NOT digital art, NOT a 3D render, NOT CGI, NOT cartoonish, NOT stylized.',
        quality: 'hd',
        style: 'natural',
      },
    }
    const FALLBACK_PROMPTS: Record<ImageStyle, string> = {
      conceptuelle: 'An editorial abstract composition illustrating French law, with elegant minimal symbols (balance scale, gavel, leather-bound book) on a clean background, navy blue and gold accents, no people.',
      photorealiste: 'A documentary photograph of a French law office interior: leather-bound law books on wooden shelves, a brass balance scale on a polished oak desk, an open dossier with hand-written notes, soft afternoon window light from the left, shallow depth of field, no people.',
      humains: 'A candid documentary photograph of two diverse French lawyers in business attire reviewing a dossier together at a wooden desk in a modern law firm office, soft window light from a side window, warm natural tones, authentic concentrated expressions, no visible text.',
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

    const rawTheme = article.trim().slice(0, 80)
    const theme = rawTheme + (article.trim().length > 80 ? '…' : '')
    const postsLinkedin = result.posts_linkedin.map(({ texte, hashtags }) => ({ texte, hashtags }))

    const { data: generation, error: dbError } = await supabase
      .from('generations')
      .insert({
        cabinet_id: cabinet.id,
        theme,
        specialite: 'Article importé',
        posts_linkedin: postsLinkedin,
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

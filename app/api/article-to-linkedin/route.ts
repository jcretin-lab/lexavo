import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

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

  // Seul le plan trial a une limite (3 générations totales)
  // Les plans payants (essentiel, pro, cabinet) sont illimités
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

Génère aussi un prompt DALL-E 3 en anglais pour une image professionnelle adaptée au sujet de l'article.

Génère UNIQUEMENT un JSON valide, sans markdown, sans texte avant ou après :
{
  "posts_linkedin": [
    { "angle": "pedagogique", "texte": "string", "hashtags": ["string"] },
    { "angle": "cas_pratique", "texte": "string", "hashtags": ["string"] },
    { "angle": "conseil", "texte": "string", "hashtags": ["string"] }
  ],
  "prompt_image": "string"
}`

  type ApiResult = {
    posts_linkedin: Array<{ angle: string; texte: string; hashtags: string[] }>
    prompt_image: string
  }

  let result: ApiResult | null = null

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

  // Appel DALL-E 3
  let imageUrl: string | null = null
  try {
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: result.prompt_image +
        ' Professional legal office atmosphere, clean minimal design, blue and white color scheme, no text, no people, suitable for French law firm marketing',
      size: '1792x1024',
      quality: 'standard',
      n: 1,
    })

    const tempUrl = imageResponse.data?.[0]?.url
    if (tempUrl) {
      const imgResp = await fetch(tempUrl)
      const imgBuffer = await imgResp.arrayBuffer()
      const fileName = `${cabinet.id}/${Date.now()}.png`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('images')
        .upload(fileName, imgBuffer, { contentType: 'image/png', upsert: false })

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }
    }
  } catch (err) {
    console.error('[article-to-linkedin] Erreur DALL-E :', err)
  }

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
      image_url: imageUrl,
      statut: 'brouillon',
    })
    .select()
    .single()

  if (dbError) {
    console.error('[article-to-linkedin] Erreur DB :', dbError)
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }

  return NextResponse.json({ generation, image_url: imageUrl })
}

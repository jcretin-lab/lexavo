import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { type GenerationContent } from '@/types'
import { sendQuotaAtteint } from '@/lib/email'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

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

  // Vérifier le quota uniquement pour le plan trial (3 essais gratuits)
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

  // Les plans payants (essentiel, pro, cabinet) ont des générations illimitées
  // Note : seul le plan pro et cabinet ont accès à cette route (contrôlé côté UI)

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

  const userPrompt = `Génère UNIQUEMENT un objet JSON valide, sans markdown, sans texte avant ou après.

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
  ],
  "prompt_image": "string (prompt DALL-E 3 en anglais décrivant une scène abstraite ou un objet symbolique lié au thème juridique et à la spécialité. Le prompt doit évoquer visuellement le sujet sans montrer de personnes ni de texte. Utiliser des métaphores visuelles (ex: pour le divorce → deux anneaux dorés séparés sur fond épuré, pour le droit du travail → un bureau élégant avec des documents, pour le droit immobilier → une clé dorée sur un plan architectural). Maximum 50 mots.)"
}`

  let content: GenerationContent | null = null
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 6000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      })

      const rawText = message.content[0].type === 'text' ? message.content[0].text : ''
      const cleaned = rawText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
      content = JSON.parse(cleaned) as GenerationContent
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

  // Appel DALL-E 3
  let imageUrl: string | null = null
  try {
    const imageResponse = await openai.images.generate({
      model: 'dall-e-3',
      prompt: content.prompt_image +
        ' Professional French law firm atmosphere, clean and sophisticated minimal design, navy blue and white color scheme with subtle gold accents, soft natural lighting, high-end corporate photography style, no text, no people, no faces, wide format 16:9, sharp focus with shallow depth of field, premium quality, photorealistic, suitable for luxury French law firm marketing material',
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
    console.error('[generate] Erreur DALL-E :', err)
    imageUrl = null
  }

  const { data: generation, error: dbError } = await supabase
    .from('generations')
    .insert({
      cabinet_id: cabinet.id,
      theme,
      specialite,
      article_blog: content.article_blog,
      posts_linkedin: content.posts_linkedin,
      faq: content.faq,
      image_url: imageUrl,
      statut: 'brouillon',
      date_publication: date_publication || null,
    })
    .select()
    .single()

  if (dbError) {
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde' }, { status: 500 })
  }

  return NextResponse.json({ generation, content, image_url: imageUrl })
}

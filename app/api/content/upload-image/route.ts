import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { ImagesByStyle } from '@/types'

export const maxDuration = 30

const ALLOWED_MIME = new Set(['image/png', 'image/jpeg', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024
const EXTENSION_BY_MIME: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const formData = await request.formData()
    const generationId = formData.get('generation_id')
    const file = formData.get('file')

    if (typeof generationId !== 'string' || !generationId.trim()) {
      return NextResponse.json({ error: 'generation_id manquant' }, { status: 400 })
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })
    }
    if (!ALLOWED_MIME.has(file.type)) {
      return NextResponse.json({ error: 'Format invalide (PNG, JPG ou WEBP uniquement)' }, { status: 415 })
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'Fichier trop volumineux (5 Mo max)' }, { status: 413 })
    }

    const { data: cabinet } = await supabase
      .from('cabinets')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })

    const { data: generation } = await supabase
      .from('generations')
      .select('images')
      .eq('id', generationId)
      .eq('cabinet_id', cabinet.id)
      .single()
    if (!generation) return NextResponse.json({ error: 'Génération introuvable' }, { status: 404 })

    const ext = EXTENSION_BY_MIME[file.type]
    const fileName = `${cabinet.id}/${Date.now()}-personnalisee.${ext}`
    const arrayBuffer = await file.arrayBuffer()

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, arrayBuffer, { contentType: file.type, upsert: false })
    if (uploadError) {
      return NextResponse.json({ error: `Upload échoué : ${uploadError.message}` }, { status: 500 })
    }
    const { data: urlData } = supabase.storage.from('images').getPublicUrl(fileName)
    const publicUrl = urlData.publicUrl

    const existingImages = (generation.images ?? {}) as ImagesByStyle
    const nextImages: ImagesByStyle = { ...existingImages, personnalisee: publicUrl }

    const { error: updateError } = await supabase
      .from('generations')
      .update({ images: nextImages, image_selectionnee: publicUrl })
      .eq('id', generationId)
      .eq('cabinet_id', cabinet.id)
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ url: publicUrl, images: nextImages, image_selectionnee: publicUrl })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Erreur serveur' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

  const { data: cabinet } = await supabase
    .from('cabinets')
    .select('id, nom, plan, max_membres')
    .eq('user_id', user.id)
    .single()

  if (!cabinet) return NextResponse.json({ error: 'Cabinet introuvable' }, { status: 404 })
  if (cabinet.plan !== 'cabinet') {
    return NextResponse.json({ error: 'Fonctionnalité réservée au Plan Cabinet' }, { status: 403 })
  }

  // Vérifier le nombre de membres actuels (admin = 1, donc max_membres - 1 slots pour les membres)
  const { count: membresCount } = await supabase
    .from('membres')
    .select('id', { count: 'exact', head: true })
    .eq('cabinet_id', cabinet.id)

  const maxMembresInvitables = (cabinet.max_membres ?? 3) - 1
  if ((membresCount ?? 0) >= maxMembresInvitables) {
    return NextResponse.json({
      error: `Vous avez atteint la limite de ${maxMembresInvitables} membre${maxMembresInvitables > 1 ? 's' : ''} invité${maxMembresInvitables > 1 ? 's' : ''} (${cabinet.max_membres} utilisateurs au total avec l'administrateur).`,
    }, { status: 400 })
  }

  const { email } = await request.json()
  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Adresse email invalide' }, { status: 400 })
  }

  // Vérifier si l'email est déjà invité
  const { data: existingMembre } = await supabase
    .from('membres')
    .select('id')
    .eq('cabinet_id', cabinet.id)
    .eq('email', email.toLowerCase())
    .maybeSingle()

  if (existingMembre) {
    return NextResponse.json({ error: 'Cette adresse email a déjà été invitée.' }, { status: 400 })
  }

  // Créer le record membre
  const { data: membre, error: dbError } = await supabase
    .from('membres')
    .insert({
      cabinet_id: cabinet.id,
      email: email.toLowerCase(),
      nom: email.split('@')[0],
      role: 'membre',
      statut: 'invite',
    })
    .select()
    .single()

  if (dbError) {
    console.error('[inviter] Erreur DB :', dbError)
    return NextResponse.json({ error: 'Erreur lors de la création de l\'invitation' }, { status: 500 })
  }

  // Envoyer l'email via Resend
  const appUrl = request.nextUrl.origin
  const inviteUrl = `${appUrl}/login?invite=${membre.id}&email=${encodeURIComponent(email)}`

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'Lexavo <onboarding@resend.dev>'

  const { error: emailError } = await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: `${cabinet.nom} vous invite à rejoindre Lexavo`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
        <h1 style="font-size: 24px; font-weight: bold; color: #1A3F7C; margin-bottom: 8px;">Lexavo</h1>
        <p style="color: #666; font-size: 14px; margin-bottom: 32px;">La plateforme de communication réseaux sociaux pour avocats</p>

        <p style="font-size: 16px; margin-bottom: 16px;">
          <strong>${cabinet.nom}</strong> vous invite à rejoindre leur espace Lexavo.
        </p>

        <p style="font-size: 14px; color: #555; margin-bottom: 32px;">
          Créez votre compte pour générer et publier du contenu juridique sur vos réseaux sociaux (LinkedIn et Facebook),
          avec votre propre espace indépendant.
        </p>

        <a href="${inviteUrl}"
           style="display: inline-block; background-color: #1A3F7C; color: white; text-decoration: none;
                  font-weight: bold; font-size: 15px; padding: 14px 28px; border-radius: 8px;">
          Rejoindre le cabinet →
        </a>

        <p style="font-size: 12px; color: #999; margin-top: 32px;">
          Si vous n'attendiez pas cette invitation, vous pouvez ignorer cet email.
        </p>
      </div>
    `,
  })

  if (emailError) {
    console.error('[inviter] Erreur Resend :', JSON.stringify(emailError))
    return NextResponse.json({
      membre,
      warning: `Invitation créée mais email non envoyé : ${emailError.message}`,
    })
  }

  return NextResponse.json({ membre })
}

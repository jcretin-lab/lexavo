import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Routes publiques
  const publicRoutes = ['/', '/login', '/update-password']
  const isPublic = publicRoutes.includes(pathname)
    || pathname.startsWith('/api/')
    || pathname.startsWith('/auth/')
    || pathname.startsWith('/preview/')

  if (!user && !isPublic) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Note : on ne redirige PAS /login → /dashboard quand une session existe.
  // L'utilisateur peut vouloir se reconnecter avec un autre compte ou
  // recuperer le formulaire en cas de session orpheline (signup incomplet,
  // cabinet non cree, etc.). Le formulaire /login appelle signInWithPassword
  // qui remplace la session existante proprement.

  return supabaseResponse
}

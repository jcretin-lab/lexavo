import type { NextConfig } from 'next'

// Anciennes adresses de l'application Lexavo (SaaS retiré) : redirigées vers l'accueil
// pour ne pas laisser de 404 aux personnes qui avaient un favori ou un lien.
const ANCIENNES_ROUTES = ['/login', '/dashboard', '/onboarding', '/paiement', '/update-password', '/preview']

const nextConfig: NextConfig = {
  // Mo1 — Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  async redirects() {
    return ANCIENNES_ROUTES.flatMap((route) => [
      { source: route, destination: '/', permanent: true },
      { source: `${route}/:chemin*`, destination: '/', permanent: true },
    ])
  },
}

export default nextConfig

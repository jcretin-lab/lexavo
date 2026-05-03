import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/onboarding/', '/login/', '/paiement/'],
    },
    sitemap: 'https://www.lexavo.fr/sitemap.xml',
  }
}

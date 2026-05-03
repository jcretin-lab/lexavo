import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.lexavo.fr'
  const now = new Date()

  return [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/politique-confidentialite`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
  ]
}

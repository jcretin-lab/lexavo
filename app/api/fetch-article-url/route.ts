import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

export const maxDuration = 15

const FETCH_TIMEOUT_MS = 10_000
const MAX_CHARS = 8000
const USER_AGENT = 'Mozilla/5.0 (compatible; Lexavo)'

export async function POST(request: NextRequest) {
  let body: { url?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'URL invalide' }, { status: 400 })
  }

  const url = body?.url?.trim()
  if (!url || !/^https:\/\//i.test(url)) {
    return NextResponse.json({ success: false, error: 'URL invalide' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return NextResponse.json({ success: false, error: 'URL invalide' }, { status: 400 })
  }

  if (parsed.protocol !== 'https:') {
    return NextResponse.json({ success: false, error: 'URL invalide' }, { status: 400 })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(parsed.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
  } catch (err: unknown) {
    clearTimeout(timeoutId)
    const isAbort = err instanceof Error && err.name === 'AbortError'
    if (isAbort) {
      return NextResponse.json(
        { success: false, error: 'Site trop lent à répondre' },
        { status: 504 }
      )
    }
    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de récupérer cet article. Copiez-collez le texte manuellement.',
      },
      { status: 502 }
    )
  } finally {
    clearTimeout(timeoutId)
  }

  if (response.status === 401 || response.status === 403) {
    return NextResponse.json(
      {
        success: false,
        error:
          'Ce site ne permet pas la récupération automatique. Copiez-collez le texte.',
      },
      { status: 403 }
    )
  }

  if (!response.ok) {
    return NextResponse.json(
      {
        success: false,
        error: 'Impossible de récupérer cet article. Copiez-collez le texte manuellement.',
      },
      { status: 502 }
    )
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType && !/text\/html|application\/xhtml/i.test(contentType)) {
    return NextResponse.json(
      {
        success: false,
        error: 'Aucun contenu détectable. Copiez-collez le texte.',
      },
      { status: 415 }
    )
  }

  const html = await response.text()
  if (!html || html.length < 50) {
    return NextResponse.json(
      { success: false, error: 'Aucun contenu détectable. Copiez-collez le texte.' },
      { status: 422 }
    )
  }

  const $ = cheerio.load(html)

  $('nav, header, footer, aside, script, style, noscript, iframe, form, .menu, .sidebar, .ads, .ad, .advertisement, .cookie, .newsletter, .related, .share, .social').remove()

  const containers = [
    'article',
    'main',
    '[role="main"]',
    '.content',
    '.post',
    '.entry-content',
    '.article-content',
    '.post-content',
  ]

  let rootSelector = 'body'
  for (const selector of containers) {
    const el = $(selector).first()
    if (el.length && el.text().trim().length > 200) {
      rootSelector = selector
      break
    }
  }
  const root = $(rootSelector).first()

  const parts: string[] = []
  root.find('h1, h2, h3, p, li').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim()
    if (text) parts.push(text)
  })

  let texte = parts.join('\n\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim()

  if (!texte) {
    return NextResponse.json(
      { success: false, error: 'Aucun contenu détectable. Copiez-collez le texte.' },
      { status: 422 }
    )
  }

  if (texte.length > MAX_CHARS) {
    texte = texte.slice(0, MAX_CHARS).trimEnd()
  }

  if (texte.length < 100) {
    return NextResponse.json(
      { success: false, error: 'Aucun contenu détectable. Copiez-collez le texte.' },
      { status: 422 }
    )
  }

  return NextResponse.json({ success: true, texte })
}

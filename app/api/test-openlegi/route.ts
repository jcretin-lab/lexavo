import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 300

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const SYSTEM_PROMPT = `Tu es un expert en communication juridique pour avocats français.

À partir du thème fourni, tu dois générer 1 post LinkedIn d'environ 220 mots, conforme à la déontologie du barreau français.

UTILISATION OBLIGATOIRE DE LÉGIFRANCE — PROTOCOLE STRICT :
Tu as accès à des outils Légifrance via le serveur MCP "legifrance".

Tu fais EXACTEMENT 1 SEUL appel d'outil, pas plus, en suivant ce protocole :
1. Identifie le code juridique pertinent pour le thème (ex : Code du travail, Code de commerce, Code de la consommation, Code civil).
2. Appelle UNIQUEMENT rechercher_code avec :
   - code_name : le nom exact du code identifié
   - search : 2-4 mots-clés tirés du thème
   - page_size : 3
3. À partir des résultats, choisis le 1er article qui colle au sujet et rédige le post avec.
4. Si l'appel échoue ou ne retourne rien d'exploitable, REDIGE QUAND MÊME le post mais sans citer d'article précis (formule : "selon les textes applicables…").

INTERDIT : appeler plusieurs fois rechercher_code, ni rechercher_jurisprudence_judiciaire, ni rechercher_dans_texte_legal pour ce POC.
INTERDIT : inventer une référence d'article. Tu cites uniquement ce que l'outil te renvoie.

STRUCTURE DU POST :
- Accroche en 1 ligne (un chiffre, une énumération sèche, une question fermée ou un fait méconnu)
- 2 ou 3 paragraphes courts (3 lignes max)
- Une citation Légifrance vérifiée et issue des outils
- Un appel à consultation en clôture
- 3 hashtags juridiques sur une ligne séparée

RÈGLES DÉONTOLOGIQUES :
- Aucune promesse de résultat
- Aucune comparaison avec d'autres avocats
- Aucun emoji
- Pas d'année pour désigner "aujourd'hui" (utiliser "actuellement", "à ce jour")
- Pas d'avis juridique personnalisé, rester dans le pédagogique général`

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }

  const theme = request.nextUrl.searchParams.get('theme')?.trim()
  if (!theme) {
    return NextResponse.json(
      { error: 'Paramètre `theme` manquant. Exemple : ?theme=licenciement+pour+faute+grave' },
      { status: 400 }
    )
  }

  if (!process.env.OPENLEGI_TOKEN) {
    return NextResponse.json({ error: 'OPENLEGI_TOKEN absent côté serveur' }, { status: 500 })
  }

  try {
    const startedAt = Date.now()

    const message = await anthropic.beta.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      betas: ['mcp-client-2025-11-20'],
      system: SYSTEM_PROMPT,
      mcp_servers: [
        {
          name: 'legifrance',
          type: 'url',
          url: 'https://mcp.openlegi.fr/legifrance/mcp',
          authorization_token: process.env.OPENLEGI_TOKEN,
        },
      ],
      tools: [{ type: 'mcp_toolset', mcp_server_name: 'legifrance' }],
      messages: [{ role: 'user', content: `THÈME JURIDIQUE : ${theme}` }],
    })

    const elapsedMs = Date.now() - startedAt

    const toolCalls: Array<{ name: string; input: unknown }> = []
    const toolResults: Array<{ tool_use_id: string; preview: string; is_error?: boolean }> = []
    const textChunks: string[] = []

    for (const block of message.content) {
      if (block.type === 'text') {
        textChunks.push(block.text)
      } else if (block.type === 'mcp_tool_use') {
        toolCalls.push({ name: block.name, input: block.input })
      } else if (block.type === 'mcp_tool_result') {
        const preview =
          typeof block.content === 'string'
            ? block.content.slice(0, 500)
            : JSON.stringify(block.content).slice(0, 500)
        toolResults.push({
          tool_use_id: block.tool_use_id,
          preview,
          is_error: block.is_error,
        })
      }
    }

    return NextResponse.json({
      theme,
      elapsed_ms: elapsedMs,
      stop_reason: message.stop_reason,
      usage: message.usage,
      mcp_tool_calls: toolCalls,
      mcp_tool_results: toolResults,
      post: textChunks.join('\n'),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[test-openlegi] erreur :', err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

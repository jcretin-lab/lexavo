import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import type { ArticleBlog, FaqItem, PostLinkedin } from '@/types'

// Mo5 — Page de prévisualisation publique (sans connexion requise)

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export default async function PreviewPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const { data: generation } = await supabaseAdmin
    .from('generations')
    .select('id, theme, specialite, article_blog, posts_linkedin, faq, image_url, created_at')
    .eq('id', token)
    .single()

  if (!generation) notFound()

  const article = generation.article_blog as ArticleBlog | null
  const posts = generation.posts_linkedin as PostLinkedin[] | null
  const faq = generation.faq as FaqItem[] | null

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '48px 24px', color: '#1a1a1a' }}>
      {/* Header Lexavo */}
      <div style={{ marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid #e5e7eb' }}>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Prévisualisation — Lexavo</p>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#1A3F7C', margin: 0 }}>
          {generation.theme}
        </h2>
        <p style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>{generation.specialite}</p>
      </div>

      {/* Image */}
      {generation.image_url && (
        <div style={{ marginBottom: '40px' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={generation.image_url}
            alt={article?.alt_image ?? generation.theme}
            style={{ width: '100%', borderRadius: '12px', objectFit: 'cover' }}
          />
        </div>
      )}

      {/* Article */}
      {article && (
        <section style={{ marginBottom: '48px' }}>
          <div
            style={{ lineHeight: 1.7, fontSize: '16px' }}
            dangerouslySetInnerHTML={{ __html: article.contenu }}
          />
        </section>
      )}

      {/* Posts réseaux sociaux */}
      {posts && posts.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A3F7C', marginBottom: '20px' }}>
            Posts pour vos réseaux sociaux
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {posts.map((post, i) => (
              <div
                key={i}
                style={{
                  padding: '20px',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  background: '#fafafa',
                }}
              >
                <p style={{ margin: '0 0 12px 0', whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>{post.texte}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {post.hashtags.map((tag, j) => (
                    <span
                      key={j}
                      style={{
                        fontSize: '12px',
                        color: '#0A66C2',
                        background: '#EEF3FF',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      #{tag.replace('#', '')}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      {faq && faq.length > 0 && (
        <section style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1A3F7C', marginBottom: '20px' }}>
            Questions fréquentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faq.map((item, i) => (
              <div key={i} style={{ padding: '16px 20px', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
                <p style={{ fontWeight: 600, margin: '0 0 8px 0', color: '#1a1a1a' }}>{item.question}</p>
                <p style={{ margin: 0, color: '#555', lineHeight: 1.65 }}>{item.reponse}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: '#aaa' }}>
          Généré par <strong>Lexavo</strong> · lexavo.fr
        </p>
      </div>
    </div>
  )
}

import Link from 'next/link'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { ScrollAnimationInit } from '@/components/landing/scroll-animation'
import { FaqAccordion } from '@/components/landing/faq-accordion'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { RainingLettersBg } from '@/components/landing/raining-letters-bg'

/* ── Palette éditoriale ───────────────────────────────── */
const ED = {
  ink:   '#0F0E0C',
  navy:  '#0F2247',
  paper: '#F3EFE5',
  cream: '#FAF8F3',
  mid:   '#6E6860',
  rule:  '#D0CBC0',
  gold:  '#B8872A',
}

/* ── Données ─────────────────────────────────────────── */
const INPUT_FORMATS = ['Un thème', "Une URL d'article", 'Un article collé']

const OUTPUT_ITEMS = ['3 posts LinkedIn/Facebook', 'Article SEO', 'FAQ', 'Image']

const FAQ_LANDING = [
  {
    q: 'Les contenus respectent-ils la déontologie du barreau ?',
    r: 'Oui. Lexavo intègre les règles du RIN et du décret du 12 juillet 2005 dans chaque génération. Nous vous recommandons toutefois de relire chaque contenu avant publication.',
  },
  {
    q: "Pour qui Lexavo n'est pas conçu ?",
    r: "Lexavo n'est pas adapté aux cabinets d'affaires internationaux dont la clientèle n'est ni sur LinkedIn ni sur Facebook, ni aux avocats qui cherchent un contenu polémique ou comparatif — interdit par la déontologie.",
  },
  {
    q: 'Puis-je annuler mon abonnement à tout moment ?',
    r: 'Oui, sans engagement ni frais. La résiliation prend effet à la fin du mois en cours.',
  },
  {
    q: 'Comment connecter mes réseaux sociaux ?',
    r: "Depuis votre tableau de bord, téléchargez le scénario Make.com prêt à l'emploi et son guide de configuration. Comptez environ 20 minutes pour la mise en place initiale.",
  },
]

/* ── En-tête de section éditorial ────────────────────── */
function SectionHeader({ num: _num, label, title, subtitle, dark = false }: {
  num: string; label: string; title: string; subtitle?: string; dark?: boolean
}) {
  const textColor = dark ? ED.paper : ED.ink
  const ruleColor = dark ? 'rgba(255,255,255,0.12)' : ED.rule
  const subColor  = dark ? 'rgba(243,239,229,0.55)' : ED.mid
  return (
    <div className="mb-12 fade-in">
      <div style={{ borderTop: `1px solid ${ruleColor}`, paddingTop: '1.25rem', marginBottom: '1rem' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: ED.gold }}>
          {label}
        </span>
      </div>
      <h2 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 3.5vw, 3rem)', lineHeight: 1.05, letterSpacing: '-0.025em', color: textColor, fontStyle: 'italic', marginBottom: subtitle ? '1rem' : 0 }}>
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: '1rem', color: subColor, lineHeight: 1.65, maxWidth: '38rem' }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ── Page ────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ background: ED.paper, color: ED.ink }}>
      <ScrollAnimationInit />

      <LandingNav />

      {/* ══ Hero — un seul écran ═════════════════════════════ */}
      <section style={{ background: ED.ink, minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        <RainingLettersBg />
        <div className="max-w-3xl mx-auto px-6 text-center" style={{ paddingTop: '4rem', paddingBottom: '2rem', position: 'relative', zIndex: 1 }}>

          <span
            className="fade-in"
            style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: 'clamp(0.6875rem, 1.4vw, 0.875rem)', letterSpacing: '0.18em', color: ED.gold, display: 'block', marginBottom: '2rem' }}
          >
            POUR AVOCATS FRANÇAIS
          </span>

          <h1
            className="fade-in fade-in-delay-1"
            style={{
              fontFamily: 'var(--font-instrument-serif)',
              fontSize: 'clamp(2.5rem, 6vw, 5rem)',
              lineHeight: 1.02,
              letterSpacing: '-0.03em',
              color: ED.paper,
              fontStyle: 'italic',
              marginBottom: '1.5rem',
            }}
          >
            Une présence régulière sur{' '}
            <span style={{ color: '#0A66C2' }}>LinkedIn</span>
            {' '}et{' '}
            <span style={{ color: '#5E9EF5' }}>Facebook</span>
            ,{' '}sans y consacrer du temps.
          </h1>

          <p
            className="fade-in fade-in-delay-1"
            style={{ fontSize: '1.0625rem', color: 'rgba(243,239,229,0.65)', lineHeight: 1.6, maxWidth: '32rem', margin: '0 auto 2.5rem' }}
          >
            Générez article, posts et FAQ en 3 minutes, conformes à la déontologie du barreau.
          </p>

          <div className="fade-in fade-in-delay-2 flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/login?mode=signup" className="ed-cta-primary">
              Commencer gratuitement →
            </Link>
            <Link href="/login" className="ed-cta-ghost">
              Se connecter
            </Link>
          </div>

          <div className="fade-in fade-in-delay-2 flex flex-wrap gap-2 justify-center">
            {['Déontologie CNB', 'Hébergement EU', 'RGPD'].map((label) => (
              <span
                key={label}
                style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.38)', border: '1px solid rgba(255,255,255,0.12)', padding: '0.25rem 0.625rem' }}
              >
                ✓ {label.toUpperCase()}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Ce que vous obtenez ══════════════════════════════ */}
      <section id="fonctionnalites" style={{ background: ED.navy, padding: '8rem 1.5rem' }}>
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            num="01"
            label="CE QUE VOUS OBTENEZ"
            title="D'un sujet à toute votre semaine éditoriale."
            subtitle="Un thème ou un article. Trois minutes. Prêt à publier."
            dark
          />

          <div className="fade-in fade-in-delay-1 flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex flex-wrap gap-2 justify-center">
              {INPUT_FORMATS.map(item => (
                <span key={item} className="rounded-full px-4 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.06)', color: ED.paper }}>
                  {item}
                </span>
              ))}
            </div>
            <span style={{ color: ED.gold, fontSize: '1.5rem', fontFamily: 'var(--font-jetbrains-mono)' }}>→</span>
            <div className="flex flex-wrap gap-2 justify-center">
              {OUTPUT_ITEMS.map(item => (
                <span key={item} className="rounded-full px-4 py-2 text-sm font-medium" style={{ background: 'rgba(184,135,42,0.15)', color: ED.gold }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="fade-in fade-in-delay-2 text-center" style={{ fontSize: '0.9375rem', color: 'rgba(243,239,229,0.5)', marginTop: '2.5rem' }}>
            Publication immédiate ou programmée, toujours modifiable, automatique sur LinkedIn et Facebook.
          </p>

          <div className="fade-in fade-in-delay-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem', marginTop: '3rem', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.375rem, 2.5vw, 2rem)', color: ED.paper, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              «&thinsp;Un mois de posts, préparé en une fois. LinkedIn pour vos clients pros, Facebook pour vos particuliers.&thinsp;»
            </p>
          </div>
        </div>
      </section>

      {/* ══ Message ══════════════════════════════════════════ */}
      <section style={{ background: ED.paper, padding: '8rem 1.5rem' }}>
        <div className="max-w-4xl mx-auto text-center fade-in">
          <h2 style={{
            fontFamily: 'var(--font-instrument-serif)',
            fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            color: ED.ink,
            fontStyle: 'italic',
          }}>
            Publiez régulièrement et devenez l&apos;avocat visible dans un océan de confrères invisibles.
          </h2>
        </div>
      </section>

      {/* ══ Tarifs ═══════════════════════════════════════════ */}
      <section id="tarifs" style={{ background: ED.cream, padding: '8rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            num="03"
            label="TARIFS"
            title="Des tarifs simples, sans surprise."
            subtitle="10 générations offertes. Sans carte bancaire."
          />
          <div className="flex justify-center mb-12">
            <Link href="/login?mode=signup" className="ed-cta-primary">
              Essai gratuit →
            </Link>
          </div>
          <LandingPricing />
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════ */}
      <section style={{ background: ED.paper, padding: '8rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            num="04"
            label="QUESTIONS FRÉQUENTES"
            title="Vos questions, nos réponses."
          />
          <FaqAccordion items={FAQ_LANDING} />
        </div>
      </section>

      {/* ══ CTA final ════════════════════════════════════════ */}
      <section style={{ background: ED.navy, padding: '8rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 55% 45% at 50% 60%, rgba(184,135,42,0.07) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div className="relative max-w-3xl mx-auto text-center fade-in">
          <h2 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(2.25rem, 5vw, 4rem)', color: ED.paper, letterSpacing: '-0.03em', lineHeight: 0.97, fontStyle: 'italic', marginBottom: '1.75rem' }}>
            Prêt à publier votre premier contenu ?
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(243,239,229,0.55)', lineHeight: 1.65, marginBottom: '2.5rem' }}>
            10 générations offertes. Sans carte bancaire.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login?mode=signup" className="ed-cta-primary" style={{ fontSize: '0.875rem', padding: '1.0625rem 2.5rem' }}>
              Commencer l&apos;essai gratuit →
            </Link>
            <Link href="/login" className="ed-cta-ghost" style={{ fontSize: '0.875rem', padding: '1.0625rem 2.5rem' }}>
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

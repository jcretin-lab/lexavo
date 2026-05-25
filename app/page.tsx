import Link from 'next/link'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { ScrollAnimationInit } from '@/components/landing/scroll-animation'
import { FaqAccordion } from '@/components/landing/faq-accordion'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

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
const INPUT_FORMATS = [
  { titre: 'Un thème', desc: 'Un sujet juridique (ex : licenciement pour faute grave).' },
  { titre: "Une URL d'article", desc: 'Collez un lien : Lexavo extrait le texte automatiquement.' },
  { titre: 'Un article collé', desc: 'Collez directement votre texte (200 mots minimum recommandés).' },
]

const PUBLICATION_ITEMS = [
  { titre: 'Article de blog SEO', desc: '900 à 1 200 mots structurés pour Google : H1, balises méta, mots-clés ciblés, slug optimisé.' },
  { titre: '3 posts LinkedIn et Facebook', desc: 'Trois angles distincts (pédagogique, cas pratique, conseil…), prêts à publier.' },
  { titre: 'FAQ juridique', desc: "5 questions-réponses pour enrichir l'article et capter la longue traîne." },
  { titre: 'Image éditoriale', desc: 'Un visuel sur-mesure généré par IA, ou uploadez votre propre image en un clic.' },
  { titre: 'Programmation automatique', desc: 'Publication immédiate ou planifiée via calendrier éditorial, sur LinkedIn et Facebook.' },
]

const RASSURANCE = [
  { titre: 'Conforme à la déontologie', desc: 'Le contenu respecte les règles de communication du Conseil National des Barreaux. Sobre, factuel, sans publicité comparative.' },
  { titre: 'Données sécurisées', desc: 'Hébergement en Europe, chiffrement SSL, aucune revente de vos données. Entièrement conforme au RGPD.' },
  { titre: 'Sans engagement', desc: "Résiliation à tout moment en un clic. Pas de frais cachés, pas de reconduction tacite sans préavis." },
]

const FAQ_LANDING = [
  {
    q: 'Qui est le fondateur de Lexavo ?',
    r: "Lexavo est fondé par Julien Pretet, spécialiste de la création de sites internet, du SEO et de l'automatisation pour les cabinets d'avocats. Le produit est développé en partenariat avec une docteure en droit.",
  },
  {
    q: "Pour qui Lexavo n'est pas conçu ?",
    r: "Lexavo n'est pas adapté aux cabinets d'affaires internationaux dont la clientèle n'est ni sur LinkedIn ni sur Facebook (M&A, fiscalité internationale), ni aux avocats qui cherchent un contenu polémique ou comparatif — interdit par la déontologie. Nous misons sur la régularité de publication, pas sur le volume.",
  },
  {
    q: 'Est-ce que Lexavo fonctionne sans site web ?',
    r: 'Oui. Lexavo génère du contenu pour vos réseaux sociaux et votre blog indépendamment de votre site web.',
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    r: 'Oui, sans engagement ni frais. La résiliation prend effet à la fin du mois en cours.',
  },
  {
    q: 'Les contenus respectent-ils la déontologie du barreau ?',
    r: 'Oui. Lexavo intègre les règles du RIN et du décret du 12 juillet 2005 dans chaque génération. Nous vous recommandons toutefois de relire chaque contenu avant publication.',
  },
  {
    q: 'Comment connecter mes réseaux sociaux ?',
    r: "Depuis votre tableau de bord, téléchargez en un clic le scénario Make.com prêt à l'emploi ainsi que son guide de configuration. Vous obtenez ensuite une URL webhook que vous collez dans Lexavo. Comptez environ 20 minutes pour la mise en place initiale.",
  },
]

/* ── En-tête de section éditorial ────────────────────── */
function SectionHeader({ num, label, title, subtitle, dark = false }: {
  num: string; label: string; title: string; subtitle?: string; dark?: boolean
}) {
  const textColor = dark ? ED.paper : ED.ink
  const ruleColor = dark ? 'rgba(255,255,255,0.12)' : ED.rule
  const subColor  = dark ? 'rgba(243,239,229,0.55)' : ED.mid
  return (
    <div className="mb-16 fade-in">
      <div style={{ borderTop: `1px solid ${ruleColor}`, paddingTop: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: ED.gold }}>
          {label}
        </span>
        <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.15em', color: ruleColor }}>
          {num}
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

/* ── Mockup hero ─────────────────────────────────────── */
function HeroMockup() {
  return (
    <div className="relative w-full">
      <div
        className="absolute -inset-8 rounded-[40px] opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, #4870B3, transparent 70%)' }}
      />
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'var(--white)',
          border: '1px solid var(--ink-200)',
          boxShadow: '0 32px 80px -20px rgba(15,34,71,0.22), 0 4px 16px -4px rgba(15,34,71,0.08)',
        }}
      >
        <div className="px-5 py-3 flex items-center gap-3 border-b" style={{ background: 'var(--ink-50)', borderColor: 'var(--ink-200)' }}>
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
          </div>
          <div className="flex-1 rounded-md px-3 py-1.5 text-xs text-center" style={{ background: 'var(--white)', color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)', border: '1px solid var(--ink-200)' }}>
            app.lexavo.fr/dashboard/generer
          </div>
        </div>
        <div className="p-5" style={{ background: 'var(--ink-50)' }}>
          <div className="grid grid-cols-5 gap-4">
            <div className="col-span-1 rounded-xl p-3 space-y-1" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
              <div className="mb-3 px-2 py-1.5">
                <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-instrument-serif)', color: 'var(--navy-900)' }}>Lexavo.</span>
              </div>
              {['Générer', 'Article → Post', 'Calendrier', 'Contenu', 'Paramètres'].map((item, i) => (
                <div key={item} className="px-2 py-1.5 rounded-lg text-[10px] font-medium" style={{ background: i === 0 ? 'var(--navy-50)' : 'transparent', color: i === 0 ? 'var(--navy-900)' : 'var(--ink-400)', border: i === 0 ? '1px solid var(--navy-100)' : '1px solid transparent' }}>
                  {item}
                </div>
              ))}
            </div>
            <div className="col-span-4 grid grid-cols-5 gap-3">
              <div className="col-span-2 rounded-xl p-3.5 space-y-3" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
                <p className="text-[11px] font-semibold" style={{ color: 'var(--ink-700)' }}>Paramètres de génération</p>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)' }}>Spécialité</p>
                  <div className="rounded-lg px-2.5 py-1.5 text-[10px] flex items-center justify-between" style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-200)', color: 'var(--ink-700)' }}>
                    Droit du travail <span style={{ color: 'var(--ink-400)', fontSize: '8px' }}>▾</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)' }}>Thème</p>
                  <div className="rounded-lg px-2.5 py-2 text-[10px] leading-relaxed h-14 overflow-hidden" style={{ background: 'var(--ink-50)', border: '1px solid var(--ink-200)', color: 'var(--ink-500)' }}>
                    Les 5 erreurs à éviter lors d&apos;un licenciement pour faute grave...
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)' }}>Ton</p>
                  <div className="flex gap-1 flex-wrap">
                    {['Pédagogique', 'Expert', 'Rassurant'].map((t, i) => (
                      <span key={t} className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: i === 0 ? 'var(--navy-900)' : 'var(--ink-100)', color: i === 0 ? 'var(--white)' : 'var(--ink-500)' }}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="text-[10px] font-semibold px-3 py-2 rounded-xl text-center" style={{ background: 'var(--navy-900)', color: 'var(--white)' }}>
                  ✦ Générer le contenu
                </div>
              </div>
              <div className="col-span-3 rounded-xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
                <div className="flex border-b" style={{ borderColor: 'var(--ink-200)' }}>
                  {['Posts réseaux', 'Article SEO', 'FAQ', 'Image IA'].map((tab, i) => (
                    <div key={tab} className="flex-1 py-2 text-center text-[9px] font-medium border-b-2" style={{ color: i === 0 ? 'var(--navy-900)' : 'var(--ink-400)', borderColor: i === 0 ? 'var(--navy-900)' : 'transparent' }}>
                      {tab}
                    </div>
                  ))}
                </div>
                <div className="p-3 space-y-2">
                  <div className="rounded-xl p-3" style={{ border: '1px solid var(--ink-200)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)' }}>Post 1</span>
                      <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'var(--navy-50)', color: 'var(--navy-900)' }}>Pédagogique</span>
                      <span className="ml-auto text-[9px] font-medium" style={{ color: 'var(--success)', background: 'var(--success-50)', padding: '1px 6px', borderRadius: '999px' }}>✓ Prêt</span>
                    </div>
                    <p className="text-[10px] leading-relaxed mb-2" style={{ color: 'var(--ink-600)' }}>
                      Le licenciement pour faute grave est une procédure aux multiples pièges. Voici les 5 erreurs les plus fréquentes que je constate en cabinet...
                    </p>
                    <div className="flex gap-1 flex-wrap">
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--navy-900)', background: 'var(--navy-50)' }}>#DroitDuTravail</span>
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ color: 'var(--navy-900)', background: 'var(--navy-50)' }}>#Avocat</span>
                    </div>
                  </div>
                  {[['Post 2', 'Cas pratique', 'var(--ocre-50)', 'var(--ocre-700)'], ['Post 3', 'Storytelling', 'var(--success-50)', 'var(--success)']].map(([label, tag, bg, color]) => (
                    <div key={label} className="rounded-xl p-3 opacity-50" style={{ border: '1px solid var(--ink-100)' }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[8px] font-bold uppercase tracking-widest" style={{ color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)' }}>{label}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: bg, color }}>{tag}</span>
                      </div>
                      <div className="space-y-1.5">
                        <div className="h-1.5 rounded-full w-full" style={{ background: 'var(--ink-100)' }} />
                        <div className="h-1.5 rounded-full w-4/5" style={{ background: 'var(--ink-100)' }} />
                        <div className="h-1.5 rounded-full w-3/5" style={{ background: 'var(--ink-100)' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-xl p-3 flex items-center gap-4" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
            <div className="w-24 h-12 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--navy-100) 0%, var(--navy-500) 100%)' }}>
              <span className="text-[8px] font-medium" style={{ color: 'rgba(255,255,255,0.8)' }}>IA</span>
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold mb-1.5" style={{ color: 'var(--ink-700)' }}>1 image IA générée — ou uploadez la vôtre</p>
              <div className="flex gap-2">
                <div className="h-1.5 rounded-full flex-1" style={{ background: 'var(--navy-200, #c0cfe8)' }} />
                <div className="h-1.5 rounded-full" style={{ background: 'var(--ink-100)', width: '30%' }} />
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <span className="text-[9px] font-semibold px-2.5 py-1 rounded-full" style={{ color: 'var(--success)', background: 'var(--success-50)' }}>✓ Prêt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Mockup calendrier ───────────────────────────────── */
function CalendarMockup() {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const posts = [
    { day: 1, col: 1, label: 'FB', color: '#1877F2', title: "Licenciement abusif : vos droits" },
    { day: 3, col: 3, label: 'LI', color: '#0A66C2', title: "Garde d'enfants : changements 2025" },
    { day: 5, col: 5, label: 'FB', color: '#1877F2', title: 'Harcèlement moral au travail' },
  ]
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)', boxShadow: '0 24px 60px -16px rgba(15,34,71,0.18)' }}>
      <div className="px-5 py-3.5 flex items-center justify-between border-b" style={{ borderColor: 'var(--ink-200)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color: 'var(--ink-900)' }}>Calendrier éditorial</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'var(--navy-50)', color: 'var(--navy-900)', border: '1px solid var(--navy-100)' }}>Juin 2026</span>
        </div>
        <div className="flex gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px]" style={{ background: 'var(--ink-100)', color: 'var(--ink-500)' }}>‹</div>
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[9px]" style={{ background: 'var(--ink-100)', color: 'var(--ink-500)' }}>›</div>
        </div>
      </div>
      <div className="grid grid-cols-7 px-4 pt-3 pb-1 gap-1">
        {days.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold uppercase tracking-widest py-1" style={{ color: 'var(--ink-400)' }}>{d}</div>
        ))}
      </div>
      <div className="px-4 pb-4">
        {[0, 1, 2, 3].map((week) => (
          <div key={week} className="grid grid-cols-7 gap-1 mb-1">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => {
              const dayNum = week * 7 + d + 1
              const post = posts.find(p => p.day === dayNum && p.col === d)
              const isToday = dayNum === 12
              return (
                <div key={d} className="rounded-lg p-1.5 min-h-[48px]" style={{ background: isToday ? 'var(--navy-50)' : 'var(--ink-50)', border: isToday ? '1px solid var(--navy-200, #c0cfe8)' : '1px solid transparent' }}>
                  <span className="text-[9px] font-medium block mb-1" style={{ color: isToday ? 'var(--navy-900)' : 'var(--ink-400)' }}>
                    {dayNum <= 30 ? dayNum : ''}
                  </span>
                  {post && (
                    <div className="rounded px-1 py-0.5 text-[8px] font-medium leading-tight" style={{ background: post.color, color: '#fff' }}>
                      {post.label} · {post.title.slice(0, 18)}…
                    </div>
                  )}
                  {(dayNum === 5 || dayNum === 9 || dayNum === 15 || dayNum === 19 || dayNum === 23) && !post && (
                    <div className="rounded px-1 py-0.5 text-[8px] font-medium" style={{ background: dayNum % 2 === 0 ? '#1877F2' : '#0A66C2', color: '#fff', opacity: 0.8 }}>
                      {dayNum % 2 === 0 ? 'FB' : 'LI'}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <div className="mx-4 mb-4 rounded-xl p-3 flex items-center justify-between" style={{ background: 'var(--success-50)', border: '1px solid #cfe6da' }}>
        <div>
          <p className="text-[10px] font-semibold" style={{ color: 'var(--success)' }}>✓ 8 publications programmées ce mois</p>
          <p className="text-[9px]" style={{ color: 'var(--ink-500)' }}>Publication automatique active · LinkedIn et Facebook</p>
        </div>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--success)', boxShadow: '0 0 0 4px rgba(31,122,76,0.15)' }} />
      </div>
    </div>
  )
}

/* ── Fond photo hero ─────────────────────────────────── */
function HeroBackground() {
  return (
    <div aria-hidden style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {/* Photo — placer dans public/hero-bg.jpg */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url(/hero-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        opacity: 0.38,
      }} />
      {/* Dégradé — lisibilité texte + teinte éditoriale */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: [
          'linear-gradient(to right, rgba(15,14,12,0.82) 0%, rgba(15,14,12,0.55) 55%, rgba(15,14,12,0.72) 100%)',
          'linear-gradient(to bottom, rgba(15,14,12,0.45) 0%, rgba(15,14,12,0.15) 45%, rgba(15,14,12,0.60) 100%)',
        ].join(', '),
      }} />
    </div>
  )
}

/* ── Page ────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div style={{ background: ED.paper, color: ED.ink }}>
      <ScrollAnimationInit />

      <LandingNav />

      {/* ══ Hero ═════════════════════════════════════════════ */}
      <section style={{ background: ED.ink, paddingTop: '5rem', overflow: 'hidden', position: 'relative' }}>
        <HeroBackground />
        <div className="max-w-6xl mx-auto px-6" style={{ paddingTop: '3rem', paddingBottom: '5rem', position: 'relative', zIndex: 1 }}>

          {/* Filet supérieur + label */}
          <div
            className="fade-in"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.75rem', marginBottom: '2.5rem' }}
          >
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: ED.gold }}>
              COMMUNICATION JURIDIQUE — POUR AVOCATS FRANÇAIS
            </span>
          </div>

          {/* Titre principal */}
          <h1
            className="fade-in fade-in-delay-1"
            style={{
              fontFamily: 'var(--font-instrument-serif)',
              fontSize: 'clamp(2.75rem, 6.5vw, 6rem)',
              lineHeight: 0.97,
              letterSpacing: '-0.03em',
              color: ED.paper,
              fontStyle: 'italic',
              marginBottom: '2.5rem',
              maxWidth: '22ch',
            }}
          >
            Une présence régulière sur{' '}
            <span style={{ color: '#4A88D8' }}>LinkedIn</span>
            {' '}et{' '}
            <span style={{ color: '#5E9EF5' }}>Facebook</span>
            ,{' '}sans y consacrer du temps.
          </h1>

          {/* Filet de séparation */}
          <div
            className="fade-in fade-in-delay-2"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem' }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Descriptif */}
              <p style={{ fontSize: '1.0625rem', color: 'rgba(243,239,229,0.65)', lineHeight: 1.75, maxWidth: '34rem' }}>
                À partir d&apos;un sujet ou d&apos;un article déjà écrit, Lexavo génère un article SEO,
                3&nbsp;posts adaptés à LinkedIn et Facebook, une FAQ et une image en moins d&apos;1&nbsp;minute.
                Conforme à la déontologie du barreau.
              </p>

              {/* CTAs + badges */}
              <div>
                <div className="flex flex-col sm:flex-row gap-3 mb-6">
                  <Link href="/login?mode=signup" className="ed-cta-primary">
                    Commencer gratuitement →
                  </Link>
                  <a href="#fonctionnalites" className="ed-cta-ghost">
                    Voir comment ça marche
                  </a>
                </div>
                <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.18em', color: 'rgba(255,255,255,0.28)', marginBottom: '0.75rem' }}>
                  CONÇU AVEC ET POUR LES AVOCATS FRANÇAIS
                </p>
                <div className="flex flex-wrap gap-2">
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
            </div>

            {/* Stats visuelles — mobiles uniquement */}
            <div className="grid grid-cols-3 gap-6 mt-12 lg:hidden fade-in fade-in-delay-3">
              {[
                { num: '< 3 min', label: 'PAR GÉNÉRATION' },
                { num: '5 formats', label: 'LIVRABLES INCLUS' },
                { num: '100%', label: 'DÉONTOLOGIE CNB' },
              ].map(({ num, label }) => (
                <div key={num} style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1rem' }}>
                  <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.25rem, 4vw, 1.875rem)', color: ED.paper, fontStyle: 'italic', letterSpacing: '-0.025em', lineHeight: 1, marginBottom: '0.5rem' }}>
                    {num}
                  </p>
                  <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '8px', letterSpacing: '0.18em', color: 'rgba(243,239,229,0.35)' }}>
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ Positionnement ═══════════════════════════════════ */}
      <section id="comment" style={{ background: ED.paper, padding: '6rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            num="01"
            label="DEUX RÉSEAUX, TOUTE VOTRE CLIENTÈLE"
            title="LinkedIn et Facebook : les 2 réseaux les plus prometteurs pour un cabinet"
            subtitle="Inutile d'être partout. Concentrez vos efforts là où vos futurs clients vous cherchent vraiment."
          />

          {/* Grille éditoriale LinkedIn / Facebook */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0 fade-in fade-in-delay-1">
            {/* LinkedIn */}
            <div style={{ borderTop: `3px solid #0A66C2`, paddingTop: '1.75rem', paddingRight: '2.5rem', paddingBottom: '2.5rem' }}>
              <div className="flex items-center gap-3 mb-5">
                <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 700, fontSize: '0.875rem', background: '#0A66C2', color: 'white', padding: '0.2rem 0.5rem' }}>in</span>
                <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.18em', color: '#0A66C2' }}>LINKEDIN</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.625rem', color: ED.ink, letterSpacing: '-0.015em', lineHeight: 1.15, marginBottom: '0.875rem', fontStyle: 'italic' }}>
                Pour vos clients professionnels
              </h3>
              <p style={{ fontSize: '0.9375rem', color: ED.mid, lineHeight: 1.75, marginBottom: '1.5rem' }}>
                Décideurs, dirigeants, DRH, juristes d&apos;entreprise. C&apos;est ici que se nouent les <strong style={{ color: ED.ink, fontWeight: 600 }}>mandats récurrents à forte valeur</strong> et que vos pairs vous prescrivent.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Droit des affaires', 'Droit social', 'Immobilier pro', 'RH', 'Contentieux'].map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.1em', padding: '0.25rem 0.625rem', border: `1px solid ${ED.rule}`, color: ED.mid }}>
                    {t.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            {/* Filet vertical (desktop) */}
            <div className="hidden md:block" style={{ background: ED.rule, margin: '1.75rem 0' }} />

            {/* Facebook */}
            <div style={{ borderTop: `3px solid #1877F2`, paddingTop: '1.75rem', paddingLeft: '2.5rem', paddingBottom: '2.5rem' }}>
              <div className="flex items-center gap-3 mb-5">
                <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontWeight: 700, fontSize: '0.875rem', background: '#1877F2', color: 'white', padding: '0.2rem 0.5rem' }}>f</span>
                <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.18em', color: '#1877F2' }}>FACEBOOK</span>
              </div>
              <h3 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.625rem', color: ED.ink, letterSpacing: '-0.015em', lineHeight: 1.15, marginBottom: '0.875rem', fontStyle: 'italic' }}>
                Pour vos clients particuliers
              </h3>
              <p style={{ fontSize: '0.9375rem', color: ED.mid, lineHeight: 1.75, marginBottom: '1.5rem' }}>
                Familles, salariés, locataires, consommateurs. C&apos;est le réseau du <strong style={{ color: ED.ink, fontWeight: 600 }}>bouche-à-oreille local</strong> et des recherches juridiques de la vie courante.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Famille', 'Travail', 'Immobilier', 'Consommation', 'Pénal'].map(t => (
                  <span key={t} style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.1em', padding: '0.25rem 0.625rem', border: `1px solid ${ED.rule}`, color: ED.mid }}>
                    {t.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Note de bas de section */}
          <div style={{ borderTop: `1px solid ${ED.rule}`, paddingTop: '1.5rem', marginTop: '1.5rem' }} className="fade-in">
            <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(110,104,96,0.65)', fontStyle: 'italic' }}>
              Pourquoi pas X ou TikTok ? Parce qu&apos;à temps égal, LinkedIn et Facebook convertissent davantage en mandats pour un cabinet d&apos;avocats.
            </p>
          </div>
        </div>
      </section>

      {/* ══ Fonctionnalités ══════════════════════════════════ */}
      <section id="fonctionnalites" style={{ background: ED.navy, padding: '6rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            num="02"
            label="CE QUE VOUS OBTENEZ"
            title="D'un sujet à toute votre semaine éditoriale."
            subtitle="Article SEO, posts, FAQ, image et programmation — produits et planifiés en moins d&apos;1 minute."
            dark
          />

          {/* Table éditoriale : VOUS FOURNISSEZ → VOUS OBTENEZ */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_56px_1fr] gap-8 lg:gap-0 mb-16 fade-in fade-in-delay-1">
            {/* Colonne gauche : inputs */}
            <div>
              <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.875rem' }}>
                VOUS FOURNISSEZ
              </p>
              {INPUT_FORMATS.map((fmt, i) => (
                <div
                  key={fmt.titre}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}
                >
                  <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.125rem', color: ED.paper, marginBottom: '0.35rem', fontStyle: 'italic', letterSpacing: '-0.01em' }}>
                    {fmt.titre}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(243,239,229,0.48)', lineHeight: 1.65 }}>
                    {fmt.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Séparateur central (desktop) */}
            <div className="hidden lg:flex items-center justify-center">
              <div style={{ width: '1px', height: '100%', background: 'rgba(255,255,255,0.08)' }} />
            </div>

            {/* Filet de séparation (mobile) */}
            <div className="lg:hidden" style={{ borderTop: `1px solid rgba(255,255,255,0.12)`, margin: '0.5rem 0' }} />

            {/* Colonne droite : outputs */}
            <div>
              <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.875rem' }}>
                VOUS OBTENEZ
              </p>
              {PUBLICATION_ITEMS.map((item) => (
                <div
                  key={item.titre}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}
                >
                  <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.125rem', color: ED.paper, marginBottom: '0.35rem', fontStyle: 'italic', letterSpacing: '-0.01em' }}>
                    {item.titre}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'rgba(243,239,229,0.48)', lineHeight: 1.65 }}>
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Aperçu de l'application */}
          <div className="max-w-4xl mx-auto fade-in fade-in-delay-2">
            <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.25)', marginBottom: '1.25rem', textAlign: 'center' }}>
              APERÇU DE L&apos;INTERFACE
            </p>
            <div className="mockup-mobile-wrapper">
              <div className="mockup-mobile-inner">
                <HeroMockup />
              </div>
            </div>
          </div>

          {/* Citation tirée */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem', marginTop: '3rem', textAlign: 'center' }} className="fade-in">
            <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.375rem, 2.5vw, 2rem)', color: ED.paper, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
              «&thinsp;Le brouillon, c&apos;est nous. La voix, c&apos;est vous.&thinsp;»
            </p>
            <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.18em', color: ED.gold, marginTop: '1rem' }}>
              CHAQUE CONTENU RESTE ENTIÈREMENT MODIFIABLE AVANT PUBLICATION
            </p>
          </div>
        </div>
      </section>

      {/* ══ Calendrier éditorial ═════════════════════════════ */}
      <section style={{ background: ED.paper, padding: '6rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="hidden lg:block fade-in-left fade-in-delay-1">
            <CalendarMockup />
          </div>
          <div className="fade-in-right">
            <SectionHeader
              num="03"
              label="PUBLICATION AUTOMATIQUE"
              title="Publiez quand vous voulez."
              subtitle="Immédiatement ou à la date de votre choix via le calendrier éditorial. Vos comptes LinkedIn et Facebook reçoivent votre contenu automatiquement."
            />
            <div style={{ borderTop: `1px solid ${ED.rule}`, paddingTop: '1.75rem' }}>
              {[
                "Programmation à la date et l'heure de votre choix",
                'Publication automatique sur LinkedIn et Facebook',
                'Calendrier éditorial visuel pour piloter votre présence',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.125rem' }}>
                  <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', color: ED.gold, flexShrink: 0, paddingTop: '0.15rem' }}>0{i + 1}</span>
                  <p style={{ fontSize: '0.9375rem', color: ED.mid, lineHeight: 1.65 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ Tarifs ═══════════════════════════════════════════ */}
      <section id="tarifs" style={{ background: ED.cream, padding: '6rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            num="04"
            label="TARIFS"
            title="Des tarifs simples, sans surprise."
            subtitle="10 générations d'essai offertes. Aucune carte bancaire requise pour commencer. Tous les plans sont illimités en générations."
          />
          <LandingPricing />
        </div>
      </section>

      {/* ══ Rassurance ═══════════════════════════════════════ */}
      <section style={{ background: ED.navy, padding: '6rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            num="05"
            label="POURQUOI LEXAVO"
            title="Conçu pour les cabinets d'avocats."
            dark
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {RASSURANCE.map((item, i) => (
              <div
                key={item.titre}
                className={`fade-in fade-in-delay-${i + 1}`}
                style={{ borderLeft: `3px solid ${ED.gold}`, paddingLeft: '1.5rem', paddingTop: '0.25rem', paddingBottom: '0.25rem' }}
              >
                <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.125rem', color: ED.paper, marginBottom: '0.625rem', letterSpacing: '-0.01em', fontStyle: 'italic' }}>
                  {item.titre}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'rgba(243,239,229,0.55)', lineHeight: 1.75 }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════ */}
      <section style={{ background: ED.paper, padding: '6rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            num="06"
            label="QUESTIONS FRÉQUENTES"
            title="Vos questions, nos réponses."
          />
          <FaqAccordion items={FAQ_LANDING} />
        </div>
      </section>

      {/* ══ CTA final ════════════════════════════════════════ */}
      <section style={{ background: ED.navy, padding: '7rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        {/* Lueur subtile */}
        <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse 55% 45% at 50% 60%, rgba(184,135,42,0.07) 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div className="relative max-w-3xl mx-auto text-center fade-in">
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2.5rem', marginBottom: '2.5rem' }}>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: ED.gold }}>
              COMMENCER MAINTENANT
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(2.25rem, 5vw, 4rem)', color: ED.paper, letterSpacing: '-0.03em', lineHeight: 0.97, fontStyle: 'italic', marginBottom: '1.75rem' }}>
            Prêt à publier votre premier contenu ?
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(243,239,229,0.55)', lineHeight: 1.65, marginBottom: '2.5rem' }}>
            10 publications d&apos;essai offertes. Aucune carte bancaire requise.
          </p>
          <Link href="/login?mode=signup" className="ed-cta-primary" style={{ fontSize: '0.875rem', padding: '1.0625rem 2.5rem' }}>
            Commencer l&apos;essai gratuit →
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

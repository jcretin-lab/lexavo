import Link from 'next/link'
import { LandingPricing } from '@/components/landing/landing-pricing'
import { ScrollAnimationInit } from '@/components/landing/scroll-animation'

const INPUT_FORMATS = [
  {
    icon: 'Aa',
    titre: 'Un thème',
    desc: 'Un sujet juridique (ex : licenciement pour faute grave).',
  },
  {
    icon: '↗',
    titre: 'Une URL d’article',
    desc: 'Collez un lien : Lexavo extrait le texte automatiquement.',
  },
  {
    icon: '¶',
    titre: 'Un article collé',
    desc: 'Collez directement votre texte (200 mots minimum recommandés).',
  },
]

const PUBLICATION_ITEMS = [
  {
    icon: '✍',
    titre: 'Article de blog SEO',
    desc: '900 à 1 200 mots structurés pour Google : H1, balises méta, mots-clés ciblés, slug optimisé.',
  },
  {
    icon: '◈',
    titre: '3 posts LinkedIn et Facebook',
    desc: 'Trois angles distincts (pédagogique, cas pratique, conseil…), prêts à publier.',
  },
  {
    icon: '?',
    titre: 'FAQ juridique',
    desc: '5 questions-réponses pour enrichir l’article et capter la longue traîne.',
  },
  {
    icon: '◻',
    titre: 'Image éditoriale',
    desc: 'Un visuel sur-mesure généré par IA, ou uploadez votre propre image en un clic.',
  },
  {
    icon: '⏱',
    titre: 'Programmation automatique',
    desc: 'Publication immédiate ou planifiée via calendrier éditorial, sur LinkedIn et Facebook.',
  },
]

const STEPS = [
  {
    num: '01',
    titre: 'Définissez votre thème',
    desc: 'Sélectionnez votre spécialité et saisissez un thème. Lexavo adapte le contenu à votre ville et votre domaine juridique.',
  },
  {
    num: '02',
    titre: 'Votre contenu est généré',
    desc: 'En moins de 3 minutes : un article SEO structuré, 3 posts distincts, une FAQ et 1 visuel éditorial (ou uploadez le vôtre). Tout est modifiable avant publication. Vous pouvez aussi insérer votre article existant pour obtenir 3 posts sous 3 angles différents.',
  },
  {
    num: '03',
    titre: 'Publiez quand vous voulez',
    desc: 'Immédiatement ou à la date de votre choix via le calendrier éditorial. Vos comptes LinkedIn et Facebook reçoivent votre contenu automatiquement.',
  },
]

const RASSURANCE = [
  {
    titre: 'Conforme à la déontologie',
    desc: 'Le contenu respecte les règles de communication du Conseil National des Barreaux. Sobre, factuel, sans publicité comparative.',
  },
  {
    titre: 'Données sécurisées',
    desc: 'Hébergement en Europe, chiffrement SSL, aucune revente de vos données. Entièrement conforme au RGPD.',
  },
  {
    titre: 'Sans engagement',
    desc: 'Résiliation à tout moment en un clic. Pas de frais cachés, pas de reconduction tacite sans préavis.',
  },
]

const FAQ_LANDING = [
  {
    q: 'Qui est le fondateur de Lexavo ?',
    r: 'Lexavo est fondé par Julien Pretet, spécialiste de la création de sites internet, du SEO et de l\'automatisation pour les cabinets d\'avocats. Le produit est développé en partenariat avec une docteure en droit.',
  },
  {
    q: 'Pour qui Lexavo n\'est pas conçu ?',
    r: 'Lexavo n\'est pas adapté aux cabinets d\'affaires internationaux dont la clientèle n\'est ni sur LinkedIn ni sur Facebook (M&A, fiscalité internationale), ni aux avocats qui cherchent un contenu polémique ou comparatif — interdit par la déontologie. Nous misons sur la régularité de publication, pas sur le volume.',
  },
  {
    q: 'Est-ce que Lexavo fonctionne sans site web ?',
    r: 'Oui. Lexavo génère du contenu pour vos réseaux sociaux et votre blog indépendamment de votre site web.',
  },
  {
    q: 'Puis-je annuler mon abonnement à tout moment ?',
    r: 'Oui, sans engagement ni frais. La résiliation prend effet à la fin du mois en cours.',
  },
  {
    q: 'Les contenus respectent-ils la déontologie du barreau ?',
    r: 'Oui. Lexavo intègre les règles du RIN et du décret du 12 juillet 2005 dans chaque génération. Nous vous recommandons toutefois de relire chaque contenu avant publication.',
  },
  {
    q: 'Comment connecter mes réseaux sociaux ?',
    r: 'Depuis votre tableau de bord, téléchargez en un clic le scénario Make.com prêt à l\'emploi ainsi que son guide de configuration. Vous obtenez ensuite une URL webhook que vous collez dans Lexavo. Comptez environ 20 minutes pour la mise en place initiale.',
  },
]


/* ─── Mockup hero ──────────────────────────────────────── */
function HeroMockup() {
  return (
    <div className="relative w-full">
      {/* Halo derrière le mockup */}
      <div
        className="absolute -inset-8 rounded-[40px] opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(ellipse at 50% 60%, var(--navy-500), transparent 70%)' }}
      />
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'var(--white)',
          border: '1px solid var(--ink-200)',
          boxShadow: '0 32px 80px -20px rgba(15,34,71,0.22), 0 4px 16px -4px rgba(15,34,71,0.08)',
        }}
      >
        {/* Browser chrome */}
        <div
          className="px-5 py-3 flex items-center gap-3 border-b"
          style={{ background: 'var(--ink-50)', borderColor: 'var(--ink-200)' }}
        >
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
          </div>
          <div className="flex-1 rounded-md px-3 py-1.5 text-xs text-center" style={{ background: 'var(--white)', color: 'var(--ink-400)', fontFamily: 'var(--font-jetbrains-mono)', border: '1px solid var(--ink-200)' }}>
            app.lexavo.fr/dashboard/generer
          </div>
        </div>

        {/* App content */}
        <div className="p-5" style={{ background: 'var(--ink-50)' }}>
          <div className="grid grid-cols-5 gap-4">

            {/* Sidebar nav */}
            <div className="col-span-1 rounded-xl p-3 space-y-1" style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}>
              <div className="mb-3 px-2 py-1.5">
                <span className="text-xs font-semibold" style={{ fontFamily: 'var(--font-instrument-serif)', color: 'var(--navy-900)' }}>Lexavo.</span>
              </div>
              {['Générer', 'Article → Post', 'Calendrier', 'Contenu', 'Paramètres'].map((item, i) => (
                <div
                  key={item}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-medium"
                  style={{
                    background: i === 0 ? 'var(--navy-50)' : 'transparent',
                    color: i === 0 ? 'var(--navy-900)' : 'var(--ink-400)',
                    border: i === 0 ? '1px solid var(--navy-100)' : '1px solid transparent',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>

            {/* Main area */}
            <div className="col-span-4 grid grid-cols-5 gap-3">
              {/* Form */}
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

              {/* Results */}
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

          {/* Bottom row: image preview */}
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
              <span className="text-[9px] font-medium px-2.5 py-1 rounded-full" style={{ color: 'var(--navy-900)', background: 'var(--navy-50)', border: '1px solid var(--navy-100)' }}>Télécharger</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Mockup calendrier ────────────────────────────────── */
function CalendarMockup() {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const posts = [
    { day: 1, col: 1, label: 'FB', color: '#1877F2', title: 'Licenciement abusif : vos droits' },
    { day: 3, col: 3, label: 'LI', color: '#0A66C2', title: 'Garde d\'enfants : changements 2025' },
    { day: 5, col: 5, label: 'FB', color: '#1877F2', title: 'Harcèlement moral au travail' },
  ]

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'var(--white)',
        border: '1px solid var(--ink-200)',
        boxShadow: '0 24px 60px -16px rgba(15,34,71,0.18)',
      }}
    >
      {/* Header */}
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

      {/* Days header */}
      <div className="grid grid-cols-7 px-4 pt-3 pb-1 gap-1">
        {days.map((d, i) => (
          <div key={i} className="text-center text-[9px] font-semibold uppercase tracking-widest py-1" style={{ color: 'var(--ink-400)' }}>{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="px-4 pb-4">
        {[0, 1, 2, 3].map((week) => (
          <div key={week} className="grid grid-cols-7 gap-1 mb-1">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => {
              const dayNum = week * 7 + d + 1
              const post = posts.find(p => p.day === dayNum && p.col === d)
              const isToday = dayNum === 12
              return (
                <div
                  key={d}
                  className="rounded-lg p-1.5 min-h-[48px]"
                  style={{
                    background: isToday ? 'var(--navy-50)' : 'var(--ink-50)',
                    border: isToday ? '1px solid var(--navy-200, #c0cfe8)' : '1px solid transparent',
                  }}
                >
                  <span className="text-[9px] font-medium block mb-1" style={{ color: isToday ? 'var(--navy-900)' : 'var(--ink-400)' }}>
                    {dayNum <= 30 ? dayNum : ''}
                  </span>
                  {post && (
                    <div className="rounded px-1 py-0.5 text-[8px] font-medium leading-tight" style={{ background: post.color, color: '#fff' }}>
                      {post.label} · {post.title.slice(0, 18)}…
                    </div>
                  )}
                  {/* Random scheduled items */}
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

      {/* Footer */}
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

/* ─── Page ─────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--paper)', color: 'var(--ink-900)' }}>
      <ScrollAnimationInit />

      {/* ══ Navigation ═══════════════════════════════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          background: 'var(--navy-900)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg width="18" height="18" viewBox="0 0 17 17" fill="none" style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>
              <rect x="1" y="1" width="15" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3.5 16L6 12.5H1L3.5 16Z" fill="currentColor"/>
            </svg>
            <span
              className="text-xl select-none"
              style={{ fontFamily: 'var(--font-instrument-serif)', color: 'var(--white)', letterSpacing: '-0.02em' }}
            >
              Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: 'rgba(255,255,255,0.65)' }}>
            <a href="#fonctionnalites" className="hover:text-white transition-colors">Fonctionnalités</a>
            <a href="#comment" className="hover:text-white transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-white transition-colors">Tarifs</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm hidden sm:block transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Se connecter
            </Link>
            <Link href="/login?mode=signup" className="landing-nav-cta">
              Essai gratuit
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ Hero ═════════════════════════════════════════════ */}
      <section
        className="pt-40 pb-16 px-6 overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(26,63,124,0.06) 0%, transparent 70%), var(--paper)',
        }}
      >
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center fade-in">
          {/* Texte — gauche */}
          <div>
            {/* Petit titre */}
            <p
              className="mb-6"
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontSize: 'clamp(1.25rem, 2vw, 1.5rem)',
                color: 'var(--ink-700)',
                letterSpacing: '-0.01em',
              }}
            >
              Publiez facilement pour faire entendre{' '}
              <span style={{ color: 'var(--navy-900)' }}>votre droit</span>
              <span style={{ color: 'var(--ocre-500)' }}>.</span>
            </p>

            {/* H1 */}
            <h1
              className="mb-7"
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontSize: 'clamp(1.875rem, 4.5vw, 3.5rem)',
                lineHeight: 1.1,
                letterSpacing: '-0.025em',
                color: 'var(--ink-900)',
              }}
            >
              Une présence régulière sur{' '}
              <span style={{ color: '#0A66C2' }}>LinkedIn</span>
              {' '}et{' '}
              <span style={{ color: '#1877F2' }}>Facebook</span>
              , sans y consacrer du temps.
            </h1>

            {/* Subtitle */}
            <p
              className="mb-10"
              style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', color: 'var(--ink-500)', lineHeight: 1.65, maxWidth: '36rem' }}
            >
              À partir d&apos;un sujet ou d&apos;un article déjà écrit, Lexavo génère un article SEO, 3 posts adaptés à <strong style={{ color: 'var(--ink-700)', fontWeight: 600 }}>LinkedIn</strong> et <strong style={{ color: 'var(--ink-700)', fontWeight: 600 }}>Facebook</strong>, une FAQ et une image — en 3 minutes. Conforme à la déontologie du barreau.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link href="/login?mode=signup" className="landing-cta-primary">
                Commencer gratuitement →
              </Link>
              <a href="#comment" className="landing-cta-secondary">
                Voir comment ça marche
              </a>
            </div>

            {/* Signes de confiance */}
            <div className="flex flex-col gap-3">
              <p className="text-sm" style={{ color: 'var(--ink-500)' }}>
                Conçu avec et pour les avocats français
              </p>
              <div className="flex flex-wrap gap-2">
                {['Déontologie CNB', 'Hébergement EU', 'RGPD'].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full"
                    style={{ background: 'var(--navy-50)', color: 'var(--navy-900)', border: '1px solid var(--navy-100)' }}
                  >
                    <span style={{ color: 'var(--success)' }} aria-hidden>✓</span>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Mockup — droite (cache sur mobile/tablette : grilles trop denses) */}
          <div className="hidden lg:block fade-in-scale fade-in-delay-2">
            <HeroMockup />
          </div>
        </div>
      </section>

      {/* ══ Positionnement LinkedIn + Facebook ═══════════════ */}
      <section className="py-28 px-6" style={{ background: 'var(--paper)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 fade-in">
            <p
              className="mb-4 uppercase"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--ocre-700)' }}
            >
              Deux réseaux, toute votre clientèle
            </p>
            <h2
              className="mb-5"
              style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              LinkedIn et Facebook : les 2 réseaux les plus prometteurs pour un cabinet
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--ink-500)', lineHeight: 1.65 }}>
              Inutile d&apos;être partout. Concentrez vos efforts là où vos futurs clients vous cherchent vraiment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LinkedIn — pros */}
            <div
              className="rounded-2xl p-7 fade-in fade-in-delay-1"
              style={{ background: 'var(--white)', border: '1px solid var(--ink-200)', boxShadow: '0 4px 20px -4px rgba(15,34,71,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0"
                  style={{ background: '#0A66C2', color: 'white', fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                  in
                </div>
                <span
                  className="text-xs uppercase font-semibold"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.16em', color: '#0A66C2' }}
                >
                  LinkedIn
                </span>
              </div>
              <p
                className="font-semibold mb-3"
                style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.5rem', color: 'var(--ink-900)', letterSpacing: '-0.015em', lineHeight: 1.15 }}
              >
                Pour vos clients professionnels
              </p>
              <p className="text-sm mb-5" style={{ color: 'var(--ink-500)', lineHeight: 1.7 }}>
                Décideurs, dirigeants, DRH, juristes d&apos;entreprise. C&apos;est ici que se nouent les <strong style={{ color: 'var(--ink-700)', fontWeight: 600 }}>mandats récurrents à forte valeur</strong> et que vos pairs vous prescrivent.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Droit des affaires TPE/PME', 'Droit social', 'Immobilier pro', 'RH/Management', 'Contentieux commercial'].map(t => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'var(--navy-50)', color: 'var(--navy-900)', border: '1px solid var(--navy-100)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Facebook — particuliers */}
            <div
              className="rounded-2xl p-7 fade-in fade-in-delay-2"
              style={{ background: 'var(--white)', border: '1px solid var(--ink-200)', boxShadow: '0 4px 20px -4px rgba(15,34,71,0.06)' }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{ background: '#1877F2', color: 'white', fontFamily: 'var(--font-jetbrains-mono)' }}
                >
                  f
                </div>
                <span
                  className="text-xs uppercase font-semibold"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.16em', color: '#1877F2' }}
                >
                  Facebook
                </span>
              </div>
              <p
                className="font-semibold mb-3"
                style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.5rem', color: 'var(--ink-900)', letterSpacing: '-0.015em', lineHeight: 1.15 }}
              >
                Pour vos clients particuliers
              </p>
              <p className="text-sm mb-5" style={{ color: 'var(--ink-500)', lineHeight: 1.7 }}>
                Familles, salariés, locataires, consommateurs. C&apos;est le réseau du <strong style={{ color: 'var(--ink-700)', fontWeight: 600 }}>bouche-à-oreille local</strong> et des recherches juridiques de la vie courante.
              </p>
              <div className="flex flex-wrap gap-2">
                {['Famille', 'Travail', 'Immobilier', 'Consommation', 'Pénal'].map(t => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: 'var(--ocre-50)', color: 'var(--ocre-700)', border: '1px solid var(--ocre-100)' }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p className="mt-10 text-center text-sm fade-in" style={{ color: 'var(--ink-400)', fontStyle: 'italic' }}>
            Pourquoi pas X ou TikTok ? Parce qu&apos;à temps égal, LinkedIn et Facebook convertissent davantage en mandats pour un cabinet d&apos;avocats.
          </p>
        </div>
      </section>

      {/* ══ Fonctionnalités ══════════════════════════════════ */}
      <section id="fonctionnalites" className="py-28 px-6" style={{ background: 'var(--white)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 fade-in">
            <p
              className="mb-4 uppercase"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--ocre-700)' }}
            >
              Ce que vous obtenez
            </p>
            <h2
              className="mb-4"
              style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              D’un sujet à toute votre semaine éditoriale.
            </h2>
            <p className="text-base max-w-2xl mx-auto" style={{ color: 'var(--ink-500)', lineHeight: 1.65 }}>
              Article SEO, 3 posts LinkedIn et Facebook, FAQ, image et programmation automatique — <strong style={{ color: 'var(--ink-900)', fontWeight: 600 }}>produits et planifiés en moins de 3 minutes.</strong>
            </p>
          </div>

          {/* Bloc input — 3 formats au choix */}
          <div className="flex justify-center fade-in">
            <div
              className="feature-card w-full max-w-3xl"
              style={{ background: 'var(--ocre-50)', border: '1px solid var(--ocre-100)' }}
            >
              <p
                className="mb-5 uppercase text-center"
                style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.16em', color: 'var(--ocre-700)' }}
              >
                Vous fournissez
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {INPUT_FORMATS.map((fmt) => (
                  <div key={fmt.titre} className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 inline-flex items-center justify-center rounded-md font-mono font-semibold"
                      style={{ width: '28px', height: '28px', background: 'var(--ocre-100)', color: 'var(--ocre-900)', fontSize: '0.75rem', marginTop: '2px' }}
                    >
                      {fmt.icon}
                    </span>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: 'var(--ink-900)', fontSize: '0.9375rem' }}>{fmt.titre}</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-500)' }}>{fmt.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Connecteur input → 5 livrables */}
          <div className="relative w-full hidden sm:block" style={{ height: '52px' }}>
            <div className="absolute" style={{ left: '50%', top: 0, width: '1px', height: '26px', background: 'var(--ink-200)', transform: 'translateX(-50%)' }} />
            <div className="absolute" style={{ top: '26px', left: '10%', right: '10%', height: '1px', background: 'var(--ink-200)' }} />
            {['10%', '30%', '50%', '70%', '90%'].map((leftPos) => (
              <div key={leftPos} className="absolute" style={{ left: leftPos, top: '26px', width: '1px', height: '26px', background: 'var(--ink-200)', transform: 'translateX(-50%)' }} />
            ))}
          </div>
          <div className="flex justify-center sm:hidden my-4">
            <div style={{ width: '1px', height: '32px', background: 'var(--ink-200)' }} />
          </div>

          {/* 5 livrables — 3 + 2 centré en desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PUBLICATION_ITEMS.slice(0, 3).map((item, i) => (
              <div key={item.titre} className={`feature-card fade-in fade-in-delay-${i + 1}`} style={{ background: 'var(--navy-50)', border: '1px solid var(--navy-100)' }}>
                <div className="flex items-start gap-4">
                  <span
                    className="flex-shrink-0 inline-flex items-center justify-center rounded-md font-mono"
                    style={{ width: '28px', height: '28px', background: 'var(--white)', color: 'var(--navy-900)', fontSize: '0.875rem', marginTop: '2px', border: '1px solid var(--navy-100)' }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p className="font-semibold mb-2" style={{ color: 'var(--ink-900)', fontSize: '0.9375rem' }}>{item.titre}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-500)' }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-5 lg:max-w-[66.66%] lg:mx-auto">
            {PUBLICATION_ITEMS.slice(3).map((item, i) => (
              <div key={item.titre} className={`feature-card fade-in fade-in-delay-${i + 1}`} style={{ background: 'var(--navy-50)', border: '1px solid var(--navy-100)' }}>
                <div className="flex items-start gap-4">
                  <span
                    className="flex-shrink-0 inline-flex items-center justify-center rounded-md font-mono"
                    style={{ width: '28px', height: '28px', background: 'var(--white)', color: 'var(--navy-900)', fontSize: '0.875rem', marginTop: '2px', border: '1px solid var(--navy-100)' }}
                  >
                    {item.icon}
                  </span>
                  <div>
                    <p className="font-semibold mb-2" style={{ color: 'var(--ink-900)', fontSize: '0.9375rem' }}>{item.titre}</p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-500)' }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl px-8 py-6 text-center max-w-2xl mx-auto fade-in" style={{ border: '1px solid var(--ocre-100)', background: 'var(--ocre-50)' }}>
            <p
              className="mb-3"
              style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.375rem', color: 'var(--ink-900)', letterSpacing: '-0.01em', lineHeight: 1.2 }}
            >
              Le brouillon, c’est nous. La voix, c’est vous.
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ocre-900)' }}>
              Chaque article, post et FAQ reste entièrement modifiable avant publication. Vous reprenez le ton, ajustez les exemples, imposez vos formulations — pour que chaque contenu porte votre ligne éditoriale, pas une signature IA.
            </p>
          </div>
        </div>
      </section>

      {/* ══ Feature spotlight 1 — génération ════════════════ */}
      <section id="comment" className="py-28 px-6" style={{ background: 'var(--paper)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div className="fade-in-left">
              <p
                className="mb-5 uppercase"
                style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--ocre-700)' }}
              >
                En 3 étapes
              </p>
              <h2
                className="mb-8"
                style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 3vw, 2.625rem)', color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
              >
                Lexavo vous aide à être régulier dans la publication de posts
              </h2>

              <div className="space-y-6">
                {STEPS.map((step, i) => (
                  <div key={step.num} className={`flex gap-5 fade-in fade-in-delay-${i + 1}`}>
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5"
                      style={{ background: 'var(--navy-900)', color: 'var(--white)', fontFamily: 'var(--font-jetbrains-mono)' }}
                    >
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold mb-1" style={{ color: 'var(--ink-900)', fontSize: '0.9375rem' }}>{step.titre}</p>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-500)' }}>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mockup (cache sur mobile/tablette) */}
            <div className="hidden lg:block fade-in-right fade-in-delay-1">
              <HeroMockup />
            </div>
          </div>

        </div>
      </section>

      {/* ══ Feature spotlight 2 — calendrier ════════════════ */}
      <section className="py-28 px-6" style={{ background: 'var(--white)' }}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Mockup (cache sur mobile/tablette) */}
          <div className="hidden lg:block order-2 lg:order-1 fade-in-left fade-in-delay-1">
            <CalendarMockup />
          </div>

          {/* Text */}
          <div className="order-1 lg:order-2 fade-in-right">
            <p
              className="mb-5 uppercase"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--ocre-700)' }}
            >
              Publication automatique
            </p>
            <h2
              className="mb-6"
              style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 3vw, 2.625rem)', color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              Publiez quand vous voulez
            </h2>
            <p className="mb-8 leading-relaxed" style={{ fontSize: '1rem', color: 'var(--ink-500)', lineHeight: 1.7 }}>
              Immédiatement ou à la date de votre choix via le calendrier éditorial. Vos comptes LinkedIn et Facebook reçoivent votre contenu automatiquement.
            </p>

            <div className="space-y-3">
              {[
                'Programmation à la date et l\'heure de votre choix',
                'Publication automatique sur LinkedIn et Facebook',
                'Calendrier éditorial visuel pour piloter votre présence',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5" style={{ background: 'var(--success-50)', color: 'var(--success)' }}>✓</span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-600)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* ══ Pricing ══════════════════════════════════════════ */}
      <section id="tarifs" className="py-28 px-6" style={{ background: 'var(--white)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14 fade-in">
            <p
              className="mb-4 uppercase"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--ocre-700)' }}
            >
              Tarifs
            </p>
            <h2
              className="mb-4"
              style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              Des tarifs simples, sans surprise
            </h2>
            <p className="text-sm mb-1" style={{ color: 'var(--ink-500)' }}>
              10 générations d&apos;essai offertes. Aucune carte bancaire requise pour commencer.
            </p>
            <p className="text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>
              Tous les plans sont illimités en générations.
            </p>
          </div>

          {/* Ancrage prix : comparaison community manager vs Lexavo */}
          <div className="max-w-2xl mx-auto mb-12 fade-in">
            <div
              className="grid grid-cols-2 gap-px rounded-2xl overflow-hidden"
              style={{ background: 'var(--ink-200)', border: '1px solid var(--ink-200)' }}
            >
              <div className="p-5 text-center" style={{ background: 'var(--ink-50)' }}>
                <p
                  className="text-[10px] uppercase font-semibold mb-2"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.16em', color: 'var(--ink-400)' }}
                >
                  Community manager
                </p>
                <p
                  className="font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.5rem', color: 'var(--ink-500)', letterSpacing: '-0.01em' }}
                >
                  400 € – 600 €
                </p>
                <p className="text-[11px]" style={{ color: 'var(--ink-400)' }}>
                  par mois, pour un volume équivalent
                </p>
              </div>
              <div className="p-5 text-center" style={{ background: 'var(--white)' }}>
                <p
                  className="text-[10px] uppercase font-semibold mb-2"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', letterSpacing: '0.16em', color: 'var(--ocre-700)' }}
                >
                  Lexavo Pro
                </p>
                <p
                  className="font-semibold mb-1"
                  style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.5rem', color: 'var(--navy-900)', letterSpacing: '-0.01em' }}
                >
                  69 €
                </p>
                <p className="text-[11px]" style={{ color: 'var(--ink-500)' }}>
                  par mois, générations illimitées
                </p>
              </div>
            </div>
          </div>

          <LandingPricing />
        </div>
      </section>

      {/* ══ Rassurance ═══════════════════════════════════════ */}
      <section className="py-28 px-6" style={{ background: 'var(--navy-900)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16 fade-in">
            <p
              className="mb-4 uppercase"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--ocre-300)', opacity: 0.7 }}
            >
              Pourquoi Lexavo
            </p>
            <h2
              className="mb-5"
              style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              Conçu pour les cabinets d&apos;avocats
            </h2>
            <div className="gold-sep" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {RASSURANCE.map((item, i) => (
              <div key={item.titre} className={`fade-in fade-in-delay-${i + 1} p-7 rounded-2xl`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  className="w-10 h-10 rounded-xl mb-5 flex items-center justify-center"
                  style={{ background: 'rgba(212,162,76,0.12)', border: '1px solid rgba(212,162,76,0.2)' }}
                >
                  <span style={{ color: 'var(--ocre-300)', fontSize: '1rem' }}>✦</span>
                </div>
                <p className="font-semibold mb-3" style={{ color: 'var(--white)', fontSize: '1rem' }}>{item.titre}</p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(232,199,136,0.65)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════ */}
      <section className="py-28 px-6" style={{ background: 'var(--paper)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 fade-in">
            <p
              className="mb-4 uppercase"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '11px', letterSpacing: '0.16em', color: 'var(--ocre-700)' }}
            >
              Questions fréquentes
            </p>
            <h2
              className="mb-0"
              style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.875rem, 3.5vw, 2.75rem)', color: 'var(--ink-900)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
            >
              Vos questions, nos réponses
            </h2>
          </div>

          <div className="space-y-3">
            {FAQ_LANDING.map(({ q, r }) => (
              <details
                key={q}
                className="rounded-xl overflow-hidden group"
                style={{ background: 'var(--white)', border: '1px solid var(--ink-200)' }}
              >
                <summary
                  className="px-5 py-4 cursor-pointer flex items-center justify-between gap-4 list-none [&::-webkit-details-marker]:hidden"
                >
                  <span className="font-medium text-sm" style={{ color: 'var(--ink-900)' }}>{q}</span>
                  <span
                    aria-hidden
                    className="text-base flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                    style={{ color: 'var(--ink-400)' }}
                  >
                    +
                  </span>
                </summary>
                <div className="px-5 pb-5">
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-500)' }}>{r}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA final ════════════════════════════════════════ */}
      <section
        className="py-32 px-6"
        style={{ background: 'linear-gradient(160deg, var(--navy-900) 0%, var(--navy-900) 100%)' }}
      >
        <div className="max-w-2xl mx-auto text-center fade-in">
          <div className="gold-sep mb-10" />
          <h2
            className="mb-5"
            style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: 'var(--white)', letterSpacing: '-0.02em', lineHeight: 1.1 }}
          >
            Prêt à publier votre premier contenu ?
          </h2>
          <p className="mb-10" style={{ fontSize: '1rem', color: 'var(--ocre-300)', lineHeight: 1.65 }}>
            10 publications d&apos;essai offertes. Aucune carte bancaire requise.
          </p>
          <Link
            href="/login?mode=signup"
            className="landing-cta-primary"
            style={{ fontSize: '1.0625rem', padding: '1.0625rem 2.25rem' }}
          >
            Commencer l&apos;essai gratuit →
          </Link>
        </div>
      </section>

      {/* ══ Footer ═══════════════════════════════════════════ */}
      <footer className="py-10 px-6" style={{ background: 'var(--navy-900)' }}>
        <div
          className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start justify-between gap-10"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '2.5rem' }}
        >
          <div className="flex flex-col gap-3">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <svg width="17" height="17" viewBox="0 0 17 17" fill="none" style={{ color: 'rgba(255,255,255,0.65)', flexShrink: 0 }}>
                <rect x="1" y="1" width="15" height="11.5" rx="2.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3.5 16L6 12.5H1L3.5 16Z" fill="currentColor"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: 'var(--white)', letterSpacing: '-0.02em' }}>
                Lex<em>avo</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
              </span>
            </div>
            {/* Tagline */}
            <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.25rem, 2vw, 1.5rem)', color: 'var(--white)', lineHeight: 1.2, letterSpacing: '-0.015em' }}>
              Publiez facilement pour faire entendre<br />
              <em>votre droit</em><span style={{ color: 'var(--ocre-500)' }}>.</span>
            </p>
            {/* Description */}
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.42)', lineHeight: 1.6, maxWidth: '22rem' }}>
              La plateforme de communication digitale conçue pour les cabinets d&apos;avocats français.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm" style={{ color: 'var(--ink-400)' }}>
            <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/cgv" className="hover:text-white transition-colors">CGV</Link>
            <Link href="/politique-confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-xs" style={{ color: 'var(--ink-500)' }}>© 2026 Lexavo · Tous droits réservés</p>
        </div>
      </footer>
    </div>
  )
}

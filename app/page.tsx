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
const OBJECTIONS = [
  {
    q: '« Je peux le faire moi-même avec ChatGPT »',
    r: "Vous pouvez générer un post avec ChatGPT, c'est vrai. Mais ensuite il faut l'adapter, trouver une image, aller sur LinkedIn, publier, refaire pareil sur Facebook, et recommencer la semaine suivante — pendant des mois. Lexavo ne remplace pas votre capacité à écrire, il remplace tout le travail répétitif autour : la régularité, la publication, la mise en forme. C'est ça qui prend du temps, pas la rédaction elle-même.",
  },
  {
    q: "« C'est trop cher pour ce que ça fait »",
    r: "Comparez au coût réel : un community manager freelance démarre à 400-600€/mois. Une agence, 800-1500€/mois. Lexavo à partir de 49€/mois vous fait gagner le même résultat — une présence régulière — pour une fraction du prix, sans dépendre de la disponibilité de quelqu'un d'autre.",
  },
  {
    q: "« Je n'ai pas le temps de valider du contenu chaque semaine »",
    r: "La validation prend 5 minutes, pas plus — vous lisez, vous ajustez si besoin, vous validez. Comparez ça au temps que prendrait l'écriture complète d'un post de zéro. Et si vraiment vous manquez de temps, le forfait Pilote s'occupe de tout, y compris la validation avec vous en amont.",
  },
  {
    // Réponse à valider avec la partenaire juriste avant mise en avant en RDV commercial.
    // Ne jamais affirmer une conformité totale/certifiée : rester sur "calibré pour respecter"
    // et "vous validez avant publication".
    q: '« Est-ce que c\'est conforme à la déontologie du barreau ? »',
    r: "Le contenu généré est calibré pour respecter le cadre du RIN et les recommandations du CNB — pas de démarchage, pas de comparaison, pas de promesse de résultat. Mais la validation reste entièrement entre vos mains avant chaque publication : vous restez seul responsable et décisionnaire de ce qui est publié, exactement comme si vous l'aviez écrit vous-même.",
  },
  {
    q: '« Mes données et celles de mes clients sont-elles en sécurité ? »',
    r: "Lexavo ne traite aucune donnée client confidentielle — l'outil génère du contenu marketing à partir d'un thème général, pas à partir de dossiers ou d'informations sur vos clients. Les données de connexion sont hébergées sur Supabase avec chiffrement, et les échanges avec les réseaux sociaux passent par une API officielle sécurisée.",
  },
  {
    q: '« Et si le contenu généré est faux ou juridiquement inexact ? »',
    r: "C'est exactement pour ça que la validation humaine est une étape obligatoire du processus. Lexavo produit un brouillon de qualité, mais vous restez le seul à publier — rien ne part sans votre accord. Vous gardez le contrôle total sur le fond comme sur la forme.",
  },
  {
    q: "« Je n'ai pas de compétence technique, ça a l'air compliqué »",
    r: "C'est pensé pour prendre 3 minutes, sans aucune compétence technique. Vous entrez un thème, vous obtenez un brouillon complet, vous validez. La configuration initiale de la publication automatique se fait une seule fois avec un guide pas-à-pas, ou nous pouvons le faire pour vous.",
  },
  {
    q: '« Je ne suis pas sûr que ça apporte vraiment des clients »',
    r: "Personne ne peut garantir qu'un post ramène un client précis — mais on sait une chose certaine : un avocat invisible en ligne ne sera jamais choisi par quelqu'un qui cherche sur Google ou LinkedIn. La visibilité est une condition nécessaire, même si elle n'est pas suffisante seule. Et un cabinet qui publie 3x/semaine génère 6 fois plus de visibilité que la moyenne de sa profession.",
  },
  {
    q: "« J'ai déjà essayé de publier, ça n'a rien donné »",
    r: "Souvent, ce qui a été essayé, c'est 3-4 posts isolés sur quelques semaines, puis l'abandon. Ce n'est pas un échec de la méthode, c'est un abandon avant que l'effet de régularité ne se mette en place. C'est précisément le problème que Lexavo résout : maintenir le rythme sans que ça dépende de votre motivation du moment.",
  },
  {
    q: '« Pourquoi seulement LinkedIn et Facebook, pas Instagram/TikTok ? »',
    r: "Vos clients ne vous cherchent pas sur TikTok. LinkedIn touche votre clientèle professionnelle (entreprises, dirigeants), Facebook touche votre clientèle de particuliers. Ce sont les deux réseaux où se trouve réellement votre marché — on préfère faire deux réseaux bien plutôt que cinq mal.",
  },
]

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

/* ── Étape du funnel visibilité → client ──────────────── */
function FunnelStep({ num, text }: { num: number; text: string }) {
  return (
    <div
      className="flex-1 rounded-2xl p-5"
      style={{ background: 'var(--white)', border: `1px solid ${ED.rule}`, boxShadow: '0 16px 40px -22px rgba(15,34,71,0.16)' }}
    >
      <span style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontSize: '1.75rem', color: ED.gold }}>
        {num}
      </span>
      <p style={{ fontSize: '0.9375rem', color: ED.ink, lineHeight: 1.5, marginTop: '0.5rem' }}>
        {text}
      </p>
    </div>
  )
}

function FunnelArrow() {
  return (
    <div className="flex items-center justify-center flex-shrink-0" style={{ color: ED.gold, fontSize: '1.25rem' }} aria-hidden>
      <span className="hidden md:inline">→</span>
      <span className="md:hidden">↓</span>
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
        <div className="max-w-4xl mx-auto px-6 text-center" style={{ paddingTop: '4rem', paddingBottom: '2rem', position: 'relative', zIndex: 1 }}>

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
              fontSize: 'clamp(2.25rem, 4.5vw, 3.75rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: ED.paper,
              fontStyle: 'italic',
              marginBottom: '1.5rem',
            }}
          >
            Publiez régulièrement sur{' '}
            <span style={{ color: '#0A66C2' }}>LinkedIn</span>
            {' '}et{' '}
            <span style={{ color: '#5E9EF5' }}>Facebook</span>
            ,{' '}sans y passer de temps.
          </h1>

          <p
            className="fade-in fade-in-delay-1"
            style={{ fontSize: '1.0625rem', color: 'rgba(243,239,229,0.65)', lineHeight: 1.6, maxWidth: '32rem', margin: '0 auto 2.5rem' }}
          >
            Générez article, posts, FAQ et image en 3 minutes. Programmés et publiés automatiquement. Conforme à la déontologie du barreau.
          </p>

          <div className="fade-in fade-in-delay-2 flex flex-col sm:flex-row gap-3 justify-center mb-6">
            <Link href="/login?mode=signup" className="ed-cta-primary">
              Découvrir gratuitement →
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
      <section id="fonctionnalites" style={{ background: ED.cream, padding: '5rem 1.5rem' }}>
        <div className="max-w-4xl mx-auto">
          <SectionHeader
            num="01"
            label="CE QUE VOUS OBTENEZ"
            title="D'un sujet à toute votre semaine éditoriale."
          />

          <div
            className="fade-in fade-in-delay-1"
            style={{
              background: 'var(--white)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              border: `1px solid ${ED.rule}`,
              boxShadow: '0 16px 40px -22px rgba(15,34,71,0.16)',
            }}
          >
            <div className="text-center">
              <p style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontSize: 'clamp(1.125rem, 2.4vw, 1.625rem)', lineHeight: 1.4, color: ED.ink }}>
                Choisissez un thème ou collez une url ou un article de blog
              </p>
              <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '0.75rem', letterSpacing: '0.15em', color: ED.gold, margin: '0.75rem 0' }}>
                POUR OBTENIR
              </p>
              <p style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontSize: 'clamp(1.375rem, 3vw, 2rem)', color: ED.gold, letterSpacing: '-0.01em' }}>
                3 posts + Article SEO + FAQ + Image
              </p>
            </div>

            <p className="text-center" style={{ fontSize: '0.9375rem', color: ED.mid, marginTop: '2rem' }}>
              Publication immédiate ou programmée, toujours modifiable, automatique sur LinkedIn et Facebook.
            </p>

            <div style={{ borderTop: `1px solid ${ED.rule}`, paddingTop: '2rem', marginTop: '2.5rem', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(1.375rem, 2.5vw, 2rem)', color: ED.ink, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                «&thinsp;Un mois de posts, préparé en une fois. LinkedIn pour vos clients pros, Facebook pour vos particuliers.&thinsp;»
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Visibilité → client ══════════════════════════════ */}
      <section style={{ background: ED.cream, padding: '5rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            num="02"
            label="DE LA VISIBILITÉ AU CLIENT"
            title="Ce que change la visibilité, concrètement."
          />

          <div className="fade-in fade-in-delay-1" style={{ maxWidth: '42rem' }}>
            <p style={{ fontSize: '1.0625rem', color: ED.mid, lineHeight: 1.75, marginBottom: '1rem' }}>
              Un client ne choisit jamais un avocat qu&apos;il n&apos;a jamais vu.
            </p>
            <p style={{ fontSize: '1.0625rem', color: ED.mid, lineHeight: 1.75, marginBottom: '1.25rem' }}>
              Avant de prendre rendez-vous, il cherche, compare, se renseigne. S&apos;il ne trouve rien sur vous, il ne trouve pas de raison de vous choisir plutôt qu&apos;un confrère — même si vous êtes plus compétent.
            </p>
            <p style={{ fontSize: '1.125rem', color: ED.ink, fontWeight: 600, lineHeight: 1.6 }}>
              La visibilité ne remplace pas votre expertise. Elle lui donne une chance d&apos;être vue.
            </p>
          </div>

          <div className="fade-in fade-in-delay-2 flex flex-col md:flex-row items-stretch md:items-center gap-3 mt-12">
            <FunnelStep num={1} text="Vous publiez régulièrement" />
            <FunnelArrow />
            <FunnelStep num={2} text="Des clients potentiels vous découvrent en cherchant une réponse" />
            <FunnelArrow />
            <FunnelStep num={3} text="Ils vous perçoivent comme compétent avant même le premier contact" />
            <FunnelArrow />
            <FunnelStep num={4} text="Ils vous contactent en confiance — plutôt qu'un confrère invisible" />
          </div>
        </div>
      </section>

      {/* ══ Objections ═══════════════════════════════════════ */}
      <section style={{ background: ED.paper, padding: '5rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            num="03"
            label="RETOURS DE TERRAIN"
            title="Ce qu'on nous demande avant de se lancer."
          />
          <FaqAccordion items={OBJECTIONS} />
        </div>
      </section>

      {/* ══ Tarifs ═══════════════════════════════════════════ */}
      <section id="tarifs" style={{ background: ED.cream, padding: '5rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            num="04"
            label="TARIFS"
            title="Des tarifs simples, sans surprise."
            subtitle="10 générations offertes. Sans carte bancaire."
          />
          <LandingPricing />
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════ */}
      <section style={{ background: ED.paper, padding: '5rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeader
            num="05"
            label="QUESTIONS FRÉQUENTES"
            title="Vos questions, nos réponses."
          />
          <FaqAccordion items={FAQ_LANDING} />
        </div>
      </section>

      {/* ══ CTA final ════════════════════════════════════════ */}
      <section style={{ background: ED.navy, padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
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

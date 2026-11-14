import Link from 'next/link'
import { ScrollAnimationInit } from '@/components/landing/scroll-animation'
import { FaqAccordion } from '@/components/landing/faq-accordion'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { VeilleEncart } from '@/components/landing/veille-encart'
import { FORFAITS, MAINTENANCE, MENTION_TVA } from '@/lib/offre'

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
const CONSTATS = [
  {
    titre: 'Vos futurs clients vous cherchent avant de vous appeler.',
    texte: "Un nom recommandé par un proche, une recherche « avocat droit de la famille » suivie du nom de votre ville : dans les deux cas, la première étape est votre site. S'il est absent, daté ou illisible sur téléphone, la recherche continue ailleurs.",
  },
  {
    titre: 'Un site d’avocat obéit à des règles particulières.',
    texte: "Nom de domaine, mentions obligatoires, présentation des spécialisations, honoraires, absence de sollicitation : la communication de l'avocat est encadrée par le RIN. Une agence généraliste ne les connaît pas toujours.",
  },
  {
    titre: 'Vous n’avez pas le temps de piloter un prestataire.',
    texte: "Vous voulez un site qui vous ressemble, sans y passer vos soirées. Nous vous demandons une heure d'entretien et quelques relectures : le reste est pour nous.",
  },
]

const ETAPES = [
  { titre: 'Entretien', texte: "Un appel de 30 minutes pour comprendre votre cabinet, votre clientèle et vos domaines d'intervention. Devis ferme sous 48 h." },
  { titre: 'Maquette', texte: 'Une première version de la page d’accueil à vos couleurs. Vous commentez, nous ajustons.' },
  { titre: 'Contenus', texte: 'Nous rédigeons ou reprenons vos textes. Vous relisez et validez chaque page avant la mise en ligne.' },
  { titre: 'Mise en ligne', texte: 'Nom de domaine, HTTPS, référencement, formulaire : tout est branché. Nous vous préparons les éléments à transmettre à votre Ordre.' },
]

const DEONTOLOGIE = [
  'Nom de domaine construit sur votre nom ou celui du cabinet, sans terme générique',
  'Mentions obligatoires : barreau, structure d’exercice, coordonnées, médiateur de la consommation',
  'Spécialisations mentionnées uniquement si elles sont certifiées',
  'Information sur les honoraires, sans promesse de résultat',
  'Aucune publicité tierce, aucun lien vers des sites contraires aux principes essentiels',
  'Formulaire de contact conforme au RGPD et au secret professionnel',
]

const FAQ_LANDING = [
  {
    q: 'Combien de temps faut-il pour avoir mon site ?',
    r: "Comptez trois semaines pour le forfait Essentiel et quatre à cinq semaines pour le forfait Cabinet, à partir de l'entretien de lancement. Le délai dépend surtout du temps de relecture de votre côté : nous vous donnons un calendrier précis avec le devis.",
  },
  {
    q: 'Le site sera-t-il conforme aux règles de la profession ?',
    r: "Nous construisons chaque site en tenant compte des règles de communication de l'avocat (RIN, article 10) : nom de domaine, mentions, spécialisations, honoraires. Vous validez chaque page avant la mise en ligne et vous restez responsable de votre communication auprès de votre Ordre, comme pour tout support.",
  },
  {
    q: 'Je n’ai aucun texte, aucune photo. Est-ce un problème ?',
    r: "Non. Avec le forfait Cabinet, nous rédigeons les textes à partir d'un entretien avec vous. Pour les visuels, nous utilisons des photos libres de droits choisies avec soin, ou nous vous orientons vers un photographe si vous souhaitez un portrait.",
  },
  {
    q: 'Le site m’appartient-il ?',
    r: "Oui. Le nom de domaine est enregistré à votre nom et le site vous appartient une fois réglé. Si vous arrêtez la maintenance, nous vous remettons l'ensemble des fichiers et les accès.",
  },
  {
    q: 'Pourrai-je modifier le site moi-même ?',
    r: "Les petites modifications (horaires, actualité, nouvel associé) sont incluses dans la maintenance : un e-mail suffit. Si vous préférez gérer vous-même une rubrique actualités, nous pouvons la rendre modifiable depuis une interface simple.",
  },
  {
    q: 'J’ai déjà un site. Pouvez-vous le refaire ?',
    r: "Oui. Nous reprenons ce qui fonctionne (textes, adresse, référencement acquis) et nous mettons en place les redirections pour ne pas perdre votre position sur Google.",
  },
  {
    q: 'Comment se passe le paiement ?',
    r: "40 % à la signature du devis, le solde à la mise en ligne. La maintenance est mensuelle et sans engagement au-delà des douze premiers mois.",
  },
]

/* ── En-tête de section éditorial ────────────────────── */
function SectionHeader({ label, title, subtitle, dark = false }: {
  label: string; title: string; subtitle?: string; dark?: boolean
}) {
  const textColor = dark ? ED.paper : ED.ink
  const ruleColor = dark ? 'rgba(255,255,255,0.12)' : ED.rule
  const subColor  = dark ? 'rgba(243,239,229,0.6)' : ED.mid
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

/* ── Aperçu d'un site de cabinet (illustration du hero) ── */
function ApercuSite() {
  const barre = (w: string, c = 'rgba(15,34,71,0.12)') => (
    <div style={{ height: 7, width: w, background: c, borderRadius: 4 }} />
  )
  return (
    <div
      aria-hidden
      style={{
        background: ED.cream,
        borderRadius: 14,
        boxShadow: '0 40px 80px -30px rgba(0,0,0,0.6)',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        maxWidth: 460,
        width: '100%',
      }}
    >
      <div style={{ background: '#E6E1D6', padding: '0.6rem 0.9rem', display: 'flex', alignItems: 'center', gap: 6 }}>
        {['#D9776A', '#E2B65B', '#8DB47A'].map((c) => (
          <span key={c} style={{ width: 9, height: 9, borderRadius: 999, background: c }} />
        ))}
        <span style={{ marginLeft: 10, flex: 1, background: ED.cream, borderRadius: 6, padding: '0.2rem 0.6rem', fontFamily: 'var(--font-jetbrains-mono)', fontSize: 10, color: ED.mid }}>
          martin-avocat.fr
        </span>
      </div>
      <div style={{ padding: '1.1rem 1.25rem 1.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.4rem' }}>
          <span style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontSize: 15, color: ED.navy }}>
            Cabinet Martin
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            {barre('28px')}{barre('34px')}{barre('24px')}
          </div>
        </div>
        <div style={{ background: ED.navy, borderRadius: 10, padding: '1.25rem', marginBottom: '1rem' }}>
          <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: 8, letterSpacing: '0.18em', color: ED.gold }}>
            AVOCAT AU BARREAU DE LYON
          </span>
          <p style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontSize: 19, color: ED.paper, lineHeight: 1.15, margin: '0.5rem 0 0.9rem' }}>
            Droit de la famille et des personnes.
          </p>
          <span style={{ display: 'inline-block', background: ED.gold, color: ED.navy, fontSize: 10, fontWeight: 600, padding: '0.35rem 0.75rem', borderRadius: 6 }}>
            Prendre rendez-vous
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {['Divorce', 'Autorité parentale', 'Successions'].map((t) => (
            <div key={t} style={{ background: '#fff', border: `1px solid ${ED.rule}`, borderRadius: 8, padding: '0.6rem' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: ED.ink, marginBottom: 6 }}>{t}</p>
              {barre('90%', 'rgba(15,34,71,0.08)')}
              <div style={{ height: 4 }} />
              {barre('65%', 'rgba(15,34,71,0.08)')}
            </div>
          ))}
        </div>
      </div>
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
      <section style={{ background: ED.ink, minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 75% 50%, rgba(184,135,42,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="max-w-6xl mx-auto px-6 w-full grid md:grid-cols-2 gap-12 items-center" style={{ paddingTop: '6rem', paddingBottom: '4rem', position: 'relative', zIndex: 1 }}>
          <div>
            <span
              className="fade-in"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: 'clamp(0.6875rem, 1.4vw, 0.8125rem)', letterSpacing: '0.18em', color: ED.gold, display: 'block', marginBottom: '1.75rem' }}
            >
              CRÉATION DE SITES POUR AVOCATS
            </span>

            <h1
              className="fade-in fade-in-delay-1"
              style={{
                fontFamily: 'var(--font-instrument-serif)',
                fontSize: 'clamp(2.25rem, 4.5vw, 3.5rem)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                color: ED.paper,
                fontStyle: 'italic',
                marginBottom: '1.5rem',
              }}
            >
              Un site à la hauteur de votre cabinet<span style={{ color: ED.gold }}>.</span>
            </h1>

            <p
              className="fade-in fade-in-delay-1"
              style={{ fontSize: '1.0625rem', color: 'rgba(243,239,229,0.7)', lineHeight: 1.65, maxWidth: '30rem', marginBottom: '2.25rem' }}
            >
              Nous concevons, rédigeons et mettons en ligne le site de votre cabinet, dans le respect des règles de communication de la profession. Vous relisez, nous faisons le reste.
            </p>

            <div className="fade-in fade-in-delay-2 flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/contact" className="ed-cta-primary">
                Demander un devis →
              </Link>
              <Link href="/#tarifs" className="ed-cta-ghost">
                Voir les forfaits
              </Link>
            </div>

            <div className="fade-in fade-in-delay-2 flex flex-wrap gap-2">
              {['Devis sous 48 h', 'En ligne en 3 semaines', 'Règles du RIN'].map((label) => (
                <span
                  key={label}
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.14)', padding: '0.25rem 0.625rem' }}
                >
                  ✓ {label.toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="fade-in fade-in-delay-2 flex justify-center md:justify-end">
            <ApercuSite />
          </div>
        </div>
      </section>

      {/* ══ Pourquoi ═════════════════════════════════════════ */}
      <section id="pourquoi" style={{ background: ED.cream, padding: '5rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader label="POURQUOI UN SITE" title="Votre site travaille quand vous plaidez." />
          <div className="grid md:grid-cols-3 gap-5">
            {CONSTATS.map(({ titre, texte }, i) => (
              <div
                key={titre}
                className={`fade-in fade-in-delay-${Math.min(i + 1, 2)} rounded-2xl p-6`}
                style={{ background: '#fff', border: `1px solid ${ED.rule}`, boxShadow: '0 16px 40px -22px rgba(15,34,71,0.16)' }}
              >
                <p style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontSize: '1.25rem', lineHeight: 1.25, color: ED.navy, marginBottom: '0.75rem' }}>
                  {titre}
                </p>
                <p style={{ fontSize: '0.9375rem', color: ED.mid, lineHeight: 1.65 }}>{texte}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ Méthode ══════════════════════════════════════════ */}
      <section id="methode" style={{ background: ED.paper, padding: '5rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <SectionHeader
            label="MÉTHODE"
            title="Quatre étapes, une heure de votre temps."
            subtitle="Un seul interlocuteur du premier appel à la mise en ligne. Vous validez chaque étape avant que nous passions à la suivante."
          />
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 fade-in fade-in-delay-1" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {ETAPES.map(({ titre, texte }, i) => (
              <li key={titre} style={{ borderTop: `2px solid ${ED.gold}`, paddingTop: '1.25rem' }}>
                <span style={{ fontFamily: 'var(--font-instrument-serif)', fontStyle: 'italic', fontSize: '1.75rem', color: ED.gold }}>
                  {i + 1}
                </span>
                <p style={{ fontWeight: 600, fontSize: '1rem', color: ED.ink, margin: '0.4rem 0 0.5rem' }}>{titre}</p>
                <p style={{ fontSize: '0.9rem', color: ED.mid, lineHeight: 1.6 }}>{texte}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══ Déontologie ══════════════════════════════════════ */}
      <section id="deontologie" style={{ background: ED.navy, padding: '5rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
          <SectionHeader
            dark
            label="DÉONTOLOGIE"
            title="Pensé pour la profession, pas adapté après coup."
            subtitle="Nous travaillons pour les avocats depuis le lancement de Lexavo et publions une veille de jurisprudence. Les règles de communication de la profession sont intégrées dès la maquette."
          />
          <ul className="fade-in fade-in-delay-1 space-y-4" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {DEONTOLOGIE.map((item) => (
              <li key={item} className="flex gap-3" style={{ fontSize: '0.9688rem', color: 'rgba(243,239,229,0.85)', lineHeight: 1.55 }}>
                <span aria-hidden style={{ color: ED.gold, flexShrink: 0 }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══ Tarifs ═══════════════════════════════════════════ */}
      <section id="tarifs" style={{ background: ED.cream, padding: '5rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <SectionHeader
            label="FORFAITS"
            title="Un prix clair avant de commencer."
            subtitle="Chaque projet fait l'objet d'un devis ferme après l'entretien de lancement. Pas de frais cachés, pas de surprise à la livraison."
          />
          <div className="grid md:grid-cols-3 gap-5 items-stretch">
            {FORFAITS.map((f) => (
              <div
                key={f.id}
                className="fade-in fade-in-delay-1 rounded-2xl p-7 flex flex-col"
                style={{
                  background: f.misEnAvant ? ED.navy : '#fff',
                  color: f.misEnAvant ? ED.paper : ED.ink,
                  border: f.misEnAvant ? `1px solid ${ED.navy}` : `1px solid ${ED.rule}`,
                  boxShadow: '0 16px 40px -22px rgba(15,34,71,0.22)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: ED.gold }}>
                    {f.nom.toUpperCase()}
                  </span>
                  {f.misEnAvant && (
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, background: ED.gold, color: ED.navy, padding: '0.2rem 0.6rem', borderRadius: 999 }}>
                      Le plus demandé
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '0.75rem', color: f.misEnAvant ? 'rgba(243,239,229,0.6)' : ED.mid, minHeight: '1rem' }}>
                  {f.aPartirDe ? 'À partir de' : ' '}
                </p>
                <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '2.25rem', letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
                  {f.prix}
                </p>
                <p style={{ fontSize: '0.9375rem', color: f.misEnAvant ? 'rgba(243,239,229,0.75)' : ED.mid, marginBottom: '1.5rem' }}>
                  {f.accroche}
                </p>
                <ul className="space-y-2 mb-6 flex-1" style={{ listStyle: 'none', padding: 0 }}>
                  {f.inclus.map((ligne) => (
                    <li key={ligne} className="flex gap-2" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>
                      <span aria-hidden style={{ color: ED.gold, flexShrink: 0 }}>✓</span>
                      {ligne}
                    </li>
                  ))}
                </ul>
                <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.12em', color: f.misEnAvant ? 'rgba(243,239,229,0.55)' : ED.mid, marginBottom: '1rem' }}>
                  DÉLAI : {f.delai.toUpperCase()}
                </p>
                <Link
                  href={`/contact?forfait=${f.id}`}
                  className={f.misEnAvant ? 'ed-cta-primary' : 'ed-cta-outlined'}
                  style={{ textAlign: 'center' }}
                >
                  {f.aPartirDe ? 'Demander un devis' : 'Parlons de votre projet'}
                </Link>
              </div>
            ))}
          </div>

          <div
            className="fade-in mt-6 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-4"
            style={{ border: `1px dashed ${ED.rule}`, background: ED.paper }}
          >
            <div style={{ flexShrink: 0 }}>
              <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.2em', color: ED.gold }}>MAINTENANCE</span>
              <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.5rem', color: ED.ink }}>{MAINTENANCE.prix}</p>
            </div>
            <p style={{ fontSize: '0.9375rem', color: ED.mid, lineHeight: 1.6 }}>{MAINTENANCE.inclus}</p>
          </div>
          <p style={{ fontSize: '0.75rem', color: ED.mid, marginTop: '1rem' }}>{MENTION_TVA}</p>
        </div>
      </section>

      {/* ══ FAQ ══════════════════════════════════════════════ */}
      <section id="faq" style={{ background: ED.paper, padding: '5rem 1.5rem' }}>
        <div className="max-w-3xl mx-auto">
          <SectionHeader label="QUESTIONS FRÉQUENTES" title="Avant de vous lancer." />
          <FaqAccordion items={FAQ_LANDING} />
        </div>
      </section>

      {/* ══ Encart : newsletter Veille Lexavo ════════════════ */}
      <VeilleEncart />

      {/* ══ CTA final ════════════════════════════════════════ */}
      <section style={{ background: ED.navy, padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 45% at 50% 60%, rgba(184,135,42,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="relative max-w-3xl mx-auto text-center fade-in">
          <h2 style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: 'clamp(2.25rem, 5vw, 3.75rem)', color: ED.paper, letterSpacing: '-0.03em', lineHeight: 1, fontStyle: 'italic', marginBottom: '1.5rem' }}>
            Parlons de votre site.
          </h2>
          <p style={{ fontSize: '1rem', color: 'rgba(243,239,229,0.6)', lineHeight: 1.65, marginBottom: '2.5rem' }}>
            Décrivez votre cabinet en quelques lignes : nous revenons vers vous sous 48 h ouvrées avec une proposition.
          </p>
          <Link href="/contact" className="ed-cta-primary" style={{ fontSize: '0.875rem', padding: '1.0625rem 2.5rem' }}>
            Demander un devis gratuit →
          </Link>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

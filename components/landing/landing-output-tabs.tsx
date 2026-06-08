"use client"

import { useState } from "react"

const ED = {
  paper: '#F3EFE5',
  navy:  '#0F2247',
  gold:  '#B8872A',
  mid:   '#6E6860',
  rule:  '#D0CBC0',
}

const INPUTS = [
  { label: 'Un thème', desc: 'ex : licenciement pour faute grave' },
  { label: "Une URL d'article", desc: 'Lexavo extrait le texte automatiquement' },
  { label: 'Un article collé', desc: '200 mots minimum recommandés' },
]

const TABS = [
  {
    id: 'posts',
    label: 'Posts réseaux',
    tag: '× 3',
    desc: 'Trois angles distincts — pédagogique, cas pratique, conseil — prêts à publier sur LinkedIn et Facebook.',
    preview: <PostsPreview />,
  },
  {
    id: 'article',
    label: 'Article SEO',
    tag: '900–1 200 mots',
    desc: 'Structuré pour Google : H1, balises méta, mots-clés ciblés, slug optimisé. Prêt à copier dans votre CMS.',
    preview: <ArticlePreview />,
  },
  {
    id: 'faq',
    label: 'FAQ juridique',
    tag: '× 5 questions',
    desc: '5 questions-réponses pour enrichir l\'article, capter la longue traîne et répondre aux objections de vos clients.',
    preview: <FaqPreview />,
  },
  {
    id: 'image',
    label: 'Image éditoriale',
    tag: 'IA ou upload',
    desc: 'Un visuel conceptuel généré par IA adapté au sujet juridique, ou uploadez votre propre photo en un clic.',
    preview: <ImagePreview />,
  },
  {
    id: 'prog',
    label: 'Programmation',
    tag: 'Auto',
    desc: 'Publication immédiate ou planifiée à la date de votre choix. Vos réseaux reçoivent le contenu automatiquement.',
    preview: <ProgramPreview />,
  },
]

function PostsPreview() {
  const posts = [
    { angle: 'Pédagogique', color: '#0A66C2', network: 'in', excerpt: 'Le licenciement pour faute grave est une procédure aux multiples pièges. Voici les 5 erreurs les plus fréquentes que je constate en cabinet…' },
    { angle: 'Cas pratique', color: '#B8872A', network: 'f', excerpt: 'Mon client X a été licencié sans que l\'employeur respecte le délai légal de convocation. Résultat : procédure annulée…' },
    { angle: 'Conseil', color: '#1F7A4C', network: 'in', excerpt: 'Avant tout licenciement pour faute grave, vérifiez ces 3 points essentiels avec votre conseil juridique…' },
  ]
  return (
    <div className="space-y-2.5">
      {posts.map((p, i) => (
        <div key={i} className="rounded-xl p-3.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0" style={{ background: p.color }}>{p.network}</div>
            <div>
              <p className="text-[10px] font-semibold" style={{ color: ED.paper }}>Maître Dupont</p>
              <p className="text-[9px]" style={{ color: 'rgba(243,239,229,0.4)' }}>Avocat • Droit du travail</p>
            </div>
            <span className="ml-auto text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${p.color}22`, color: p.color, border: `1px solid ${p.color}44` }}>{p.angle}</span>
          </div>
          <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(243,239,229,0.65)' }}>{p.excerpt}</p>
          <div className="flex gap-1 mt-2 flex-wrap">
            {['#DroitDuTravail', '#Avocat', '#ConseilJuridique'].map(h => (
              <span key={h} className="text-[8px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(15,34,71,0.6)', color: '#4A88D8' }}>{h}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ArticlePreview() {
  return (
    <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="text-[9px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(31,122,76,0.2)', color: '#4ade80', border: '1px solid rgba(31,122,76,0.3)' }}>✓ SEO optimisé</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,135,42,0.15)', color: ED.gold, border: '1px solid rgba(184,135,42,0.25)' }}>1 142 mots</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(243,239,229,0.5)' }}>Slug généré</span>
      </div>
      <div className="mb-3">
        <p className="text-[11px] font-semibold mb-1" style={{ color: ED.paper, fontStyle: 'italic' }}>Licenciement pour faute grave : 5 erreurs à éviter absolument</p>
        <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(243,239,229,0.4)' }}>Méta : Découvrez les 5 erreurs les plus fréquentes lors d'un licenciement pour faute grave et comment les éviter…</p>
      </div>
      <div className="space-y-1.5">
        {['Introduction', 'I. L\'entretien préalable obligatoire', 'II. Le délai de notification', 'III. La motivation de la lettre', 'Conclusion'].map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: i === 0 || i === 4 ? 'rgba(243,239,229,0.3)' : ED.gold }} />
            <div className="h-1.5 rounded-full flex-1" style={{ background: 'rgba(255,255,255,0.08)', maxWidth: i === 0 ? '60%' : i === 4 ? '45%' : '90%' }} />
            <span className="text-[8px]" style={{ color: 'rgba(243,239,229,0.25)', fontFamily: 'monospace' }}>{i === 0 || i === 4 ? '' : 'H2'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FaqPreview() {
  return (
    <div className="space-y-1.5">
      {[
        { q: 'Qu\'est-ce que la faute grave en droit du travail ?', open: true, a: 'La faute grave est celle qui rend impossible le maintien du salarié dans l\'entreprise, même pendant la durée du préavis. Elle entraîne la perte des indemnités légales de licenciement…' },
        { q: 'Quels sont mes droits si je suis licencié pour faute grave ?', open: false },
        { q: 'L\'employeur peut-il me licencier sans entretien préalable ?', open: false },
        { q: 'Comment contester un licenciement abusif ?', open: false },
        { q: 'Quel délai pour saisir le conseil de prud\'hommes ?', open: false },
      ].map((item, i) => (
        <div key={i} className="rounded-lg overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2 px-3 py-2.5" style={{ background: item.open ? 'rgba(184,135,42,0.1)' : 'rgba(255,255,255,0.03)' }}>
            <span className="text-[8px] font-bold flex-shrink-0" style={{ color: ED.gold, fontFamily: 'monospace' }}>0{i + 1}</span>
            <p className="text-[10px] font-medium flex-1" style={{ color: item.open ? ED.paper : 'rgba(243,239,229,0.55)' }}>{item.q}</p>
            <span className="text-[10px] flex-shrink-0" style={{ color: item.open ? ED.gold : 'rgba(243,239,229,0.25)' }}>{item.open ? '−' : '+'}</span>
          </div>
          {item.open && (
            <div className="px-3 pb-3 pt-1" style={{ background: 'rgba(184,135,42,0.05)' }}>
              <p className="text-[9px] leading-relaxed" style={{ color: 'rgba(243,239,229,0.5)' }}>{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function ImagePreview() {
  return (
    <div className="space-y-3">
      <div className="rounded-xl overflow-hidden relative" style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, #0F2247 0%, #1a3a6b 40%, #0d1f3c 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-2 flex items-center justify-center" style={{ background: 'rgba(184,135,42,0.15)', border: '1px solid rgba(184,135,42,0.3)' }}>
              <span style={{ fontSize: '1.75rem' }}>⚖️</span>
            </div>
            <p className="text-[10px] font-semibold" style={{ color: 'rgba(243,239,229,0.7)', fontStyle: 'italic' }}>Licenciement pour faute grave</p>
            <p className="text-[8px] mt-1" style={{ color: 'rgba(243,239,229,0.35)', fontFamily: 'monospace', letterSpacing: '0.1em' }}>DROIT DU TRAVAIL</p>
          </div>
        </div>
        <div className="absolute bottom-2 right-2">
          <span className="text-[8px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(31,122,76,0.3)', color: '#4ade80', border: '1px solid rgba(31,122,76,0.4)' }}>✓ Générée par IA</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-[9px]" style={{ color: 'rgba(243,239,229,0.4)' }}>Style :</p>
        {['Conceptuel', 'Éditorial', 'Minimaliste'].map((s, i) => (
          <span key={s} className="text-[9px] px-2.5 py-1 rounded-full cursor-pointer" style={{ background: i === 0 ? 'rgba(184,135,42,0.2)' : 'rgba(255,255,255,0.05)', color: i === 0 ? ED.gold : 'rgba(243,239,229,0.4)', border: i === 0 ? '1px solid rgba(184,135,42,0.35)' : '1px solid rgba(255,255,255,0.08)' }}>{s}</span>
        ))}
        <span className="text-[9px] px-2.5 py-1 rounded-full ml-auto" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(243,239,229,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>+ Upload</span>
      </div>
    </div>
  )
}

function ProgramPreview() {
  const days = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
  const scheduled = [
    { col: 1, label: 'LI', color: '#0A66C2', title: 'Faute grave : 5 erreurs' },
    { col: 3, label: 'FB', color: '#1877F2', title: 'Vos droits face au licenciement' },
    { col: 5, label: 'LI', color: '#0A66C2', title: 'Article SEO publié' },
  ]
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="text-[10px] font-semibold" style={{ color: ED.paper }}>Semaine du 9 juin 2026</span>
        <span className="text-[9px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(31,122,76,0.2)', color: '#4ade80', border: '1px solid rgba(31,122,76,0.3)' }}>● Publication active</span>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {days.map((d, i) => (
            <div key={i} className="text-center text-[9px] font-semibold py-1" style={{ color: 'rgba(243,239,229,0.35)', letterSpacing: '0.05em' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((_, col) => {
            const s = scheduled.find(x => x.col === col)
            return (
              <div key={col} className="rounded-lg p-1.5 min-h-[56px]" style={{ background: s ? `${s.color}18` : 'rgba(255,255,255,0.03)', border: s ? `1px solid ${s.color}44` : '1px solid rgba(255,255,255,0.05)' }}>
                <span className="text-[8px] block mb-1" style={{ color: s ? 'rgba(243,239,229,0.5)' : 'rgba(243,239,229,0.2)' }}>{col + 9}</span>
                {s && (
                  <div className="rounded px-1 py-0.5" style={{ background: s.color }}>
                    <p className="text-[7px] font-bold text-white">{s.label}</p>
                    <p className="text-[7px] text-white opacity-80 leading-tight mt-0.5">{s.title.slice(0, 16)}…</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <div className="mx-3 mb-3 rounded-lg p-2.5 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <p className="text-[9px] font-semibold" style={{ color: ED.paper }}>3 publications cette semaine</p>
          <p className="text-[8px]" style={{ color: 'rgba(243,239,229,0.4)' }}>LinkedIn × 2 · Facebook × 1 · envoi automatique</p>
        </div>
      </div>
    </div>
  )
}

export function LandingOutputTabs() {
  const [active, setActive] = useState(0)

  return (
    <div className="fade-in fade-in-delay-1">
      {/* VOUS FOURNISSEZ */}
      <div className="mb-10">
        <p style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.28)', marginBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
          VOUS FOURNISSEZ
        </p>
        <div className="flex flex-wrap items-center gap-3">
          {INPUTS.map((inp, i) => (
            <>
              <div key={inp.label} className="flex items-center gap-2.5 rounded-xl px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: ED.gold }} />
                <div>
                  <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '0.9375rem', color: ED.paper, fontStyle: 'italic' }}>{inp.label}</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(243,239,229,0.38)', lineHeight: 1.4 }}>{inp.desc}</p>
                </div>
              </div>
              {i < INPUTS.length - 1 && (
                <span key={`or-${i}`} style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.15em', color: 'rgba(243,239,229,0.28)' }}>OU</span>
              )}
            </>
          ))}
        </div>
      </div>

      {/* Flèche */}
      <div className="flex items-center gap-3 mb-10">
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '9px', letterSpacing: '0.22em', color: ED.gold }}>VOUS OBTENEZ</span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
      </div>

      {/* Tabs navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {TABS.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => setActive(i)}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-all duration-200"
            style={{
              background: active === i ? 'rgba(184,135,42,0.15)' : 'rgba(255,255,255,0.04)',
              border: active === i ? '1px solid rgba(184,135,42,0.4)' : '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '0.9375rem', color: active === i ? ED.paper : 'rgba(243,239,229,0.5)', fontStyle: 'italic' }}>
              {tab.label}
            </span>
            <span style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '8px', letterSpacing: '0.08em', color: active === i ? ED.gold : 'rgba(243,239,229,0.28)', padding: '1px 6px', borderRadius: '999px', background: active === i ? 'rgba(184,135,42,0.15)' : 'rgba(255,255,255,0.05)' }}>
              {tab.tag}
            </span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-8 items-start">
        <div>
          <p style={{ fontFamily: 'var(--font-instrument-serif)', fontSize: '1.25rem', color: ED.paper, fontStyle: 'italic', lineHeight: 1.4, marginBottom: '1.25rem' }}>
            {TABS[active].label}
          </p>
          <p style={{ fontSize: '0.9375rem', color: 'rgba(243,239,229,0.55)', lineHeight: 1.75 }}>
            {TABS[active].desc}
          </p>
        </div>
        <div>
          {TABS[active].preview}
        </div>
      </div>
    </div>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import '@/components/landing/landing.css'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { LandingEffets } from '@/components/landing/landing-effets'
import { FaqAccordion } from '@/components/landing/faq-accordion'
import { VeilleEncart } from '@/components/landing/veille-encart'
import { TitreFrappe } from '@/components/landing/titre-frappe'
import { Sceau } from '@/components/landing/sceau'
import { VideoCitation } from '@/components/landing/video-citation'
import { FORFAITS, MENTION_TVA } from '@/lib/offre'

import photoHologramme from '@/public/photos/colonnes-hologramme.jpg'
import gravureJustice from '@/public/photos/justitia.webp'
import photoFacade from '@/public/photos/facade-haussmann.jpg'
import photoBibliotheque from '@/public/photos/bibliotheque.jpg'
import photoAvocat from '@/public/photos/avocat-bureau.jpg'
import photoRue from '@/public/photos/rue-paris.jpg'

/* ── Contenus ────────────────────────────────────────── */
const CONSTATS = [
  {
    titre: 'Un module conçu pour vous',
    texte: "Nous avons développé notre propre outil d'administration. Vous modifiez vos pages, vos horaires ou vos honoraires en quelques clics, et vous réglez le référencement SEO et GEO de chaque page. Sans abonnement, sans webmaster.",
  },
  {
    titre: 'Votre cabinet, trouvé et compris',
    texte: "Avant d'appeler un avocat, beaucoup de clients consultent son site. Un site clair, rapide et lisible sur téléphone leur dit qui vous êtes, ce que vous faites et comment vous joindre.",
  },
  {
    titre: 'Un blog pour montrer votre expertise',
    texte: 'Commenter une réforme, expliquer une procédure, réagir à une décision : publier régulièrement démontre votre compétence, sans démarchage, et nourrit votre référencement.',
  },
  {
    titre: 'Des options selon vos besoins',
    texte: 'Site traduit en plusieurs langues, paiement de consultation en ligne, prise de rendez-vous, espace documents : nous ajoutons ce dont votre cabinet a besoin.',
  },
]

// Défilement horizontal « À quoi ressemblera votre site » : de la collaboration au module.
const DEFILE = [
  {
    titre: 'Ensemble, on choisit le design.',
    texte: "Lors d'un premier échange, nous définissons l'allure de votre site : couleurs, typographies, photographies. Nous vous proposons plusieurs pistes graphiques, vous choisissez, nous affinons.",
    points: ['Plusieurs pistes graphiques au choix', 'Vos couleurs, vos photos, votre ton'],
  },
  {
    titre: 'Vous choisissez vos pages.',
    texte: "Accueil, cabinet, domaines d'intervention, honoraires, blog, contact : nous construisons ensemble l'arborescence de votre site, page par page, selon votre activité.",
    points: ['Une arborescence pensée pour vos clients', 'Des pages ajoutées à tout moment'],
  },
  {
    titre: 'Une page d’accueil qui inspire confiance.',
    texte: 'En quelques secondes, le visiteur sait qui vous êtes, où vous exercez et comment vous joindre. Une grande photo, un titre clair, un seul bouton.',
    points: ['Lisible sur téléphone avant tout', 'Photographie et typographie choisies pour le cabinet'],
  },
  {
    titre: 'Une page pour chaque domaine.',
    texte: "Divorce, licenciement, bail commercial : vos clients cherchent une réponse à leur problème. Chaque domaine d'intervention a sa page, rédigée pour être comprise et trouvée.",
    points: ['Textes rédigés avec vous, sans jargon', 'Référencement local : ville et barreau'],
  },
  {
    titre: 'Un contact sans friction.',
    texte: 'Formulaire court, numéro cliquable, prise de rendez-vous en ligne si vous le souhaitez. Les demandes arrivent directement dans votre boîte mail.',
    points: ['Prise de rendez-vous en ligne', 'Formulaire conforme au RGPD'],
  },
  {
    titre: 'Et c’est vous qui le faites vivre.',
    texte: 'Une fois en ligne, votre site vous appartient. Depuis votre module, vous modifiez une page, publiez un article ou réglez le référencement, sans attendre personne.',
    points: ['Modifiable en quelques clics', 'Blog prêt à publier', 'SEO et GEO réglables page par page'],
  },
]

const PISTES = [
  { nom: 'Classique', couleurs: ['#14213D', '#A8824A', '#F2EFEA'], police: 'serif' },
  { nom: 'Contemporain', couleurs: ['#1B2130', '#5C6270', '#FFFFFF'], police: 'sans' },
  { nom: 'Épuré', couleurs: ['#2E3D33', '#B9A27A', '#FAF8F3'], police: 'serif' },
]

const ARBORESCENCE: { page: string; inclus: boolean; sous?: string[] }[] = [
  { page: 'Accueil', inclus: true },
  { page: 'Le cabinet', inclus: true },
  { page: 'Domaines d’intervention', inclus: true, sous: ['Copropriété', 'Baux d’habitation', 'Vente immobilière'] },
  { page: 'Honoraires', inclus: true },
  { page: 'Blog', inclus: true },
  { page: 'Contact et rendez-vous', inclus: true },
  { page: 'Espace documents', inclus: false },
]

const FAQ_LANDING = [
  {
    q: 'Combien de temps faut-il pour avoir mon site ?',
    r: "Comptez deux semaines pour le forfait Essentiel et trois à quatre semaines pour le forfait Cabinet, à partir de l'entretien de lancement. Le délai dépend surtout de vos relectures : le devis comprend un calendrier précis.",
  },
  {
    q: 'Le site respectera-t-il les règles de la profession ?',
    r: "Chaque site tient compte des règles de communication de l'avocat (RIN, article 10) : nom de domaine, mentions, spécialisations, honoraires. Vous validez chaque page avant la mise en ligne et vous restez responsable de votre communication auprès de votre Ordre.",
  },
  {
    q: 'Le site m’appartient-il ?',
    r: "Oui. Le nom de domaine est enregistré à votre nom et le site vous appartient une fois réglé. Vous n'avez aucun abonnement à payer pour le garder, excepté l'abonnement d'hébergement du site et le nom de domaine.",
  },
  {
    q: 'Pourrai-je modifier le site moi-même ?',
    r: "Oui. Votre site est livré avec un espace d'administration simple : vous modifiez vos textes et, avec le forfait Cabinet, publiez des articles de blog et réglez le référencement SEO et GEO de chaque page, quand vous le souhaitez.",
  },
  {
    q: 'J’ai déjà un site. Pouvez-vous le refaire ?',
    r: "Oui. Nous conservons ce qui fonctionne (textes, adresse, référencement acquis) et mettons en place les redirections pour préserver votre position sur Google.",
  },
  {
    q: 'Comment se passe le paiement ?',
    r: "40 % à la signature du devis, le solde à la mise en ligne. Ensuite, aucun abonnement.",
  },
]

/* ── Pages de démonstration affichées dans la vitrine ── */
function CadreNavigateur({ children }: { children: React.ReactNode }) {
  return (
    <div className="lx-cadre">
      <div className="lx-cadre__barre" aria-hidden>
        <span className="lx-cadre__points"><i /><i /><i /></span>
        <span className="lx-cadre__url">delmas-avocat.fr</span>
      </div>
      <div className="lx-cadre__pages">{children}</div>
    </div>
  )
}

function EnteteDemo() {
  return (
    <div className="lx-demo__entete">
      <b>Cabinet Delmas</b>
      <span className="lx-demo__menu"><span>Le cabinet</span><span>Domaines</span><span>Honoraires</span><span>Contact</span></span>
    </div>
  )
}

function PageDemo({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="lx-demo lx-demo--accueil">
        <Image src={photoFacade} alt="" fill sizes="(min-width: 1024px) 40vw, 90vw" placeholder="blur" />
        <EnteteDemo />
        <div className="lx-demo__hero">
          <small>Avocate au barreau de Paris</small>
          <p>Droit immobilier et copropriété.</p>
          <span className="lx-demo__bouton">Prendre rendez-vous</span>
        </div>
      </div>
    )
  }
  if (index === 1) {
    return (
      <div className="lx-demo lx-demo--domaines">
        <EnteteDemo />
        <div className="lx-demo__colonnes">
          <div><Image src={photoBibliotheque} alt="" fill sizes="(min-width: 1024px) 20vw, 45vw" placeholder="blur" /></div>
          <div className="lx-demo__liste">
            <h4>Domaines d’intervention</h4>
            <div><strong>Copropriété</strong><span>Assemblées générales, charges, travaux</span></div>
            <div><strong>Baux d’habitation</strong><span>Loyers, congés, dépôt de garantie</span></div>
            <div><strong>Vente immobilière</strong><span>Vices cachés, compromis, garanties</span></div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="lx-demo lx-demo--contact">
      <EnteteDemo />
      <div className="lx-demo__contact">
        <div className="lx-demo__photo"><Image src={photoAvocat} alt="" fill sizes="(min-width: 1024px) 22vw, 50vw" placeholder="blur" /></div>
        <div className="lx-demo__form">
          <h4>Prendre rendez-vous</h4>
          <div className="lx-demo__champ" />
          <div className="lx-demo__champ" />
          <div className="lx-demo__creneaux"><span>Lun. 10 h</span><span className="is-choisi">Mar. 14 h</span><span>Jeu. 9 h</span></div>
          <span className="lx-demo__bouton" style={{ textAlign: 'center' }}>Confirmer</span>
        </div>
      </div>
    </div>
  )
}

function VisuelPistes() {
  return (
    <div className="lx-pistes" aria-hidden>
      {PISTES.map((p, i) => (
        <div key={p.nom} className={`lx-piste${i === 0 ? ' is-choisie' : ''}`}>
          <div className="lx-piste__apercu" style={{ background: p.couleurs[2] }}>
            <span className={`lx-piste__aa lx-piste__aa--${p.police}`} style={{ color: p.couleurs[0] }}>Aa</span>
            <span className="lx-piste__barre" style={{ background: p.couleurs[0] }} />
            <span className="lx-piste__barre lx-piste__barre--courte" style={{ background: p.couleurs[1] }} />
          </div>
          <div className="lx-piste__pied">
            <span>{p.nom}</span>
            <span className="lx-piste__nuancier">{p.couleurs.map((c) => <i key={c} style={{ background: c }} />)}</span>
          </div>
          {i === 0 && <span className="lx-piste__choix">Retenue</span>}
        </div>
      ))}
    </div>
  )
}

function VisuelArborescence() {
  return (
    <div className="lx-arbo" aria-hidden>
      <p className="lx-arbo__site">delmas-avocat.fr</p>
      <ul>
        {ARBORESCENCE.map((n) => (
          <li key={n.page} className={n.inclus ? '' : 'is-option'}>
            <span className="lx-arbo__case">{n.inclus ? '✓' : '+'}</span>
            {n.page}
            {!n.inclus && <em>option</em>}
            {n.sous && (
              <ul>{n.sous.map((x) => <li key={x}><span className="lx-arbo__case">✓</span>{x}</li>)}</ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function VisuelModule() {
  return (
    <div className="lx-module" aria-hidden>
      <div className="lx-module__barre">
        <span className="lx-cadre__points"><i /><i /><i /></span>
        <span>Module Lexavo · Cabinet Delmas</span>
      </div>
      <div className="lx-module__corps">
        <nav className="lx-module__menu">
          <span className="is-actif">Pages</span><span>Blog</span><span>Référencement</span><span>Médias</span>
        </nav>
        <div className="lx-module__contenu">
          <p className="lx-module__fil">Pages / Accueil</p>
          <span className="lx-module__label">Titre de la page</span>
          <div className="lx-module__champ">Droit immobilier et copropriété.</div>
          <span className="lx-module__label">Texte d’introduction</span>
          <div className="lx-module__champ"><span className="lx-module__frappe">Maître Delmas vous accompagne à Paris.</span></div>
          <div className="lx-module__seo">
            <div><span className="lx-module__label">Titre SEO</span><div className="lx-module__champ lx-module__champ--remplit">Avocat droit immobilier Paris | Cabinet Delmas</div></div>
            <div><span className="lx-module__label">Résumé GEO pour les assistants IA</span><div className="lx-module__champ lx-module__champ--remplit lx-module__champ--d2">Avocate en droit immobilier à Paris : copropriété, baux, vente.</div></div>
          </div>
          <div className="lx-module__article"><span>Article · « Ce que change la réforme de la copropriété »</span><b>Publié</b></div>
          <span className="lx-module__toast">Modifications enregistrées</span>
        </div>
      </div>
    </div>
  )
}

/* ── Page ────────────────────────────────────────────── */
export default function HomePage() {
  return (
    <div className="lx">
      <LandingEffets />
      <LandingNav solide />

      {/* ══ Hero ═══════════════════════════════════════════ */}
      <section className="lx-hero">
        {/* La feuille d'acte : papier, lignes réglées et double marge dorée */}
        <div className="lx-acte" aria-hidden="true" />
        {/* Justitia en filigrane : « Iustitia », gravure d'après Hendrick Goltzius (v. 1585-1637), Rijksmuseum RP-P-1882-A-6499, domaine public (CC0) */}
        <div className="lx-justice" aria-hidden="true">
          <Image src={gravureJustice} alt="" fill sizes="(min-width: 768px) 30vw, 60vw" />
        </div>

        <div className="lx-wrap lx-hero__contenu">
          <p className="lx-hero__accroche">Création de sites internet pour avocats</p>
          <TitreFrappe
            className="lx-display"
            fixe="Le site de votre cabinet,"
            corrections={[
              { faux: 'avec abonnement', vrai: 'sans abonnement' },
              { faux: 'introuvable sur Google', vrai: 'prêt pour Google et les IA' },
              { faux: 'dépendant d’un webmaster', vrai: 'modifiable en quelques clics' },
            ]}
          />
          <p className="lx-hero__texte">
            Nous créons le site de votre cabinet. Ensuite, c&apos;est vous qui le faites vivre&nbsp;: textes, blog, référencement SEO et GEO, en quelques clics.
          </p>
        </div>

        {/* Trois sceaux apposés au bas de la feuille, à cheval sur la section suivante */}
        <div className="lx-hero__pied">
          <div className="lx-sceaux">
            <Sceau id="sceau-devis" centre="48 h" sousCentre="devis" anneau="pour recevoir votre devis · sans engagement · " texteAccessible="48 h pour recevoir votre devis, sans engagement." />
            <Sceau id="sceau-delai" centre="3" sousCentre="semaines" anneau="pour être en ligne · site livré clé en main · " texteAccessible="3 semaines pour être en ligne, site livré clé en main." />
            <Sceau id="sceau-module" centre="Module" sousCentre="inclus" anneau="textes · blog · SEO et GEO · gérés par vous · " texteAccessible="Module inclus : textes, blog, SEO et GEO, gérés par vous." />
          </div>
        </div>
      </section>

      {/* ══ Constat ════════════════════════════════════════ */}
      <section className="lx-constat">
        <div className="lx-wrap lx-constat__mise">
          <div className="lx-constat__texte">
            <p className="lx-constat__phrase lx-reveal">
              L&apos;IA accélère notre travail. Nous gardons la main sur chaque détail. Vous payez <em>le juste prix</em>.
            </p>
            <div className="lx-constat__grille">
              {CONSTATS.map(({ titre, texte }) => (
                <div key={titre} className="lx-reveal">
                  <h3>{titre}</h3>
                  <p>{texte}</p>
                </div>
              ))}
            </div>
          </div>
          {/* Le palais en hologramme (image générée avec Higgsfield à partir de la photo des colonnes) ; une ligne de balayage dorée le parcourt */}
          <div className="lx-constat__photo lx-scan lx-reveal-image">
            <Image src={photoHologramme} alt="Palais de justice à colonnes représenté en hologramme de lumière dorée" fill sizes="(min-width: 1024px) 40vw, 100vw" placeholder="blur" />
            <div className="lx-scan__ligne" aria-hidden="true" />
            <span className="lx-scan__coin lx-scan__coin--hg" aria-hidden="true" />
            <span className="lx-scan__coin lx-scan__coin--hd" aria-hidden="true" />
            <span className="lx-scan__coin lx-scan__coin--bg" aria-hidden="true" />
            <span className="lx-scan__coin lx-scan__coin--bd" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* ══ Défilement horizontal : de la collaboration au module ══ */}
      <section id="methode" className="lx-defile">
        <div className="lx-defile__colle">
          <div className="lx-defile__piste">
            <div className="lx-defile__panneau lx-defile__panneau--intro">
              <h2 className="lx-h2">À quoi ressemblera votre site.</h2>
              <p className="lx-lead">Du premier échange à la mise en ligne, puis au quotidien.</p>
              <p className="lx-defile__indice">Faites défiler <span aria-hidden>→</span></p>
            </div>
            {DEFILE.map(({ titre, texte, points }, i) => (
              <article key={titre} className="lx-defile__panneau" data-panneau={i + 1}>
                <div className="lx-defile__texte">
                  <span className="lx-defile__num">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{titre}</h3>
                  <p>{texte}</p>
                  <ul>{points.map((pt) => <li key={pt}>{pt}</li>)}</ul>
                </div>
                <div className="lx-defile__visuel">
                  {i === 0 && <VisuelPistes />}
                  {i === 1 && <VisuelArborescence />}
                  {i >= 2 && i <= 4 && <CadreNavigateur><PageDemo index={i - 2} /></CadreNavigateur>}
                  {i === 5 && <VisuelModule />}
                </div>
              </article>
            ))}
          </div>
          <div className="lx-defile__progression" aria-hidden>
            <span className="lx-defile__compteur"><b>01</b> / {String(DEFILE.length + 1).padStart(2, '0')}</span>
            <span className="lx-defile__jauge"><i /></span>
          </div>
        </div>
      </section>

      {/* ══ Vidéo d'ambiance (rendez-vous avocate / client, de jour, générée par IA) + citation ══ */}
      <VideoCitation src="/videos/rendez-vous.mp4" poster="/videos/rendez-vous.jpg" />

      {/* ══ Forfaits ═══════════════════════════════════════ */}
      <section id="forfaits" className="lx-forfaits">
        <div className="lx-wrap">
          <h2 className="lx-h2 lx-reveal">Un prix clair avant de commencer.</h2>
          <p className="lx-lead lx-reveal">Chaque projet fait l&apos;objet d&apos;un devis ferme après l&apos;entretien de lancement. Pas de frais cachés, pas de surprise à la livraison.</p>

          <div className="lx-forfaits__grille">
            {FORFAITS.map((f) => (
              <div key={f.id} className={`lx-forfait lx-reveal${f.misEnAvant ? ' lx-forfait--phare' : ''}`}>
                {f.misEnAvant && <span className="lx-forfait__badge">Le plus demandé</span>}
                <h3 className="lx-forfait__nom">{f.nom}</h3>
                <p className="lx-forfait__accroche">{f.accroche}</p>
                {f.aPartirDe && <span className="lx-forfait__apartir">À partir de</span>}
                <p className="lx-forfait__prix">{f.prix}</p>
                <ul>{f.inclus.map((ligne) => <li key={ligne}>{ligne}</li>)}</ul>
                <p className="lx-forfait__delai">Délai : {f.delai}</p>
                <Link href={`/contact?forfait=${f.id}`} className={`lx-btn ${f.misEnAvant ? 'lx-btn--laiton' : 'lx-btn--ligne'}`}>
                  {f.aPartirDe ? `Demander un devis ${f.nom}` : 'Décrire mon projet'}
                </Link>
              </div>
            ))}
          </div>

          <p className="lx-mention">{MENTION_TVA}</p>
        </div>
      </section>

      {/* ══ FAQ ════════════════════════════════════════════ */}
      <section id="questions" className="lx-faq">
        <div className="lx-wrap lx-faq__grille">
          <div>
            <h2 className="lx-h2 lx-reveal">Vos questions avant de vous lancer.</h2>
            <p className="lx-lead lx-reveal">
              Une autre question ? Écrivez-nous depuis la <Link href="/contact" className="lx-lien" style={{ color: 'var(--robe)' }}>page contact</Link>, nous répondons sous 48 heures ouvrées.
            </p>
          </div>
          <FaqAccordion items={FAQ_LANDING} />
        </div>
      </section>

      <VeilleEncart />

      {/* ══ Appel final ════════════════════════════════════ */}
      <section className="lx-final">
        <div className="lx-final__image" data-parallax="0.14">
          <Image src={photoRue} alt="" fill sizes="100vw" placeholder="blur" />
        </div>
        <div className="lx-wrap lx-final__contenu">
          <h2 className="lx-display lx-reveal">Parlons de votre site.</h2>
          <p className="lx-reveal">Décrivez votre cabinet en quelques lignes : nous revenons vers vous sous 48 heures ouvrées avec une proposition.</p>
          <div className="lx-reveal">
            <Link href="/contact" className="lx-btn lx-btn--laiton">
              Demander un devis gratuit <span className="lx-btn__trait" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  )
}

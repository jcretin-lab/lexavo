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
import { FORFAITS, MENTION_TVA } from '@/lib/offre'

import photoColonnes from '@/public/photos/colonnes.jpg'
import gravureJustice from '@/public/photos/justitia.webp'
import photoBustes from '@/public/photos/bibliotheque-bustes.jpg'
import photoFacade from '@/public/photos/facade-haussmann.jpg'
import photoBibliotheque from '@/public/photos/bibliotheque.jpg'
import photoAvocat from '@/public/photos/avocat-bureau.jpg'
import photoStylo from '@/public/photos/stylo-plume.jpg'
import photoPalais from '@/public/photos/palais-justice.jpg'
import photoRue from '@/public/photos/rue-paris.jpg'

/* ── Contenus ────────────────────────────────────────── */
const CONSTATS = [
  {
    titre: 'On vous cherche avant de vous appeler',
    texte: "Recommandé par un proche ou trouvé sur Google, un futur client commence toujours par votre site. S'il est absent, daté ou illisible sur téléphone, il continue sa recherche ailleurs.",
  },
  {
    titre: 'Votre communication est encadrée',
    texte: "Nom de domaine, mentions obligatoires, spécialisations, honoraires : le RIN encadre la communication de l'avocat. Une agence généraliste ne connaît pas toujours ces règles.",
  },
  {
    titre: 'Votre temps est compté',
    texte: "Une heure d'entretien et quelques relectures : c'est tout ce que nous vous demandons. Nous nous occupons de tout le reste, de la maquette à la mise en ligne.",
  },
]

const VITRINE = [
  {
    titre: 'Une page d’accueil qui inspire confiance.',
    texte: "En quelques secondes, le visiteur sait qui vous êtes, où vous exercez et comment vous joindre. Une grande photo, un titre clair, un seul bouton.",
    points: ['Photographie et typographie choisies pour le cabinet', 'Lisible sur téléphone avant tout', 'Chargement en moins de deux secondes'],
  },
  {
    titre: 'Une page pour chaque domaine.',
    texte: "Divorce, licenciement, bail commercial : vos clients cherchent une réponse à leur problème. Chaque domaine d'intervention a sa page, rédigée pour être comprise et trouvée sur Google.",
    points: ['Textes rédigés avec vous, sans jargon', 'Référencement local : ville et barreau', 'Aucune promesse de résultat'],
  },
  {
    titre: 'Un contact sans friction.',
    texte: "Formulaire court, numéro cliquable, prise de rendez-vous en ligne si vous le souhaitez. Les demandes arrivent directement dans votre boîte mail.",
    points: ['Prise de rendez-vous en ligne', 'Formulaire conforme au RGPD', 'Plan d’accès et horaires'],
  },
]

const ETAPES = [
  { titre: 'Entretien', texte: "Trente minutes au téléphone pour comprendre votre cabinet, votre clientèle et vos domaines d'intervention. Vous recevez un devis ferme sous 48 heures." },
  { titre: 'Maquette', texte: 'Une première version de la page d’accueil, à vos couleurs. Vous commentez, nous ajustons jusqu’à ce qu’elle vous ressemble.' },
  { titre: 'Contenus', texte: 'Nous rédigeons ou reprenons vos textes. Vous relisez et validez chaque page avant sa mise en ligne.' },
  { titre: 'Mise en ligne', texte: 'Nom de domaine, HTTPS, référencement, formulaire : tout est branché. Nous préparons les éléments à transmettre à votre Ordre.' },
]

const DEONTOLOGIE = [
  'Un nom de domaine construit sur votre nom ou celui du cabinet',
  'Les mentions obligatoires : barreau, structure d’exercice, médiateur',
  'Des spécialisations affichées seulement si elles sont certifiées',
  'Une information sur les honoraires, sans promesse de résultat',
  'Aucune publicité tierce sur votre site',
  'Un formulaire conforme au RGPD et au secret professionnel',
]

const FAQ_LANDING = [
  {
    q: 'Combien de temps faut-il pour avoir mon site ?',
    r: "Comptez trois semaines pour le forfait Essentiel et quatre à cinq semaines pour le forfait Cabinet, à partir de l'entretien de lancement. Le délai dépend surtout de vos relectures : le devis comprend un calendrier précis.",
  },
  {
    q: 'Le site respectera-t-il les règles de la profession ?',
    r: "Chaque site tient compte des règles de communication de l'avocat (RIN, article 10) : nom de domaine, mentions, spécialisations, honoraires. Vous validez chaque page avant la mise en ligne et vous restez responsable de votre communication auprès de votre Ordre.",
  },
  {
    q: 'Je n’ai ni textes ni photos. Est-ce un problème ?',
    r: "Non. Avec le forfait Cabinet, nous rédigeons les textes à partir d'un entretien. Pour les visuels, nous sélectionnons des photographies libres de droits, ou nous vous orientons vers un photographe pour un portrait.",
  },
  {
    q: 'Le site m’appartient-il ?',
    r: "Oui. Le nom de domaine est enregistré à votre nom et le site vous appartient une fois réglé. Vous n'avez aucun abonnement à payer pour le garder.",
  },
  {
    q: 'Pourrai-je modifier le site moi-même ?',
    r: "Oui. Votre site est livré avec un espace d'administration simple : vous modifiez vos textes, publiez des articles de blog et réglez le référencement SEO et GEO de chaque page, quand vous le souhaitez.",
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
              Un client ne choisit jamais un avocat qu&apos;il n&apos;a jamais vu. Votre site est <em>souvent la première rencontre</em> avec votre cabinet.
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
          <div className="lx-constat__photo lx-reveal-image">
            <Image src={photoColonnes} alt="Colonnes et fronton sculpté d’un palais de justice, vus en contre-plongée" fill sizes="(min-width: 1024px) 40vw, 100vw" placeholder="blur" />
          </div>
        </div>
      </section>

      {/* ══ Vitrine ════════════════════════════════════════ */}
      <section id="realisations" className="lx-vitrine">
        <div className="lx-wrap">
          <h2 className="lx-h2 lx-reveal">À quoi ressemblera votre site.</h2>
          <p className="lx-lead lx-reveal">Un exemple de site réalisé pour un cabinet fictif en droit immobilier. Faites défiler pour le parcourir.</p>

          <div className="lx-vitrine__grille">
            <div>
              {VITRINE.map(({ titre, texte, points }, i) => (
                <article key={titre} className={`lx-vitrine__etape${i === 0 ? ' is-active' : ''}`} data-etape={i}>
                  <h3>{titre}</h3>
                  <p>{texte}</p>
                  <ul>{points.map((p) => <li key={p}>{p}</li>)}</ul>
                  <div className="lx-ecran-mobile">
                    <CadreNavigateur><div className="lx-page"><PageDemo index={i} /></div></CadreNavigateur>
                  </div>
                </article>
              ))}
            </div>

            <div className="lx-vitrine__colle" aria-hidden>
              <CadreNavigateur>
                {VITRINE.map((_, i) => (
                  <div key={i} className={`lx-page${i === 0 ? ' is-active' : ''}`} data-page={i}>
                    <PageDemo index={i} />
                  </div>
                ))}
              </CadreNavigateur>
            </div>
          </div>
        </div>
      </section>

      {/* ══ Bandeau photo ═════════════════════════════════ */}
      <section className="lx-bandeau" aria-label="Citation">
        <div className="lx-bandeau__image" data-parallax="0.18">
          <Image src={photoBustes} alt="" fill sizes="100vw" placeholder="blur" />
        </div>
        <div className="lx-wrap">
          <blockquote className="lx-reveal">
            <p>La compétence se prouve au cabinet. La confiance commence en ligne.</p>
            <footer>Avant de prendre rendez-vous, vos futurs clients lisent ce que vous dites de votre cabinet. Faites en sorte qu&apos;ils aient envie d&apos;aller plus loin.</footer>
          </blockquote>
        </div>
      </section>

      {/* ══ Méthode ════════════════════════════════════════ */}
      <section id="methode" className="lx-methode">
        <div className="lx-wrap lx-methode__grille">
          <div className="lx-methode__photo lx-reveal-image">
            <Image src={photoStylo} alt="Stylo plume posé sur une lettre manuscrite" fill sizes="(min-width: 1024px) 40vw, 100vw" placeholder="blur" />
          </div>
          <div>
            <h2 className="lx-h2 lx-reveal">Quatre étapes, une heure de votre temps.</h2>
            <p className="lx-lead lx-reveal">Un seul interlocuteur du premier appel à la mise en ligne. Vous validez chaque étape avant que nous passions à la suivante.</p>
            <ol className="lx-etapes">
              {ETAPES.map(({ titre, texte }, i) => (
                <li key={titre}>
                  <span className="lx-etapes__num" aria-hidden>{i + 1}</span>
                  <div>
                    <h3>{titre}</h3>
                    <p>{texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ══ Déontologie ═══════════════════════════════════ */}
      <section id="deontologie" className="lx-deonto">
        <div className="lx-deonto__grille">
          <div className="lx-deonto__photo lx-reveal-image">
            <Image src={photoPalais} alt="Galerie à colonnes du Palais de justice de Bruxelles" fill sizes="(min-width: 1024px) 50vw, 100vw" placeholder="blur" />
          </div>
          <div className="lx-deonto__texte">
            <h2 className="lx-h2 lx-reveal">Pensé pour la profession, pas adapté après coup.</h2>
            <p className="lx-lead lx-reveal">
              Nous travaillons pour les avocats et publions une veille de jurisprudence. Les règles de communication de la profession sont prises en compte dès la maquette.
            </p>
            <ul>
              {DEONTOLOGIE.map((item) => <li key={item} className="lx-reveal">{item}</li>)}
            </ul>
          </div>
        </div>
      </section>

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

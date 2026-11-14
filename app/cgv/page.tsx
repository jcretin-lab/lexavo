import Link from 'next/link'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'
import { FORFAITS, MENTION_TVA } from '@/lib/offre'

export const metadata = {
  title: 'Conditions Générales de Vente — Lexavo',
}

export default function CGVPage() {
  return (
    <div className="min-h-screen ed-legal-page">
      <LandingNav solide />
      <div className="max-w-3xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.15em', color: '#6E6860', textDecoration: 'none', display: 'inline-block', marginBottom: '2.5rem' }} className="hover:text-black transition-colors">← ACCUEIL</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales de Vente</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : novembre 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Objet</h2>
          <p className="text-gray-700 leading-relaxed">
            Les présentes Conditions Générales de Vente (CGV) régissent les prestations de conception et de réalisation de sites internet fournies par LEXAVO (PRETET Julien, entrepreneur individuel, SIRET 94997889400028) à tout client professionnel (ci-après « le Client »). Toute commande implique l&apos;acceptation sans réserve des présentes CGV, qui prévalent sur tout autre document, sauf dérogation écrite figurant au devis.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Prestations</h2>
          <p className="text-gray-700 leading-relaxed mb-3">LEXAVO propose les formules suivantes, dont le contenu exact est précisé dans le devis :</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            {FORFAITS.map((f) => (
              <li key={f.id}>
                <strong>{f.nom}</strong> — {f.aPartirDe ? `à partir de ${f.prix}` : f.prix} : {f.accroche.toLowerCase()}
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Devis et commande</h2>
          <p className="text-gray-700 leading-relaxed">
            Chaque prestation fait l&apos;objet d&apos;un devis gratuit, valable 30 jours, qui décrit le périmètre, le prix et le calendrier prévisionnel. La commande est ferme à réception du devis signé et du paiement de l&apos;acompte. Toute demande sortant du périmètre du devis fait l&apos;objet d&apos;un devis complémentaire.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Prix et paiement</h2>
          <p className="text-gray-700 leading-relaxed">
            Les prix sont exprimés en euros. {MENTION_TVA} Sauf mention contraire au devis, un acompte de 40 % est dû à la signature et le solde à la mise en ligne. Aucun abonnement n&apos;est facturé après la mise en ligne. Les factures sont payables à réception, par virement.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Tout retard de paiement entraîne de plein droit des pénalités au taux de trois fois le taux d&apos;intérêt légal et une indemnité forfaitaire pour frais de recouvrement de 40 € (articles L.441-10 et D.441-5 du Code de commerce). LEXAVO peut suspendre la mise en ligne jusqu&apos;à régularisation.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Déroulement et obligations du Client</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Le calendrier figurant au devis suppose la collaboration du Client. Celui-ci s&apos;engage à :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>fournir dans les délais convenus les informations, textes, logos et photographies nécessaires ;</li>
            <li>disposer des droits sur les éléments qu&apos;il fournit ;</li>
            <li>relire et valider la maquette puis chaque page avant mise en ligne ;</li>
            <li>vérifier la conformité du contenu du site aux règles de sa profession.</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Un retard du Client décale d&apos;autant le calendrier. Sans retour du Client dans les 15 jours suivant une demande de validation, l&apos;étape concernée est réputée validée.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Règles déontologiques</h2>
          <p className="text-gray-700 leading-relaxed">
            LEXAVO conçoit les sites en tenant compte des règles de communication applicables aux avocats, notamment l&apos;article 10 du Règlement Intérieur National. Le Client, seul tenu à ces obligations, reste responsable du contenu publié et des démarches auprès de son Ordre (notamment l&apos;information relative au nom de domaine). La validation des pages par le Client vaut acceptation de leur contenu.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Recette et mise en ligne</h2>
          <p className="text-gray-700 leading-relaxed">
            Une fois le site achevé, LEXAVO le présente au Client sur une adresse de prévisualisation. Le Client dispose de 10 jours pour signaler les anomalies par rapport au devis. À défaut, ou dès la mise en ligne à sa demande, le site est réputé accepté. Les anomalies signalées pendant ce délai sont corrigées sans frais.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Propriété</h2>
          <p className="text-gray-700 leading-relaxed">
            Le nom de domaine est enregistré au nom du Client. À complet paiement, LEXAVO cède au Client les droits d&apos;exploitation sur les éléments créés spécifiquement pour son site (maquette, textes rédigés, code propre au site), pour la durée de la protection et pour le monde entier. Les composants génériques, bibliothèques logicielles et outils de LEXAVO restent sa propriété ou celle de leurs auteurs et sont concédés en licence pour les besoins du site. LEXAVO peut mentionner le site parmi ses références, sauf opposition écrite du Client.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Après la mise en ligne</h2>
          <p className="text-gray-700 leading-relaxed">
            La prestation ne comporte aucun abonnement. Le site est livré avec un espace d&apos;administration permettant au Client de modifier lui-même ses contenus. Les éventuels frais d&apos;hébergement et de nom de domaine sont précisés au devis. Sur simple demande, LEXAVO remet au Client les fichiers du site et les accès au nom de domaine dans un délai de 15 jours. Toute intervention ultérieure demandée par le Client fait l&apos;objet d&apos;un devis séparé.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Responsabilité</h2>
          <p className="text-gray-700 leading-relaxed">
            LEXAVO est tenu d&apos;une obligation de moyens. Il ne garantit ni un positionnement dans les moteurs de recherche, ni un volume de contacts. Sa responsabilité, toutes causes confondues, est limitée au montant payé par le Client au titre de la prestation concernée. LEXAVO ne répond pas des interruptions imputables aux hébergeurs, registres de noms de domaine ou autres prestataires tiers.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">11. Données personnelles</h2>
          <p className="text-gray-700 leading-relaxed">
            Le traitement des données du Client est décrit dans la{' '}
            <Link href="/politique-confidentialite" className="text-blue-600 hover:underline">politique de confidentialité</Link>. Pour les données des visiteurs du site du Client, celui-ci est responsable de traitement ; lorsque LEXAVO intervient sur le site ou en assure l&apos;hébergement, il agit en qualité de sous-traitant au sens de l&apos;article 28 du RGPD.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">12. Droit applicable et litiges</h2>
          <p className="text-gray-700 leading-relaxed">
            Les présentes CGV sont soumises au droit français. En cas de litige, les parties rechercheront d&apos;abord une solution amiable. À défaut, les tribunaux compétents du ressort de Versailles seront saisis.
          </p>
        </section>
      </div>
      <LandingFooter />
    </div>
  )
}

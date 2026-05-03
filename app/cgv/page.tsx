import Link from 'next/link'

export const metadata = {
  title: 'Conditions Générales de Vente — Lexavo',
}

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">← Retour à l&apos;accueil</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Conditions Générales de Vente</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : avril 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.1 Objet</h2>
          <p className="text-gray-700 leading-relaxed">
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre LEXAVO (PRETET Julien, SIRET 94997889400028) et tout professionnel souscrivant à un abonnement sur le site lexavo.fr.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.2 Services proposés</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            LEXAVO propose un service SaaS (Software as a Service) permettant aux cabinets d&apos;avocats de :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>Générer automatiquement du contenu marketing (articles de blog, posts Facebook, FAQ)</li>
            <li>Publier automatiquement du contenu sur Facebook</li>
            <li>Programmer des publications via un calendrier éditorial</li>
            <li>Transformer des articles existants en posts Facebook</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.3 Abonnements et tarifs</h2>
          <p className="text-gray-700 leading-relaxed mb-4">Trois formules d&apos;abonnement sont disponibles :</p>
          <div className="space-y-4">
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">Plan Essentiel — 49 € HT/mois</p>
              <p className="text-gray-600 text-sm mt-1">1 utilisateur, génération illimitée depuis articles existants, publication et programmation automatique Facebook</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">Plan Pro — 69 € HT/mois</p>
              <p className="text-gray-600 text-sm mt-1">1 utilisateur, toutes les fonctionnalités Essentiel + génération depuis un thème (article SEO, posts Facebook, FAQ, image IA)</p>
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">Plan Cabinet — 149 € HT/mois</p>
              <p className="text-gray-600 text-sm mt-1">3 utilisateurs inclus, toutes les fonctionnalités Pro</p>
            </div>
          </div>
          <p className="text-gray-600 text-sm mt-4">
            Les prix sont indiqués en euros hors taxes. La TVA applicable sera ajoutée selon la réglementation en vigueur.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.4 Période d&apos;essai</h2>
          <p className="text-gray-700 leading-relaxed">
            Tout nouvel utilisateur bénéficie de 3 publications gratuites sans engagement ni saisie de coordonnées bancaires. À l&apos;issue de cette période d&apos;essai, la souscription à un plan payant est nécessaire pour continuer à utiliser le service.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.5 Facturation et paiement</h2>
          <p className="text-gray-700 leading-relaxed">
            Les abonnements sont facturés mensuellement par prélèvement automatique via Stripe. La facturation intervient à la date de souscription puis chaque mois à la même date.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            En cas d&apos;échec de paiement, LEXAVO se réserve le droit de suspendre l&apos;accès au service jusqu&apos;à régularisation.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.6 Résiliation</h2>
          <p className="text-gray-700 leading-relaxed">
            L&apos;abonnement est sans engagement. L&apos;utilisateur peut résilier à tout moment depuis son espace personnel (<em>Paramètres &gt; Facturation</em>). La résiliation prend effet à la fin de la période de facturation en cours. Aucun remboursement au prorata n&apos;est effectué.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.7 Responsabilité de l&apos;utilisateur</h2>
          <p className="text-gray-700 leading-relaxed mb-3">L&apos;utilisateur est seul responsable :</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>De la relecture et validation des contenus générés avant publication</li>
            <li>Du respect des règles déontologiques applicables à sa profession</li>
            <li>De la conformité de ses publications avec la réglementation en vigueur</li>
            <li>De la sécurité de ses identifiants de connexion</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            LEXAVO fournit un outil d&apos;assistance à la rédaction. Les contenus générés par intelligence artificielle ne constituent pas un conseil juridique et ne sauraient engager la responsabilité de LEXAVO.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.8 Disponibilité du service</h2>
          <p className="text-gray-700 leading-relaxed">
            LEXAVO s&apos;engage à maintenir le service accessible 24h/24 et 7j/7, hors périodes de maintenance planifiée. En cas d&apos;interruption, LEXAVO informera les utilisateurs dans les meilleurs délais.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            LEXAVO ne pourra être tenu responsable des interruptions dues à des tiers (hébergeur, API tierces, etc.).
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.9 Modification des tarifs</h2>
          <p className="text-gray-700 leading-relaxed">
            LEXAVO se réserve le droit de modifier ses tarifs avec un préavis de 30 jours par email. L&apos;utilisateur peut résilier son abonnement sans frais si les nouveaux tarifs ne lui conviennent pas.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">2.10 Droit applicable et litiges</h2>
          <p className="text-gray-700 leading-relaxed">
            Les présentes CGV sont soumises au droit français. En cas de litige, une solution amiable sera recherchée en priorité. À défaut, les tribunaux compétents du ressort de Versailles seront saisis.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Conformément à l&apos;article L.612-1 du Code de la consommation, tout litige peut être soumis à un médiateur. LEXAVO adhère au service de médiation :{' '}
            <a href="https://www.mediation-consommation.fr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Médiateur de la consommation
            </a>
          </p>
        </section>
      </div>
    </div>
  )
}

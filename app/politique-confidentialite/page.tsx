import Link from 'next/link'

export const metadata = {
  title: 'Politique de confidentialité — Lexavo',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">← Retour à l&apos;accueil</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : avril 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.1 Responsable du traitement</h2>
          <p className="text-gray-700 leading-relaxed">
            PRETET Julien — LEXAVO<br />
            2 route de la Magnanerie, 78460 CHOISEL<br />
            <a href="mailto:contact@lexavo.fr" className="text-blue-600 hover:underline">contact@lexavo.fr</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.2 Données collectées</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Dans le cadre de l&apos;utilisation de Lexavo, les données suivantes sont collectées :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
            <li><strong>Données d&apos;identification :</strong> nom du cabinet, ville, barreau, spécialité</li>
            <li><strong>Données de contact :</strong> adresse email</li>
            <li><strong>Données de connexion :</strong> identifiants, tokens d&apos;authentification</li>
            <li><strong>Données de paiement :</strong> gérées exclusivement par Stripe (LEXAVO ne stocke aucune donnée bancaire)</li>
            <li><strong>Données d&apos;utilisation :</strong> contenus générés, historique des publications, calendrier éditorial</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.3 Finalités du traitement</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Les données collectées sont utilisées pour :</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>Fournir et améliorer le service Lexavo</li>
            <li>Gérer les abonnements et la facturation</li>
            <li>Envoyer les communications transactionnelles (bienvenue, confirmation de publication, quota)</li>
            <li>Assurer la sécurité du service</li>
            <li>Respecter les obligations légales</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.4 Base légale</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Le traitement des données repose sur :</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>L&apos;exécution du contrat d&apos;abonnement (données nécessaires au service)</li>
            <li>Le consentement de l&apos;utilisateur (communications marketing éventuelles)</li>
            <li>L&apos;obligation légale (facturation, comptabilité)</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.5 Sous-traitants et transferts</h2>
          <p className="text-gray-700 leading-relaxed">
            Lexavo fait appel à des sous-traitants techniques pour fournir son service. La liste complète est disponible sur demande à{' '}
            <a href="mailto:contact@lexavo.fr" className="text-blue-600 hover:underline">contact@lexavo.fr</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.6 Durée de conservation</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>Données de compte : durée de l&apos;abonnement + 3 ans après résiliation</li>
            <li>Données de facturation : 10 ans (obligation légale)</li>
            <li>Contenus générés : durée de l&apos;abonnement</li>
            <li>Logs de connexion : 1 an</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.7 Droits des utilisateurs</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>Droit d&apos;accès à vos données personnelles</li>
            <li>Droit de rectification</li>
            <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
            <li>Droit à la portabilité</li>
            <li>Droit d&apos;opposition au traitement</li>
            <li>Droit à la limitation du traitement</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Pour exercer ces droits, contactez :{' '}
            <a href="mailto:contact@lexavo.fr" className="text-blue-600 hover:underline">contact@lexavo.fr</a>
          </p>
          <p className="text-gray-700 leading-relaxed mt-2">
            Vous pouvez également introduire une réclamation auprès de la CNIL :{' '}
            <a href="https://www.cnil.fr" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://www.cnil.fr</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.8 Cookies</h2>
          <p className="text-gray-700 leading-relaxed">
            Le site lexavo.fr utilise uniquement des cookies techniques nécessaires au fonctionnement du service (authentification, session). Aucun cookie publicitaire ou de tracking n&apos;est utilisé.
          </p>
        </section>
      </div>
    </div>
  )
}

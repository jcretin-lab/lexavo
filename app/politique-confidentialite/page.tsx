import Link from 'next/link'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

export const metadata = {
  title: 'Politique de confidentialité — Lexavo',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen ed-legal-page">
      <LandingNav />
      <div className="max-w-3xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.15em', color: '#6E6860', textDecoration: 'none', display: 'inline-block', marginBottom: '2.5rem' }} className="hover:text-black transition-colors">← ACCUEIL</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : mai 2026</p>

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
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.5 Sous-traitants et transferts hors Union européenne</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Pour fournir le service, Lexavo s&apos;appuie sur les sous-traitants techniques listés ci-dessous. Chacun est lié par un Data Processing Agreement (DPA) et, pour les transferts hors Union européenne, par les Clauses Contractuelles Types (CCT) approuvées par la Commission européenne (décision 2021/914 du 4 juin 2021).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50 text-gray-900">
                <tr>
                  <th className="px-3 py-2 font-semibold">Sous-traitant</th>
                  <th className="px-3 py-2 font-semibold">Finalité</th>
                  <th className="px-3 py-2 font-semibold">Données traitées</th>
                  <th className="px-3 py-2 font-semibold">Localisation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 align-top font-medium">Anthropic (Claude)</td>
                  <td className="px-3 py-2 align-top">Génération de texte par IA</td>
                  <td className="px-3 py-2 align-top">Sujet ou article saisi par l&apos;avocat, paramètres de génération</td>
                  <td className="px-3 py-2 align-top">États-Unis</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 align-top font-medium">OpenAI (gpt-image-1)</td>
                  <td className="px-3 py-2 align-top">Génération d&apos;image éditoriale</td>
                  <td className="px-3 py-2 align-top">Prompt visuel en anglais construit à partir du sujet</td>
                  <td className="px-3 py-2 align-top">États-Unis</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 align-top font-medium">Supabase</td>
                  <td className="px-3 py-2 align-top">Base de données, authentification, stockage des images générées</td>
                  <td className="px-3 py-2 align-top">Compte utilisateur, contenus générés, images</td>
                  <td className="px-3 py-2 align-top">Union européenne</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 align-top font-medium">Stripe</td>
                  <td className="px-3 py-2 align-top">Paiement et gestion d&apos;abonnement</td>
                  <td className="px-3 py-2 align-top">Email, plan, identifiant d&apos;abonnement (aucune donnée bancaire transmise à Lexavo)</td>
                  <td className="px-3 py-2 align-top">Irlande (UE) avec transferts éventuels aux États-Unis</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 align-top font-medium">Resend</td>
                  <td className="px-3 py-2 align-top">E-mails transactionnels (bienvenue, quota, notifications)</td>
                  <td className="px-3 py-2 align-top">Adresse email du destinataire, contenu du message</td>
                  <td className="px-3 py-2 align-top">États-Unis</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 align-top font-medium">Vercel</td>
                  <td className="px-3 py-2 align-top">Hébergement du site et exécution des fonctions serveur</td>
                  <td className="px-3 py-2 align-top">Logs techniques, adresse IP</td>
                  <td className="px-3 py-2 align-top">États-Unis (réseau de diffusion mondial)</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-gray-700 leading-relaxed mt-4">
            La présente politique tient lieu de liste publique des sous-traitants. Toute modification matérielle (ajout ou retrait d&apos;un sous-traitant) sera notifiée aux utilisateurs par e-mail avec un préavis raisonnable.
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

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.9 Recours à l&apos;intelligence artificielle</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Lexavo s&apos;appuie sur deux fournisseurs d&apos;intelligence artificielle pour produire le contenu pédagogique demandé :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2 mb-4">
            <li><strong>Anthropic</strong> (modèle Claude) pour la génération de texte</li>
            <li><strong>OpenAI</strong> (modèle gpt-image-1) pour la génération d&apos;image éditoriale</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-3">
            Ces fournisseurs sont liés à Lexavo par leurs conditions API et leurs Data Processing Agreements respectifs. Lexavo retient les engagements suivants :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2 mb-4">
            <li>
              <strong>Absence d&apos;entraînement sur les données API.</strong> Conformément aux conditions commerciales API d&apos;Anthropic et à la politique OpenAI applicable aux clients API depuis le 1<sup>er</sup> mars 2023, les contenus transmis via les API ne sont pas utilisés pour entraîner ou améliorer les modèles.
            </li>
            <li>
              <strong>Confidentialité contractuelle.</strong> Les fournisseurs sont liés par leur DPA, adossé aux Clauses Contractuelles Types évoquées en 3.5 pour les transferts hors Union européenne.
            </li>
            <li>
              <strong>Rétention limitée.</strong> Les requêtes envoyées aux API peuvent être conservées par les fournisseurs pour une durée limitée à des fins de prévention des abus (typiquement 30 jours côté OpenAI), sans réutilisation commerciale.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed mb-3">
            <strong>Limites et responsabilités.</strong> Les serveurs principaux d&apos;Anthropic et d&apos;OpenAI sont situés aux États-Unis. Lexavo est conçu pour traiter des sujets pédagogiques génériques. L&apos;avocat est invité à n&apos;y saisir aucune information client identifiable (cf. clause 2.8 des CGV et garde-fou automatique de détection de motifs sensibles intégré au produit). En cas de modification matérielle des politiques d&apos;Anthropic ou d&apos;OpenAI affectant la conformité du service, Lexavo s&apos;engage à en informer ses utilisateurs sans délai.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Politiques à jour des fournisseurs :{' '}
            <a href="https://www.anthropic.com/legal" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">Anthropic</a>{' '}·{' '}
            <a href="https://openai.com/policies" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">OpenAI</a>
          </p>
        </section>
      </div>
      <LandingFooter />
    </div>
  )
}

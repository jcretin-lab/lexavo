import Link from 'next/link'
import { LandingNav } from '@/components/landing/landing-nav'
import { LandingFooter } from '@/components/landing/landing-footer'

export const metadata = {
  title: 'Politique de confidentialité — Lexavo',
}

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen ed-legal-page">
      <LandingNav solide />
      <div className="max-w-3xl mx-auto px-6" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>
        <Link href="/" style={{ fontFamily: 'var(--font-jetbrains-mono)', fontSize: '10px', letterSpacing: '0.15em', color: '#6E6860', textDecoration: 'none', display: 'inline-block', marginBottom: '2.5rem' }} className="hover:text-black transition-colors">← ACCUEIL</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politique de confidentialité</h1>
        <p className="text-sm text-gray-500 mb-10">Dernière mise à jour : novembre 2026</p>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.1 Responsable du traitement</h2>
          <p className="text-gray-700 leading-relaxed">
            PRETET Julien — LEXAVO<br />
            8 rue de Villarceaux, 78770 THOIRY<br />
            <a href="mailto:contact@lexavo.fr" className="text-blue-600 hover:underline">contact@lexavo.fr</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.2 Données collectées</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Lorsque vous demandez un devis ou devenez client, les données suivantes sont collectées :
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
            <li><strong>Données d&apos;identification :</strong> nom et prénom, nom du cabinet, adresse du site actuel</li>
            <li><strong>Données de contact :</strong> adresse e-mail, et le cas échéant téléphone et adresse postale</li>
            <li><strong>Données relatives au projet :</strong> le contenu de votre demande et nos échanges</li>
            <li><strong>Données de facturation :</strong> devis, factures et règlements</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-3">
            Merci de ne transmettre dans le formulaire aucune information couverte par le secret professionnel.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.3 Finalités du traitement</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Les données collectées sont utilisées pour :</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>Répondre à votre demande et établir un devis</li>
            <li>Réaliser, livrer et maintenir votre site</li>
            <li>Gérer la facturation et la relation client</li>
            <li>Respecter les obligations légales</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.4 Base légale</h2>
          <p className="text-gray-700 leading-relaxed mb-3">Le traitement des données repose sur :</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>Les mesures précontractuelles prises à votre demande (devis) et l&apos;exécution du contrat</li>
            <li>L&apos;obligation légale (facturation, comptabilité)</li>
            <li>Le consentement, pour la veille décrite en 3.10</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.5 Sous-traitants et transferts hors Union européenne</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Lexavo s&apos;appuie sur les sous-traitants techniques listés ci-dessous. Chacun est lié par un Data Processing Agreement (DPA) et, pour les transferts hors Union européenne, par les Clauses Contractuelles Types (CCT) approuvées par la Commission européenne (décision 2021/914 du 4 juin 2021).
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
                  <td className="px-3 py-2 align-top font-medium">Resend</td>
                  <td className="px-3 py-2 align-top">Acheminement des demandes de devis et des e-mails de la veille</td>
                  <td className="px-3 py-2 align-top">Adresse e-mail, contenu du message</td>
                  <td className="px-3 py-2 align-top">États-Unis</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 align-top font-medium">Supabase</td>
                  <td className="px-3 py-2 align-top">Hébergement de la liste d&apos;abonnés à la veille</td>
                  <td className="px-3 py-2 align-top">Données décrites en 3.10</td>
                  <td className="px-3 py-2 align-top">Union européenne</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 align-top font-medium">Vercel</td>
                  <td className="px-3 py-2 align-top">Hébergement du site et exécution des fonctions serveur</td>
                  <td className="px-3 py-2 align-top">Logs techniques, adresse IP, mesure d&apos;audience sans cookie</td>
                  <td className="px-3 py-2 align-top">États-Unis (réseau de diffusion mondial)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.6 Durée de conservation</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2">
            <li>Demandes de devis sans suite : 3 ans à compter du dernier échange</li>
            <li>Données clients : durée de la relation contractuelle + 5 ans</li>
            <li>Factures : 10 ans (obligation légale)</li>
            <li>Logs techniques : 1 an</li>
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
            Le site lexavo.fr ne dépose aucun cookie publicitaire ni de suivi. La mesure d&apos;audience (Vercel Web Analytics) fonctionne sans cookie et sans identifier les visiteurs.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.9 Sites réalisés pour nos clients</h2>
          <p className="text-gray-700 leading-relaxed">
            Pour les sites que nous réalisons, le cabinet client est responsable du traitement des données de ses propres visiteurs. Lorsque Lexavo en assure l&apos;hébergement ou la maintenance, il agit en qualité de sous-traitant au sens de l&apos;article 28 du RGPD.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">3.10 Newsletter « Veille Lexavo »</h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            La veille Lexavo est une lettre d&apos;information juridique envoyée tous les quinze jours : arrêts récents de la Cour de cassation qui citent des textes
            relatifs aux baux d&apos;habitation et à la copropriété, et modifications de ces textes lorsqu&apos;il y en a. On s&apos;y inscrit sur{' '}
            <a href="https://veille.lexavo.fr" className="text-blue-600 hover:underline">veille.lexavo.fr</a>. Cette section complète les
            précédentes pour ce seul traitement.
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2 mb-4">
            <li>
              <strong>Données traitées :</strong> votre adresse e-mail (obligatoire) ; votre nom et votre profession (facultatifs) ; le texte du
              consentement que vous avez accepté, et les dates de votre demande, de votre confirmation et, le cas échéant, de votre désinscription.
            </li>
            <li>
              <strong>Finalité :</strong> vous envoyer la veille et vous répondre. Votre adresse n&apos;est ni cédée, ni utilisée à une autre fin.
            </li>
            <li>
              <strong>Base légale :</strong> votre consentement, donné en cochant une case puis confirmé par un e-mail (double confirmation) :
              sans clic sur le lien de confirmation, vous n&apos;êtes pas inscrit. Vous pouvez le retirer à tout moment, en un clic depuis
              chaque message, ou en écrivant à{' '}
              <a href="mailto:contact@lexavo.fr" className="text-blue-600 hover:underline">contact@lexavo.fr</a>. Le retrait ne remet pas en
              cause les envois déjà effectués.
            </li>
            <li>
              <strong>Sous-traitants :</strong> Supabase (hébergement de la liste d&apos;abonnés), Resend (envoi des e-mails) et Vercel
              (hébergement du site), dans les conditions décrites en 3.5.
            </li>
            <li>
              <strong>Conservation :</strong> votre adresse est conservée tant que vous restez inscrit. Une demande non confirmée est supprimée
              au bout de 30 jours. Après votre désinscription, seuls votre adresse et la date de désinscription sont conservées pendant 3 ans,
              pour respecter votre choix, puis supprimées.
            </li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            Vos droits (accès, rectification, effacement, opposition, limitation, portabilité) et le recours auprès de la CNIL sont décrits en 3.7.
          </p>
        </section>
      </div>
      <LandingFooter />
    </div>
  )
}

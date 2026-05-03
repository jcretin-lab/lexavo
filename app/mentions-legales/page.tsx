import Link from 'next/link'

export const metadata = {
  title: 'Mentions légales — Lexavo',
}

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-blue-600 hover:underline mb-8 inline-block">← Retour à l&apos;accueil</Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-10">Mentions légales</h1>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Éditeur du site</h2>
          <p className="text-gray-700 leading-relaxed">
            Le site <strong>lexavo.fr</strong> est édité par :<br />
            <strong>Nom :</strong> PRETET Julien<br />
            <strong>Nom commercial :</strong> LEXAVO<br />
            <strong>Adresse :</strong> 2 route de la Magnanerie, 78460 CHOISEL<br />
            <strong>Email :</strong> contact@lexavo.fr<br />
            <strong>SIRET :</strong> 94997889400028<br />
            <strong>Statut :</strong> Entrepreneur individuel
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Hébergement</h2>
          <p className="text-gray-700 leading-relaxed">
            Le site est hébergé par :<br />
            <strong>Vercel Inc.</strong><br />
            340 Pine Street, Suite 1302, San Francisco, CA 94104, USA<br />
            <a href="https://vercel.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">https://vercel.com</a>
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Propriété intellectuelle</h2>
          <p className="text-gray-700 leading-relaxed">
            L&apos;ensemble des contenus présents sur le site lexavo.fr (textes, images, logo, interface) est la propriété exclusive de LEXAVO et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Toute reproduction, représentation, modification ou exploitation non autorisée de tout ou partie du site est strictement interdite.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Responsabilité</h2>
          <p className="text-gray-700 leading-relaxed">
            LEXAVO s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des informations diffusées sur le site. Cependant, LEXAVO ne peut garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition.
          </p>
          <p className="text-gray-700 leading-relaxed mt-3">
            Les contenus générés par l&apos;intelligence artificielle sont fournis à titre indicatif. L&apos;utilisateur demeure seul responsable de leur relecture, validation et publication.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Droit applicable</h2>
          <p className="text-gray-700 leading-relaxed">
            Le présent site et ses conditions d&apos;utilisation sont soumis au droit français. Tout litige sera soumis aux tribunaux compétents du ressort de Versailles.
          </p>
        </section>
      </div>
    </div>
  )
}

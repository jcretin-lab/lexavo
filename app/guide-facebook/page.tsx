import type { Metadata } from 'next'
import { GuideWizard } from '@/components/guide/guide-wizard'

export const metadata: Metadata = {
  title: 'Connecter Facebook à Lexavo en 5 minutes — Guide',
  description: 'Tutoriel pas à pas pour connecter votre page Facebook à Lexavo via Make.com.',
}

const steps = [
  {
    titre: 'Activez la publication automatique sur Facebook',
    sousTitre: 'Une configuration unique de 5 minutes. Tout est automatique ensuite.',
    contenu: (
      <div className="space-y-5">
        <div className="space-y-2">
          <p>Ouvrez ce lien de partage ci-dessous.</p>
          <p>Vous serez dirigé vers Make.com, une plateforme d&apos;automatisation.</p>
          <p>Inscrivez-vous gratuitement.</p>
          <p>Le scénario Lexavo apparaît automatiquement dans votre compte.</p>
        </div>
        <a
          href="https://eu1.make.com/public/shared-scenario/66afy5T4f0g/facebook"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: '#1877F2', color: '#fff' }}
        >
          Ouvrir le scénario Lexavo →
        </a>
      </div>
    ),
  },
  {
    titre: 'Connectez votre Facebook',
    contenu: (
      <div className="space-y-3">
        {[
          'Cliquez sur le module Facebook dans votre scénario',
          'Cliquez « Create a connection »',
          'Choisissez votre profil Facebook ou votre page cabinet',
          'Cliquez « Save »',
          'Cliquez sur le premier module rouge (Webhooks) en haut à gauche',
          'Dans la barre qui apparaît, sélectionnez « My gateway... »',
          'Une URL apparaît en dessous → Copiez-la → Sauvegardez et fermez',
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: 'var(--navy-700)', color: 'var(--white)', fontFamily: 'var(--font-jetbrains-mono)' }}>
              {i + 1}
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    titre: 'Activez et collez votre lien',
    contenu: (
      <div className="space-y-4">
        <div className="space-y-3">
          {[
            'En bas de votre scénario Make.com, activez « Immediately as data arrives »',
            'Cliquez sur la disquette à côté pour sauvegarder',
            'Fermez la fenêtre',
            'Revenez sur lexavo.fr → Dashboard → Réseaux',
            'Collez l\'URL copiée dans le champ prévu sous ce guide',
            'Cliquez « Enregistrer »',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5" style={{ background: 'var(--navy-700)', color: 'var(--white)', fontFamily: 'var(--font-jetbrains-mono)' }}>
                {i + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-4 text-center" style={{ background: 'var(--success-50)', border: '1px solid #cfe6da' }}>
          <p className="font-semibold" style={{ color: 'var(--success)' }}>
            🎉 L&apos;automatisation est réglée une bonne fois pour toutes !
          </p>
        </div>
      </div>
    ),
  },
]

export default function GuideFacebookPage() {
  return (
    <GuideWizard
      reseau="facebook"
      steps={steps}
    />
  )
}

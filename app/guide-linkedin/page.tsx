import type { Metadata } from 'next'
import { GuideWizard } from '@/components/guide/guide-wizard'

export const metadata: Metadata = {
  title: 'Connecter LinkedIn à Lexavo en 5 minutes — Guide',
  description: 'Tutoriel pas à pas pour connecter votre profil LinkedIn à Lexavo via Make.com.',
}

const steps = [
  {
    titre: 'Activez la publication automatique sur LinkedIn',
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
          href="https://eu1.make.com/public/shared-scenario/jCmAcfuEorC/linkedin"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: '#0A66C2', color: '#fff' }}
        >
          Ouvrir le scénario Lexavo<br />et passer à l&apos;étape suivante →
        </a>
      </div>
    ),
  },
  {
    titre: 'Connectez votre LinkedIn',
    contenu: (
      <div className="space-y-4">
        <div className="space-y-2">
          <img
            src="/guide-linkedin-step2.jpg"
            alt="Connectez votre LinkedIn — étape 2"
            style={{ width: '100%', height: 'auto', maxWidth: '900px', display: 'block', margin: '0 auto', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
          />
          <a
            href="/guide-linkedin-step2.jpg"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-400)', textDecoration: 'none' }}
          >
            Voir en taille réelle →
          </a>
        </div>
        <div className="rounded-xl p-4" style={{ background: 'var(--warning-50)', border: '1px solid #efd6a8' }}>
          <p className="text-sm" style={{ color: 'var(--ink-700)' }}>
            ⚠️ Votre connexion LinkedIn dure 60 jours. Lexavo vous enverra un email de rappel avant expiration.
          </p>
        </div>
      </div>
    ),
  },
  {
    titre: 'Activez et collez votre lien',
    contenu: (
      <div className="space-y-2">
        <img
          src="/guide-linkedin-step3.jpg"
          alt="Activez et collez votre lien — étape 3"
          style={{ width: '100%', height: 'auto', maxWidth: '900px', display: 'block', margin: '0 auto', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
        />
        <a
          href="/guide-linkedin-step3.jpg"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'block', textAlign: 'center', fontSize: '0.75rem', color: 'var(--ink-400)', textDecoration: 'none' }}
        >
          Voir en taille réelle →
        </a>
      </div>
    ),
  },
]

export default function GuideLinkedinPage() {
  return (
    <GuideWizard
      reseau="linkedin"
      steps={steps}
    />
  )
}

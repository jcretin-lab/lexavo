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
      <div className="space-y-16">
        <video
          src="/guide-linkedin-intro.mp4"
          controls
          preload="metadata"
          playsInline
          style={{ width: '100%', height: 'auto', maxWidth: '900px', display: 'block', margin: '0 auto', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
        />
        <a
          href="https://eu1.make.com/public/shared-scenario/jCmAcfuEorC/linkedin"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: '#0A66C2', color: '#fff' }}
        >
          Ouvrir le scénario Lexavo LinkedIn →
        </a>
        <div className="rounded-xl p-4" style={{ background: 'var(--warning-50)', border: '1px solid #efd6a8' }}>
          <p className="text-sm" style={{ color: 'var(--ink-700)' }}>
            ⚠️ Votre connexion LinkedIn doit être renouvelée tous les 60 jours selon les règles de ce dernier.
          </p>
        </div>
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

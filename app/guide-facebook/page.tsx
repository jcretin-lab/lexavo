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
      <div className="space-y-16">
        <video
          src="/guide-facebook-intro.mp4"
          controls
          preload="metadata"
          playsInline
          style={{ width: '100%', height: 'auto', maxWidth: '900px', display: 'block', marginInline: 'auto', borderRadius: '8px', boxShadow: '0 2px 16px rgba(0,0,0,0.10)' }}
        />
        <a
          href="https://eu1.make.com/public/shared-scenario/66afy5T4f0g/facebook"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: '#1877F2', color: '#fff' }}
        >
          Ouvrir le scénario Lexavo Facebook →
        </a>
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

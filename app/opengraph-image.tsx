// Image de partage (LinkedIn, messageries, X) : reprend le hero, « Le site de votre cabinet, » avec la correction « avec » → « sans abonnement ».
// Polices du site en TTF (OFL) dans assets/fonts, lues au build.

import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { FORFAITS } from '@/lib/offre'

export const alt = 'Lexavo : le site de votre cabinet d’avocat, sans abonnement'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const ROBE = '#14213D'
const PAPIER = '#F2EFEA'
const LAITON = '#A8824A'
const GRIS = '#5C6270'

export default async function Image() {
  const [bodoni, hanken] = await Promise.all([
    readFile(join(process.cwd(), 'assets/fonts/BodoniModa-Regular.ttf')),
    readFile(join(process.cwd(), 'assets/fonts/HankenGrotesk-Medium.ttf')),
  ])

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: PAPIER, padding: 36 }}>
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            border: `2px solid ${ROBE}`,
            padding: '52px 72px',
            color: ROBE,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontFamily: 'Bodoni', fontSize: 84, lineHeight: 1.05, letterSpacing: -1.5, whiteSpace: 'nowrap' }}>Le site de votre cabinet,</div>
            <div style={{ display: 'flex', fontFamily: 'Bodoni', fontSize: 44, color: '#8A8F99', textDecoration: 'line-through', marginTop: 22, whiteSpace: 'nowrap' }}>avec abonnement</div>
            <div style={{ display: 'flex', fontFamily: 'Bodoni', fontSize: 84, lineHeight: 1.05, letterSpacing: -1.5, whiteSpace: 'nowrap' }}>sans abonnement.</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: 'Bodoni', fontSize: 56 }}>
              Lexavo<span style={{ color: LAITON }}>.</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontFamily: 'Hanken', fontSize: 26, color: GRIS }}>
              <div style={{ width: 72, height: 2, background: LAITON, marginBottom: 18 }} />
              <span>Création de sites pour avocats</span>
              <span style={{ color: ROBE }}>{`Module d’édition inclus, dès ${FORFAITS[0].prix}`}</span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Bodoni', data: bodoni, style: 'normal', weight: 400 },
        { name: 'Hanken', data: hanken, style: 'normal', weight: 500 },
      ],
    },
  )
}

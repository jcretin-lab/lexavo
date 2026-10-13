// Tests du calendrier des numéros : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { phraseProchainNumero, prochainNumero } from './calendrier.ts'

test('avant le premier passage : numéro du lundi 2 novembre 2026, puis celui du 16 novembre', () => {
  const n = prochainNumero(new Date('2026-10-13T12:00:00Z'))
  assert.deepEqual(n, { limite: 'dimanche 1er novembre', envoi: 'lundi 2 novembre 2026', suivant: 'lundi 16 novembre 2026' })
})

test('le dimanche 1er novembre 2026 : jusqu\'à 20 h (heure d\'hiver, 19 h UTC) on est dans le numéro du 2, après dans celui du 16', () => {
  assert.equal(prochainNumero(new Date('2026-11-01T18:59:00Z')).envoi, 'lundi 2 novembre 2026')
  assert.equal(prochainNumero(new Date('2026-11-01T19:00:00Z')).envoi, 'lundi 2 novembre 2026')   // 20 h pile : encore dans ce numéro
  const apres = prochainNumero(new Date('2026-11-01T19:01:00Z'))
  assert.deepEqual(apres, { limite: 'dimanche 15 novembre', envoi: 'lundi 16 novembre 2026', suivant: 'lundi 30 novembre 2026' })
})

test('le rythme de quinze jours suit l\'heure locale au changement d\'heure (printemps 2027 : 20 h = 18 h UTC)', () => {
  // le 4 avril 2027 est un passage (1er novembre 2026 + 154 jours) ; l'heure d'été a commencé le 28 mars 2027
  assert.equal(prochainNumero(new Date('2027-04-04T17:59:00Z')).envoi, 'lundi 5 avril 2027')       // 19 h 59 à Paris
  const apres = prochainNumero(new Date('2027-04-04T18:01:00Z'))                                   // 20 h 01 à Paris
  assert.deepEqual(apres, { limite: 'dimanche 18 avril', envoi: 'lundi 19 avril 2027', suivant: 'lundi 3 mai 2027' })
})

test('toujours un dimanche de passage et un lundi d\'envoi, sur deux ans', () => {
  for (let jour = 0; jour < 730; jour += 3) {
    const n = prochainNumero(new Date(Date.UTC(2026, 9, 13 + jour, 9, 0)))
    assert.match(n.limite, /^dimanche /)
    assert.match(n.envoi, /^lundi /)
    assert.match(n.suivant, /^lundi /)
  }
})

test('la phrase de l\'e-mail de confirmation', () => {
  assert.equal(
    phraseProchainNumero(new Date('2026-10-20T08:00:00Z')),
    'Votre premier numéro vous parviendra le lundi 2 novembre 2026 au matin si vous confirmez avant le dimanche 1er novembre à 20 h ; '
    + 'plus tard, ce sera le lundi 16 novembre 2026. Ensuite, vous en recevrez un tous les quinze jours.',
  )
})

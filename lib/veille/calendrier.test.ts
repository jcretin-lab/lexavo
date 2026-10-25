// Tests du calendrier des numéros : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { phraseProchainNumero, prochainNumero } from './calendrier.ts'

test('avant le premier passage : le numéro du lundi 2 novembre 2026', () => {
  assert.deepEqual(prochainNumero(new Date('2026-10-13T12:00:00Z')), { envoi: 'lundi 2 novembre 2026' })
  assert.deepEqual(prochainNumero(new Date('2026-10-26T09:00:00Z')), { envoi: 'lundi 2 novembre 2026' })
})

test('le dimanche 1er novembre 2026 : jusqu\'au passage (12 h, heure d\'hiver, 11 h UTC) c\'est le numéro du 2, ensuite celui du 16', () => {
  assert.equal(prochainNumero(new Date('2026-11-01T10:59:00Z')).envoi, 'lundi 2 novembre 2026')
  assert.equal(prochainNumero(new Date('2026-11-01T11:00:00Z')).envoi, 'lundi 2 novembre 2026')   // 12 h pile : encore dans ce numéro
  assert.equal(prochainNumero(new Date('2026-11-01T11:01:00Z')).envoi, 'lundi 16 novembre 2026')
  assert.equal(prochainNumero(new Date('2026-11-01T20:00:00Z')).envoi, 'lundi 16 novembre 2026')
})

test('le rythme de quinze jours suit l\'heure locale au changement d\'heure (printemps 2027 : 12 h = 10 h UTC)', () => {
  // le 4 avril 2027 est un passage (1er novembre 2026 + 154 jours) ; l'heure d'été a commencé le 28 mars 2027
  assert.equal(prochainNumero(new Date('2027-04-04T09:59:00Z')).envoi, 'lundi 5 avril 2027')       // 11 h 59 à Paris
  assert.equal(prochainNumero(new Date('2027-04-04T10:01:00Z')).envoi, 'lundi 19 avril 2027')      // 12 h 01 à Paris
})

test('toujours un lundi, sur deux ans', () => {
  for (let jour = 0; jour < 730; jour += 3) {
    assert.match(prochainNumero(new Date(Date.UTC(2026, 9, 13 + jour, 9, 0))).envoi, /^lundi /)
  }
})

test('la phrase de l\'e-mail de confirmation : le jour de réception seulement, ni jour ni heure de préparation', () => {
  const phrase = phraseProchainNumero(new Date('2026-10-20T08:00:00Z'))
  assert.equal(phrase, 'Votre premier numéro vous parviendra le lundi 2 novembre 2026 au matin. Ensuite, vous en recevrez un tous les quinze jours.')
  assert.ok(!/dimanche|\d+ h\b|confirmez|préparation/.test(phrase), phrase)
  assert.match(phraseProchainNumero(new Date('2026-11-01T15:00:00Z')), /lundi 16 novembre 2026/)
})

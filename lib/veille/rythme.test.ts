// Tests de la phrase sur le rythme des numéros : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { PHRASE_CONFIRMATION, PHRASE_PREMIER_NUMERO, PHRASE_RYTHME } from './rythme.ts'

test('la phrase de confirmation annonce un délai, jamais un jour précis', () => {
  assert.equal(PHRASE_CONFIRMATION, 'Votre premier numéro vous parviendra dans les quinze prochains jours. Ensuite, vous en recevrez un tous les quinze jours.')
  assert.ok(PHRASE_CONFIRMATION.startsWith(PHRASE_PREMIER_NUMERO))
  assert.ok(PHRASE_CONFIRMATION.endsWith(PHRASE_RYTHME))
  assert.ok(!/\d|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|préparation|confirmez/i.test(PHRASE_CONFIRMATION), PHRASE_CONFIRMATION)
})

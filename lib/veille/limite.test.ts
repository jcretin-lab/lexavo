import assert from 'node:assert/strict'
import { test } from 'node:test'
import { creerLimiteur } from './limite.ts'

test('limiteur : autorise jusqu\'au maximum puis refuse, par clé', () => {
  const autoriser = creerLimiteur(3, 1000, () => 0)
  assert.deepEqual([1, 2, 3, 4].map(() => autoriser('ip-a')), [true, true, true, false])
  assert.equal(autoriser('ip-b'), true)                       // une autre adresse n'est pas affectée
})

test('limiteur : la fenêtre se renouvelle', () => {
  let t = 0
  const autoriser = creerLimiteur(1, 1000, () => t)
  assert.equal(autoriser('ip'), true)
  assert.equal(autoriser('ip'), false)
  t = 1001
  assert.equal(autoriser('ip'), true)
})

test('limiteur : le ménage ne supprime que les fenêtres terminées', () => {
  let t = 0
  const autoriser = creerLimiteur(1, 1000, () => t)
  for (let i = 0; i < 5001; i++) autoriser(`ip-${i}`)
  t = 2000
  assert.equal(autoriser('ip-0'), true)                        // fenêtre échue : repart de zéro
  assert.equal(autoriser('ip-0'), false)                       // et la nouvelle fenêtre est bien comptée
})

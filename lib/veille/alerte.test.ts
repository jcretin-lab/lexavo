// Tests de l'alerte « nouvel abonné » : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { echapper, htmlAlerte, quandEnClair, sujetAlerte } from './alerte.ts'

const base = {
  email: 'a@exemple.fr',
  nom: 'Alice Martin',
  profil: 'avocat',
  veilles: [{ nom: "Baux d'habitation et copropriété", effectif: 3 }],
  confirmeLe: '2026-10-13T19:05:00.000Z',
  premierNumero: 'lundi 2 novembre 2026',
}

test('l\'objet ne contient jamais l\'adresse : le nom de la veille, ou le nombre de veilles', () => {
  assert.equal(sujetAlerte(base.veilles), "Nouvel abonné · Baux d'habitation et copropriété")
  assert.equal(sujetAlerte([{ nom: 'A' }, { nom: 'B' }, { nom: 'C' }]), 'Nouvel abonné · 3 veilles')
})

test('le message donne l\'adresse, le nom, le profil, la veille et son effectif, la date et le premier numéro', () => {
  const html = htmlAlerte(base)
  for (const attendu of ['a@exemple.fr', 'Alice Martin', 'avocat', 'Baux d&#39;habitation et copropriété', '3 abonnés confirmés', '13 octobre 2026', 'lundi 2 novembre 2026']) {
    assert.ok(html.includes(attendu), `devrait contenir « ${attendu} »`)
  }
})

test('la date est donnée à l\'heure de Paris (21 h 05 l\'été, 19 h 05 UTC)', () => {
  assert.match(quandEnClair('2026-10-13T19:05:00.000Z'), /13 octobre 2026.*21[:h]05/)
  assert.match(quandEnClair('2026-11-02T19:05:00.000Z'), /2 novembre 2026.*20[:h]05/)            // heure d'hiver : 20 h 05
})

test('premier abonné d\'une veille, plusieurs veilles, nom absent', () => {
  const html = htmlAlerte({ ...base, nom: null, veilles: [{ nom: 'A', effectif: 1 }, { nom: 'B', effectif: 12 }] })
  assert.ok(html.includes('premier abonné confirmé'))
  assert.ok(html.includes('12 abonnés confirmés'))
  assert.ok(html.includes('Veilles'))
  assert.ok(html.includes('—'))
})

test('ce que la personne a saisi n\'est jamais interprété comme du HTML', () => {
  const html = htmlAlerte({ ...base, nom: '<img src=x onerror=alert(1)>', email: 'x"><script>@exemple.fr' })
  assert.ok(!html.includes('<img'))
  assert.ok(!html.includes('<script'))
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'))
  assert.equal(echapper(`<a href="x">&'</a>`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;')
})

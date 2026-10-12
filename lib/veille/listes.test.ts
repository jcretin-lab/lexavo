// Tests du registre des veilles (listes d'abonnés) : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONSENTEMENT, LISTES, LISTE_PAR_DEFAUT, listeOuverte, trouverListe } from './listes.ts'

test('les cinq veilles sont déclarées, avec des slugs valides et uniques', () => {
  assert.equal(LISTES.length, 5)
  const slugs = LISTES.map((l) => l.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)         // le même format que la contrainte SQL de la colonne liste
  assert.equal(LISTES[0].slug, LISTE_PAR_DEFAUT)
})

test('les cinq veilles présentées sont ouvertes aux inscriptions (décision du 12 octobre 2026)', () => {
  assert.deepEqual(LISTES.filter((l) => l.ouverte).map((l) => l.slug), LISTES.map((l) => l.slug))
  for (const l of LISTES) assert.equal(listeOuverte(l.slug)?.slug, l.slug)
})

test("listeOuverte : absente ou vide = veille d'origine ; inconnue, supprimée ou de mauvais type = refusée", () => {
  for (const defaut of [undefined, null, '']) assert.equal(listeOuverte(defaut)?.slug, 'baux-copropriete')
  assert.equal(listeOuverte('baux-copropriete')?.slug, 'baux-copropriete')
  // les deux anciennes veilles regroupées le 11 octobre 2026 n'existent plus
  for (const refusee of ['baux-commerciaux-fonds', 'construction-urbanisme', 'societes-cessions', 'inconnue', 'BAUX-COPROPRIETE', 42, {}, ['baux-copropriete']]) {
    assert.equal(listeOuverte(refusee), null, `devrait refuser : ${JSON.stringify(refusee)}`)
  }
})

test("trouverListe : connaît toutes les veilles, ouvertes ou non (l'export en a besoin)", () => {
  assert.equal(trouverListe('contrats-cour-de-cassation')?.nom, 'Contrats, Cour de cassation')
  assert.equal(trouverListe('x'), null)
  assert.equal(trouverListe(undefined), null)
})

test("consentement du formulaire unique à choix multiple : version 2026-10-v4, texte exact (la page de veille.lexavo.fr doit l'afficher à l'identique)", () => {
  assert.equal(CONSENTEMENT.version, '2026-10-v4')
  assert.equal(
    CONSENTEMENT.texte,
    "J'accepte de recevoir par e-mail, tous les quinze jours, la ou les veilles Lexavo cochées ci-dessus. Mon adresse sert uniquement à ces envois, et je peux me désinscrire à tout moment, en un clic.",
  )
})

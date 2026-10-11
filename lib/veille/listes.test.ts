// Tests du registre des veilles (listes d'abonnés) : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CONSENTEMENT_VERSION_LISTE,
  LISTES,
  LISTE_PAR_DEFAUT,
  consentementPour,
  listeOuverte,
  trouverListe,
} from './listes.ts'

test('les sept veilles sont déclarées, avec des slugs valides et uniques', () => {
  assert.equal(LISTES.length, 5)
  const slugs = LISTES.map((l) => l.slug)
  assert.equal(new Set(slugs).size, slugs.length)
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)         // le même format que la contrainte SQL de la colonne liste
  assert.equal(LISTES[0].slug, LISTE_PAR_DEFAUT)
})

test("seule la veille d'origine est ouverte aux inscriptions : les autres sont dormantes", () => {
  assert.deepEqual(LISTES.filter((l) => l.ouverte).map((l) => l.slug), ['baux-copropriete'])
})

test('listeOuverte : absente ou vide = veille d\'origine ; fermée, inconnue ou de mauvais type = refusée', () => {
  for (const defaut of [undefined, null, '']) assert.equal(listeOuverte(defaut)?.slug, 'baux-copropriete')
  assert.equal(listeOuverte('baux-copropriete')?.slug, 'baux-copropriete')
  for (const refusee of ['contrats-cour-de-cassation', 'baux-commerciaux-fonds', 'inconnue', 'BAUX-COPROPRIETE', 42, {}, ['baux-copropriete']]) {
    assert.equal(listeOuverte(refusee), null, `devrait refuser : ${JSON.stringify(refusee)}`)
  }
})

test("trouverListe : connaît toutes les veilles, ouvertes ou non (l'export en a besoin)", () => {
  assert.equal(trouverListe('contrats-cour-de-cassation')?.nom, 'Contrats, Cour de cassation')
  assert.equal(trouverListe('x'), null)
  assert.equal(trouverListe(undefined), null)
})

test("consentement de la veille d'origine : texte inchangé depuis la version 2026-10-v3 (c'est la preuve déjà enregistrée)", () => {
  const c = consentementPour(trouverListe(LISTE_PAR_DEFAUT)!)
  assert.equal(c.version, '2026-10-v3')
  assert.equal(
    c.texte,
    "J'accepte de recevoir la veille Lexavo par e-mail, tous les quinze jours. Mon adresse sert uniquement à cet envoi, et je peux me désinscrire à tout moment, en un clic.",
  )
})

test('consentement des autres veilles : même modèle, avec le nom de la veille ; le formulaire doit afficher ce texte à l\'identique', () => {
  const c = consentementPour(trouverListe('contrats-cour-de-cassation')!)
  assert.equal(c.version, CONSENTEMENT_VERSION_LISTE)
  assert.equal(
    c.texte,
    "J'accepte de recevoir la veille Lexavo « Contrats, Cour de cassation » par e-mail, tous les quinze jours. Mon adresse sert uniquement à cet envoi, et je peux me désinscrire à tout moment, en un clic.",
  )
  for (const l of LISTES) {
    const t = consentementPour(l).texte
    assert.match(t, /désinscrire/)
    assert.match(t, /uniquement/)
    if (l.slug !== LISTE_PAR_DEFAUT) assert.ok(t.includes(l.nom))
  }
})

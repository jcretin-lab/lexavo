// Tests de la logique pure de la newsletter : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { CONSENTEMENT } from './listes.ts'
import {
  entetesCors,
  estPiege,
  jetonValide,
  nouveauJeton,
  normaliserEmail,
  origineAutorisee,
  secretValide,
  validerInscription,
} from './validation.ts'

// Résolution de liste simulée : absente ou vide = « liste-a », « liste-b » et « liste-c » ouvertes, tout le reste refusé.
const resoudre = (valeur: unknown) =>
  valeur === undefined || valeur === '' ? { slug: 'liste-a' } : valeur === 'liste-a' || valeur === 'liste-b' || valeur === 'liste-c' ? { slug: valeur } : null

test('normaliserEmail : minuscules, espaces retirés', () => {
  assert.equal(normaliserEmail('  Prenom.Nom@Exemple.FR '), 'prenom.nom@exemple.fr')
  assert.equal(normaliserEmail('a+etiquette@exemple.fr'), 'a+etiquette@exemple.fr')
})

test('normaliserEmail : refuse les adresses invalides', () => {
  for (const mauvais of ['', ' ', 'sans-arobase', 'a@b', 'a@b.', '@exemple.fr', 'a@.fr', 'a@@exemple.fr', 'a b@exemple.fr', 'a@exemple..fr',
    'a@exemple.f', '<script>@exemple.fr', 'a,b@exemple.fr', 'a@exemple.fr,c@exemple.fr', 'a"@exemple.fr', `${'x'.repeat(65)}@exemple.fr`,
    `a@${'x'.repeat(260)}.fr`]) {
    assert.equal(normaliserEmail(mauvais), null, `devrait refuser : ${mauvais.slice(0, 30)}`)
  }
  for (const pasUneChaine of [undefined, null, 42, {}, ['a@exemple.fr']]) assert.equal(normaliserEmail(pasUneChaine), null)
})

test('validerInscription : cas nominal et valeurs par défaut', () => {
  const r = validerInscription({ email: 'A@Exemple.fr', consentement: true }, resoudre)
  assert.deepEqual(r, { ok: true, valeur: { email: 'a@exemple.fr', nom: null, profil: 'autre', listes: ['liste-a'] } })
})

test('validerInscription : nom nettoyé, profil connu conservé, profil inconnu ramené à « autre »', () => {
  const r = validerInscription({ email: 'a@exemple.fr', consentement: true, nom: '  Marie \n  Dupont\u0007 ', profil: 'avocat' }, resoudre)
  assert.deepEqual(r, { ok: true, valeur: { email: 'a@exemple.fr', nom: 'Marie Dupont', profil: 'avocat', listes: ['liste-a'] } })
  const inconnu = validerInscription({ email: 'a@exemple.fr', consentement: true, profil: 'juge' }, resoudre)
  assert.equal(inconnu.ok && inconnu.valeur.profil, 'autre')
  const long = validerInscription({ email: 'a@exemple.fr', consentement: true, nom: 'x'.repeat(500) }, resoudre)
  assert.equal(long.ok && long.valeur.nom?.length, 100)
})

test('validerInscription : le consentement est obligatoire et doit valoir exactement vrai', () => {
  for (const consentement of [undefined, false, 'true', 1, 'oui', null]) {
    const r = validerInscription({ email: 'a@exemple.fr', consentement }, resoudre)
    assert.equal(r.ok, false)
  }
})

test('validerInscription : corps invalide', () => {
  for (const corps of [null, undefined, 'texte', 12, []]) assert.equal(validerInscription(corps, resoudre).ok, false)
})

test('estPiege : champ caché rempli = robot', () => {
  assert.equal(estPiege({ site_web: 'http://spam.example' }), true)
  assert.equal(estPiege({ site_web: '   ' }), false)
  assert.equal(estPiege({ email: 'a@exemple.fr' }), false)
  assert.equal(estPiege(null), false)
})

test('jetons : longueur, forme et unicité', () => {
  const a = nouveauJeton()
  const b = nouveauJeton()
  assert.match(a, /^[a-f0-9]{48}$/)
  assert.notEqual(a, b)
  assert.equal(jetonValide(a), true)
  for (const mauvais of ['', 'abc', 'A'.repeat(48), `${a}0`, a.slice(1), undefined, 12, `${a.slice(0, 47)}g`]) assert.equal(jetonValide(mauvais), false)
})

test('CORS : seul le site de la veille est autorisé', () => {
  assert.equal(origineAutorisee('https://veille.lexavo.fr'), true)
  for (const non of ['https://lexavo.fr', 'https://veille.lexavo.fr.evil.example', 'http://veille.lexavo.fr', 'https://autre.example', '', null]) {
    assert.equal(origineAutorisee(non), false, String(non))
  }
  const ok = entetesCors('https://veille.lexavo.fr')
  assert.equal(ok['Access-Control-Allow-Origin'], 'https://veille.lexavo.fr')
  assert.equal(ok['Access-Control-Allow-Methods'], 'POST, OPTIONS')
  assert.equal(ok['Access-Control-Allow-Credentials'], undefined)              // aucun cookie n'est échangé
  assert.deepEqual(entetesCors('https://autre.example'), { Vary: 'Origin' })
  assert.deepEqual(entetesCors(null), { Vary: 'Origin' })
})

test('secretValide : comparaison stricte, secret absent = refus', () => {
  assert.equal(secretValide('abc', 'abc'), true)
  assert.equal(secretValide('abd', 'abc'), false)
  assert.equal(secretValide('abc', undefined), false)
  assert.equal(secretValide('', 'abc'), false)
  assert.equal(secretValide(null, 'abc'), false)
  assert.equal(secretValide('abc', ''), false)
})

test('consentement : version et texte définis, et le texte parle des veilles cochées, de désinscription et d\'usage unique', () => {
  const { version, texte } = CONSENTEMENT
  assert.match(version, /^\d{4}-\d{2}-v\d+$/)
  assert.match(texte, /cochées/)
  assert.match(texte, /désinscrire/)
  assert.match(texte, /uniquement/)
})

test("validerInscription : l'ancien formulaire (une seule veille, `liste`) reste accepté ; absente = veille d'origine ; fermée, inconnue ou de mauvais type = refusée", () => {
  const defaut = validerInscription({ email: 'a@exemple.fr', consentement: true }, resoudre)
  assert.ok(defaut.ok && defaut.valeur.listes.join() === 'liste-a')
  const autre = validerInscription({ email: 'a@exemple.fr', consentement: true, liste: 'liste-b' }, resoudre)
  assert.ok(autre.ok && autre.valeur.listes.join() === 'liste-b')
  for (const mauvaise of ['liste-fermee', 42, {}, ['liste-b']]) {
    const r = validerInscription({ email: 'a@exemple.fr', consentement: true, liste: mauvaise }, resoudre)
    assert.equal(r.ok, false, `devrait refuser : ${JSON.stringify(mauvaise)}`)
  }
})

test('validerInscription : plusieurs veilles cochées, dans l\'ordre, sans doublon', () => {
  const r = validerInscription({ email: 'a@exemple.fr', consentement: true, listes: ['liste-b', 'liste-a', 'liste-b', 'liste-c'] }, resoudre)
  assert.deepEqual(r, { ok: true, valeur: { email: 'a@exemple.fr', nom: null, profil: 'autre', listes: ['liste-b', 'liste-a', 'liste-c'] } })
})

test('validerInscription : aucune veille cochée, une veille fermée ou inconnue, ou un tableau abusif = refusé en entier', () => {
  const base = { email: 'a@exemple.fr', consentement: true }
  assert.deepEqual(validerInscription({ ...base, listes: [] }, resoudre), { ok: false, erreur: 'Choisissez au moins une veille.' })
  for (const mauvaises of [['liste-a', 'liste-fermee'], ['liste-fermee'], [''], [42], [null], ['liste-a', {}], 'liste-a', 42, {}, null]) {
    const r = validerInscription({ ...base, listes: mauvaises }, resoudre)
    assert.equal(r.ok, false, `devrait refuser : ${JSON.stringify(mauvaises)}`)
  }
  assert.equal(validerInscription({ ...base, listes: Array.from({ length: 11 }, () => 'liste-a') }, resoudre).ok, false)
})

test('validerInscription : le consentement reste obligatoire avec plusieurs veilles', () => {
  assert.equal(validerInscription({ email: 'a@exemple.fr', listes: ['liste-a', 'liste-b'] }, resoudre).ok, false)
  assert.equal(validerInscription({ email: 'a@exemple.fr', consentement: false, listes: ['liste-a'] }, resoudre).ok, false)
})

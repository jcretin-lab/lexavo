// Tests de la logique pure de la newsletter : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  CONSENTEMENT_TEXTE,
  CONSENTEMENT_VERSION,
  entetesCors,
  estPiege,
  jetonValide,
  nouveauJeton,
  normaliserEmail,
  origineAutorisee,
  secretValide,
  validerInscription,
} from './validation.ts'

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
  const r = validerInscription({ email: 'A@Exemple.fr', consentement: true })
  assert.deepEqual(r, { ok: true, valeur: { email: 'a@exemple.fr', nom: null, profil: 'autre' } })
})

test('validerInscription : nom nettoyé, profil connu conservé, profil inconnu ramené à « autre »', () => {
  const r = validerInscription({ email: 'a@exemple.fr', consentement: true, nom: '  Marie \n  Dupont\u0007 ', profil: 'avocat' })
  assert.deepEqual(r, { ok: true, valeur: { email: 'a@exemple.fr', nom: 'Marie Dupont', profil: 'avocat' } })
  const inconnu = validerInscription({ email: 'a@exemple.fr', consentement: true, profil: 'juge' })
  assert.equal(inconnu.ok && inconnu.valeur.profil, 'autre')
  const long = validerInscription({ email: 'a@exemple.fr', consentement: true, nom: 'x'.repeat(500) })
  assert.equal(long.ok && long.valeur.nom?.length, 100)
})

test('validerInscription : le consentement est obligatoire et doit valoir exactement vrai', () => {
  for (const consentement of [undefined, false, 'true', 1, 'oui', null]) {
    const r = validerInscription({ email: 'a@exemple.fr', consentement })
    assert.equal(r.ok, false)
  }
})

test('validerInscription : corps invalide', () => {
  for (const corps of [null, undefined, 'texte', 12, []]) assert.equal(validerInscription(corps).ok, false)
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

test('consentement : version et texte définis, et le texte parle de désinscription et d\'usage unique', () => {
  assert.match(CONSENTEMENT_VERSION, /^\d{4}-\d{2}-v\d+$/)
  assert.match(CONSENTEMENT_TEXTE, /désinscrire/)
  assert.match(CONSENTEMENT_TEXTE, /uniquement/)
})

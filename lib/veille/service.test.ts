// Tests des règles d'inscription / confirmation / désinscription, avec une base de données et un envoi d'e-mail simulés : `npm test`
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  DELAI_CONFIRMATION_MS,
  DELAI_CONSERVATION_DESINSCRIT_MS,
  DELAI_PURGE_EN_ATTENTE_MS,
  DELAI_RENVOI_MS,
  confirmer,
  desinscrire,
  exporter,
  inscrire,
  purger,
  type Abonne,
  type Depot,
  type Outils,
} from './service.ts'

class DepotMemoire implements Depot {
  lignes: Abonne[] = []
  private compteur = 0
  async trouverParEmail(email: string) { return this.lignes.find((a) => a.email === email) ?? null }
  async trouverParJetonConfirmation(j: string) { return this.lignes.find((a) => a.jeton_confirmation === j) ?? null }
  async trouverParJetonDesinscription(j: string) { return this.lignes.find((a) => a.jeton_desinscription === j) ?? null }
  async creer(a: Omit<Abonne, 'id'>) {
    if (this.lignes.some((l) => l.email === a.email)) throw new Error('doublon')
    this.lignes.push({ id: `id-${++this.compteur}`, ...a })
  }
  async mettreAJour(id: string, champs: Partial<Omit<Abonne, 'id'>>) {
    const ligne = this.lignes.find((l) => l.id === id)
    if (!ligne) throw new Error('introuvable')
    Object.assign(ligne, champs)
  }
  async lister() { return [...this.lignes] }
  async supprimerAnciens(l: { enAttenteAvant: string; desinscritsAvant: string }) {
    const enAttente = this.lignes.filter((a) => a.statut === 'en_attente' && a.derniere_demande_le < l.enAttenteAvant)
    const desinscrits = this.lignes.filter((a) => a.statut === 'desinscrit' && (a.desinscrit_le ?? '') < l.desinscritsAvant)
    this.lignes = this.lignes.filter((a) => !enAttente.includes(a) && !desinscrits.includes(a))
    return { enAttente: enAttente.length, desinscrits: desinscrits.length }
  }
}

function monde(debut = '2026-10-08T10:00:00.000Z') {
  const etat = { maintenant: new Date(debut), envois: [] as { email: string; jeton: string }[], echecEnvoi: false, n: 0 }
  const outils: Outils = {
    depot: new DepotMemoire(),
    async envoyerConfirmation(email, jeton) {
      etat.envois.push({ email, jeton })
      return !etat.echecEnvoi
    },
    nouveauJeton: () => String(++etat.n).padStart(48, '0'),
    maintenant: () => etat.maintenant,
    consentement: { version: 'v-test', texte: 'texte de test' },
  }
  const avancer = (ms: number) => { etat.maintenant = new Date(etat.maintenant.getTime() + ms) }
  return { etat, outils, depot: outils.depot as DepotMemoire, avancer }
}
const demande = { email: 'a@exemple.fr', nom: 'A', profil: 'avocat' }

test('première inscription : ligne en attente, consentement enregistré, e-mail de confirmation envoyé', async () => {
  const { etat, outils, depot } = monde()
  assert.equal(await inscrire(outils, demande), 'confirmation_envoyee')
  assert.equal(depot.lignes.length, 1)
  const a = depot.lignes[0]
  assert.deepEqual([a.statut, a.consentement_version, a.consentement_texte, a.confirme_le], ['en_attente', 'v-test', 'texte de test', null])
  assert.equal(etat.envois.length, 1)
  assert.equal(etat.envois[0].jeton, a.jeton_confirmation)
  assert.notEqual(a.jeton_confirmation, a.jeton_desinscription)
})

test('confirmation : active l\'abonnement, et un second clic ne change rien', async () => {
  const { outils, depot } = monde()
  await inscrire(outils, demande)
  const jeton = depot.lignes[0].jeton_confirmation
  assert.equal(await confirmer(outils, jeton), 'confirme')
  assert.equal(depot.lignes[0].statut, 'confirme')
  assert.equal(depot.lignes[0].confirme_le, '2026-10-08T10:00:00.000Z')
  assert.equal(await confirmer(outils, jeton), 'deja_confirme')
})

test('confirmation : jeton inconnu refusé, lien périmé après 7 jours', async () => {
  const { outils, depot, avancer } = monde()
  assert.equal(await confirmer(outils, 'x'.repeat(48)), 'invalide')
  await inscrire(outils, demande)
  avancer(DELAI_CONFIRMATION_MS + 1000)
  assert.equal(await confirmer(outils, depot.lignes[0].jeton_confirmation), 'expire')
  assert.equal(depot.lignes[0].statut, 'en_attente')
})

test('aucune confirmation sans clic : l\'inscription seule ne rend jamais l\'abonné « confirmé »', async () => {
  const { outils, depot } = monde()
  await inscrire(outils, demande)
  await inscrire(outils, demande)
  assert.equal(depot.lignes[0].statut, 'en_attente')
  assert.equal((await exporter(outils)).abonnes.length, 0)
})

test('même adresse redemandée trop tôt : pas de nouvel e-mail ; après 10 minutes : nouveau jeton, l\'ancien est invalidé', async () => {
  const { etat, outils, depot, avancer } = monde()
  await inscrire(outils, demande)
  const ancien = depot.lignes[0].jeton_confirmation
  assert.equal(await inscrire(outils, demande), 'trop_tot')
  assert.equal(etat.envois.length, 1)
  avancer(DELAI_RENVOI_MS + 1000)
  assert.equal(await inscrire(outils, demande), 'confirmation_envoyee')
  assert.equal(etat.envois.length, 2)
  assert.equal(depot.lignes.length, 1)                                             // pas de doublon d'adresse
  assert.notEqual(depot.lignes[0].jeton_confirmation, ancien)
  assert.equal(await confirmer(outils, ancien), 'invalide')
})

test('adresse déjà confirmée : aucune nouvelle demande, aucun e-mail', async () => {
  const { etat, outils, depot } = monde()
  await inscrire(outils, demande)
  await confirmer(outils, depot.lignes[0].jeton_confirmation)
  assert.equal(await inscrire(outils, demande), 'deja_confirme')
  assert.equal(etat.envois.length, 1)
})

test('désinscription : immédiate, idempotente, jeton inconnu refusé', async () => {
  const { outils, depot } = monde()
  await inscrire(outils, demande)
  await confirmer(outils, depot.lignes[0].jeton_confirmation)
  const jeton = depot.lignes[0].jeton_desinscription
  assert.equal(await desinscrire(outils, 'y'.repeat(48)), 'invalide')
  assert.equal(await desinscrire(outils, jeton), 'desinscrit')
  assert.equal(depot.lignes[0].statut, 'desinscrit')
  assert.equal(depot.lignes[0].desinscrit_le, '2026-10-08T10:00:00.000Z')
  assert.equal(await desinscrire(outils, jeton), 'deja_desinscrit')
})

test('on peut se désinscrire avant d\'avoir confirmé', async () => {
  const { outils, depot } = monde()
  await inscrire(outils, demande)
  assert.equal(await desinscrire(outils, depot.lignes[0].jeton_desinscription), 'desinscrit')
  assert.equal(await confirmer(outils, depot.lignes[0].jeton_confirmation), 'invalide')     // le lien de confirmation ne ressuscite pas l'abonnement
})

test('retour après désinscription : nouvelle demande, nouveaux jetons, nouveau consentement, ancien lien de désinscription mort', async () => {
  const { etat, outils, depot, avancer } = monde()
  await inscrire(outils, demande)
  await confirmer(outils, depot.lignes[0].jeton_confirmation)
  const ancienDesinscription = depot.lignes[0].jeton_desinscription
  await desinscrire(outils, ancienDesinscription)
  avancer(60_000)
  assert.equal(await inscrire(outils, demande), 'confirmation_envoyee')
  const a = depot.lignes[0]
  assert.deepEqual([a.statut, a.desinscrit_le, a.confirme_le], ['en_attente', null, null])
  assert.notEqual(a.jeton_desinscription, ancienDesinscription)
  assert.equal(await desinscrire(outils, ancienDesinscription), 'invalide')
  assert.equal(etat.envois.length, 2)
})

test('échec d\'envoi de l\'e-mail : signalé (la personne pourra réessayer)', async () => {
  const { etat, outils } = monde()
  etat.echecEnvoi = true
  assert.equal(await inscrire(outils, demande), 'echec_envoi')
})

test('export : seulement les confirmés, avec leur jeton de désinscription ; les désinscrits listés à part ; rien d\'autre', async () => {
  const { outils, depot } = monde()
  for (const email of ['c@exemple.fr', 'p@exemple.fr', 'd@exemple.fr']) await inscrire(outils, { email, nom: null, profil: 'syndic' })
  const [c, , d] = depot.lignes
  await confirmer(outils, c.jeton_confirmation)
  await confirmer(outils, d.jeton_confirmation)
  await desinscrire(outils, d.jeton_desinscription)
  const e = await exporter(outils)
  assert.deepEqual(e.abonnes.map((a) => a.email), ['c@exemple.fr'])
  assert.equal(e.abonnes[0].jeton_desinscription, c.jeton_desinscription)
  assert.deepEqual(e.desinscrits, ['d@exemple.fr'])
  assert.ok(!('jeton_confirmation' in e.abonnes[0]))                                 // le jeton de confirmation ne sort jamais
  assert.ok(!JSON.stringify(e).includes('p@exemple.fr'))                             // l'adresse en attente n'est pas exportée
})

test('ménage : une demande jamais confirmée disparaît après 30 jours, un abonné confirmé jamais', async () => {
  const { outils, depot, avancer } = monde()
  await inscrire(outils, { email: 'attente@exemple.fr', nom: null, profil: 'autre' })
  await inscrire(outils, { email: 'confirme@exemple.fr', nom: null, profil: 'autre' })
  await confirmer(outils, depot.lignes[1].jeton_confirmation)
  avancer(DELAI_PURGE_EN_ATTENTE_MS - 1000)
  assert.deepEqual(await purger(outils), { enAttente: 0, desinscrits: 0 })              // pas encore 30 jours
  avancer(2000)
  assert.deepEqual(await purger(outils), { enAttente: 1, desinscrits: 0 })
  assert.deepEqual(depot.lignes.map((a) => a.email), ['confirme@exemple.fr'])
  avancer(DELAI_CONSERVATION_DESINSCRIT_MS * 2)
  assert.equal(depot.lignes.length, 1)                                                  // le confirmé reste, quel que soit le temps
})

test('ménage : un désinscrit est effacé 3 ans après sa désinscription, pas avant', async () => {
  const { outils, depot, avancer } = monde()
  await inscrire(outils, demande)
  await confirmer(outils, depot.lignes[0].jeton_confirmation)
  await desinscrire(outils, depot.lignes[0].jeton_desinscription)
  avancer(DELAI_CONSERVATION_DESINSCRIT_MS - 1000)
  assert.deepEqual(await purger(outils), { enAttente: 0, desinscrits: 0 })
  avancer(2000)
  assert.deepEqual(await purger(outils), { enAttente: 0, desinscrits: 1 })
  assert.equal(depot.lignes.length, 0)
})

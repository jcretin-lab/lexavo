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
  async trouverParEmailEtListe(email: string, liste: string) { return this.lignes.find((a) => a.email === email && a.liste === liste) ?? null }
  async trouverParJetonConfirmation(j: string) { return this.lignes.find((a) => a.jeton_confirmation === j) ?? null }
  async trouverParJetonDesinscription(j: string) { return this.lignes.find((a) => a.jeton_desinscription === j) ?? null }
  async creer(a: Omit<Abonne, 'id'>) {
    if (this.lignes.some((l) => l.email === a.email && l.liste === a.liste)) throw new Error('doublon')
    this.lignes.push({ id: `id-${++this.compteur}`, ...a })
  }
  async mettreAJour(id: string, champs: Partial<Omit<Abonne, 'id'>>) {
    const ligne = this.lignes.find((l) => l.id === id)
    if (!ligne) throw new Error('introuvable')
    Object.assign(ligne, champs)
  }
  async lister(liste: string) { return this.lignes.filter((a) => a.liste === liste) }
  async listerParEmail(email: string) { return this.lignes.filter((a) => a.email === email) }
  async supprimerAnciens(l: { enAttenteAvant: string; desinscritsAvant: string }) {
    const enAttente = this.lignes.filter((a) => a.statut === 'en_attente' && a.derniere_demande_le < l.enAttenteAvant)
    const desinscrits = this.lignes.filter((a) => a.statut === 'desinscrit' && (a.desinscrit_le ?? '') < l.desinscritsAvant)
    this.lignes = this.lignes.filter((a) => !enAttente.includes(a) && !desinscrits.includes(a))
    return { enAttente: enAttente.length, desinscrits: desinscrits.length }
  }
}

function monde(debut = '2026-10-08T10:00:00.000Z') {
  const etat = { maintenant: new Date(debut), envois: [] as { email: string; jeton: string; listes: string[] }[], echecEnvoi: false, n: 0 }
  const outils: Outils = {
    depot: new DepotMemoire(),
    async envoyerConfirmation(email, jeton, listes) {
      etat.envois.push({ email, jeton, listes })
      return !etat.echecEnvoi
    },
    nouveauJeton: () => String(++etat.n).padStart(48, '0'),
    maintenant: () => etat.maintenant,
    consentement: () => ({ version: 'v-test', texte: 'texte de test' }),
  }
  const avancer = (ms: number) => { etat.maintenant = new Date(etat.maintenant.getTime() + ms) }
  return { etat, outils, depot: outils.depot as DepotMemoire, avancer }
}
const demande = { email: 'a@exemple.fr', nom: 'A', profil: 'avocat', listes: ['liste-a'] }

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
  assert.equal((await exporter(outils, 'liste-a')).abonnes.length, 0)
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
  for (const email of ['c@exemple.fr', 'p@exemple.fr', 'd@exemple.fr']) await inscrire(outils, { email, nom: null, profil: 'syndic', listes: ['liste-a'] })
  const [c, , d] = depot.lignes
  await confirmer(outils, c.jeton_confirmation)
  await confirmer(outils, d.jeton_confirmation)
  await desinscrire(outils, d.jeton_desinscription)
  const e = await exporter(outils, 'liste-a')
  assert.deepEqual(e.abonnes.map((a) => a.email), ['c@exemple.fr'])
  assert.equal(e.abonnes[0].jeton_desinscription, c.jeton_desinscription)
  assert.deepEqual(e.desinscrits, ['d@exemple.fr'])
  assert.ok(!('jeton_confirmation' in e.abonnes[0]))                                 // le jeton de confirmation ne sort jamais
  assert.ok(!JSON.stringify(e).includes('p@exemple.fr'))                             // l'adresse en attente n'est pas exportée
})

test('ménage : une demande jamais confirmée disparaît après 30 jours, un abonné confirmé jamais', async () => {
  const { outils, depot, avancer } = monde()
  await inscrire(outils, { email: 'attente@exemple.fr', nom: null, profil: 'autre', listes: ['liste-a'] })
  await inscrire(outils, { email: 'confirme@exemple.fr', nom: null, profil: 'autre', listes: ['liste-a'] })
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

test('plusieurs veilles en une demande : une ligne, des jetons et un consentement par veille, mais UN SEUL e-mail qui les énumère', async () => {
  const { etat, outils, depot } = monde()
  assert.equal(await inscrire(outils, { ...demande, listes: ['liste-a', 'liste-b', 'liste-c'] }), 'confirmation_envoyee')
  assert.deepEqual(depot.lignes.map((a) => a.liste), ['liste-a', 'liste-b', 'liste-c'])
  assert.equal(etat.envois.length, 1)                                                      // un e-mail, pas trois
  assert.deepEqual(etat.envois[0].listes, ['liste-a', 'liste-b', 'liste-c'])
  assert.equal(etat.envois[0].jeton, depot.lignes[0].jeton_confirmation)                     // le lien est celui de la première ligne
  assert.equal(new Set(depot.lignes.map((a) => a.jeton_desinscription)).size, 3)              // un lien de désinscription par veille
  assert.deepEqual(depot.lignes.map((a) => a.consentement_texte), ['texte de test', 'texte de test', 'texte de test'])
  assert.equal(new Set(depot.lignes.map((a) => a.derniere_demande_le)).size, 1)              // même instant de demande
})

test('plusieurs veilles en une demande : un seul clic les confirme toutes, et un second clic ne change rien', async () => {
  const { outils, depot } = monde()
  await inscrire(outils, { ...demande, listes: ['liste-a', 'liste-b'] })
  assert.equal(await confirmer(outils, depot.lignes[0].jeton_confirmation), 'confirme')
  assert.deepEqual(depot.lignes.map((l) => l.statut), ['confirme', 'confirme'])
  assert.deepEqual(depot.lignes.map((l) => l.confirme_le), ['2026-10-08T10:00:00.000Z', '2026-10-08T10:00:00.000Z'])
  assert.equal(await confirmer(outils, depot.lignes[0].jeton_confirmation), 'deja_confirme')
})

test("plusieurs veilles en une demande : le clic ne confirme pas une demande d'une autre date, ni une autre adresse", async () => {
  const { outils, depot, avancer } = monde()
  await inscrire(outils, { ...demande, listes: ['liste-b'] })                                 // demande plus ancienne, jamais confirmée
  await inscrire(outils, { email: 'z@exemple.fr', nom: null, profil: 'autre', listes: ['liste-a'] })
  avancer(DELAI_RENVOI_MS + 1000)
  await inscrire(outils, { ...demande, listes: ['liste-a', 'liste-c'] })
  const lignesA = depot.lignes.filter((l) => l.email === 'a@exemple.fr' && l.liste !== 'liste-b')
  await confirmer(outils, lignesA[0].jeton_confirmation)
  const statut = (email: string, liste: string) => depot.lignes.find((l) => l.email === email && l.liste === liste)?.statut
  assert.equal(statut('a@exemple.fr', 'liste-a'), 'confirme')
  assert.equal(statut('a@exemple.fr', 'liste-c'), 'confirme')
  assert.equal(statut('a@exemple.fr', 'liste-b'), 'en_attente')                              // demandée plus tôt : pas dans l'e-mail du clic
  assert.equal(statut('z@exemple.fr', 'liste-a'), 'en_attente')                              // autre adresse
})

test('plusieurs veilles en une demande : une veille déjà confirmée ou demandée à l\'instant est laissée de côté, sans rien révéler', async () => {
  const { etat, outils, depot, avancer } = monde()
  await inscrire(outils, demande)
  await confirmer(outils, depot.lignes[0].jeton_confirmation)                                 // liste-a confirmée
  assert.equal(await inscrire(outils, { ...demande, listes: ['liste-a', 'liste-b'] }), 'confirmation_envoyee')
  assert.deepEqual(etat.envois[1].listes, ['liste-b'])                                        // l'e-mail ne reparle pas de la veille confirmée
  assert.equal(await inscrire(outils, { ...demande, listes: ['liste-a', 'liste-b'] }), 'deja_confirme')   // liste-a confirmée, liste-b demandée à l'instant : rien à envoyer
  assert.equal(etat.envois.length, 2)
  avancer(DELAI_RENVOI_MS + 1000)
  assert.equal(await inscrire(outils, { ...demande, listes: ['liste-b'] }), 'confirmation_envoyee')   // 10 minutes plus tard : nouvelle confirmation
  assert.equal(await inscrire(outils, { ...demande, listes: ['liste-b'] }), 'trop_tot')
})

test("plusieurs veilles en une demande : lien périmé après 7 jours pour toute la demande", async () => {
  const { outils, depot, avancer } = monde()
  await inscrire(outils, { ...demande, listes: ['liste-a', 'liste-b'] })
  avancer(DELAI_CONFIRMATION_MS + 1000)
  assert.equal(await confirmer(outils, depot.lignes[0].jeton_confirmation), 'expire')
  assert.deepEqual(depot.lignes.map((l) => l.statut), ['en_attente', 'en_attente'])
})

test('plusieurs veilles en une demande : échec d\'envoi signalé, les lignes en attente restent', async () => {
  const { etat, outils, depot } = monde()
  etat.echecEnvoi = true
  assert.equal(await inscrire(outils, { ...demande, listes: ['liste-a', 'liste-b'] }), 'echec_envoi')
  assert.equal(depot.lignes.length, 2)
})

test('plusieurs veilles : la même adresse a une ligne, des jetons et un consentement par liste, même en deux demandes séparées', async () => {
  const { etat, outils, depot } = monde()
  assert.equal(await inscrire(outils, demande), 'confirmation_envoyee')
  assert.equal(await inscrire(outils, { ...demande, listes: ['liste-b'] }), 'confirmation_envoyee')   // pas « trop tôt » ni « déjà confirmé » : autre liste
  assert.equal(depot.lignes.length, 2)
  assert.deepEqual(depot.lignes.map((a) => a.liste), ['liste-a', 'liste-b'])
  assert.deepEqual(etat.envois.map((e) => e.listes), [['liste-a'], ['liste-b']])
  assert.notEqual(depot.lignes[0].jeton_desinscription, depot.lignes[1].jeton_desinscription)
})

test("plusieurs veilles : confirmer ou se désinscrire d'une liste ne touche pas l'autre", async () => {
  const { outils, depot } = monde()
  await inscrire(outils, demande)
  await inscrire(outils, { ...demande, listes: ['liste-b'] })
  const [a, b] = depot.lignes
  await confirmer(outils, a.jeton_confirmation)
  await confirmer(outils, b.jeton_confirmation)
  await desinscrire(outils, a.jeton_desinscription)
  assert.deepEqual(depot.lignes.map((l) => l.statut), ['desinscrit', 'confirme'])
  assert.equal(await inscrire(outils, demande), 'confirmation_envoyee')                    // retour dans la liste A seulement
  assert.equal(await inscrire(outils, { ...demande, listes: ['liste-b'] }), 'deja_confirme')
})

test("plusieurs veilles : se désinscrire d'une veille d'une demande groupée ne touche pas les autres", async () => {
  const { outils, depot } = monde()
  await inscrire(outils, { ...demande, listes: ['liste-a', 'liste-b'] })
  await confirmer(outils, depot.lignes[0].jeton_confirmation)
  await desinscrire(outils, depot.lignes[1].jeton_desinscription)
  assert.deepEqual(depot.lignes.map((l) => l.statut), ['confirme', 'desinscrit'])
})

test("plusieurs veilles : l'export d'une liste ne contient ni les abonnés ni les désinscrits des autres", async () => {
  const { outils, depot } = monde()
  await inscrire(outils, demande)
  await inscrire(outils, { email: 'b@exemple.fr', nom: null, profil: 'notaire', listes: ['liste-b'] })
  await inscrire(outils, { email: 'c@exemple.fr', nom: null, profil: 'notaire', listes: ['liste-b'] })
  for (const l of depot.lignes) await confirmer(outils, l.jeton_confirmation)
  await desinscrire(outils, depot.lignes[2].jeton_desinscription)
  const a = await exporter(outils, 'liste-a')
  const b = await exporter(outils, 'liste-b')
  assert.deepEqual(a.abonnes.map((x) => x.email), ['a@exemple.fr'])
  assert.deepEqual(a.desinscrits, [])
  assert.deepEqual(b.abonnes.map((x) => x.email), ['b@exemple.fr'])
  assert.deepEqual(b.desinscrits, ['c@exemple.fr'])
  assert.deepEqual((await exporter(outils, 'liste-inconnue')).abonnes, [])
})

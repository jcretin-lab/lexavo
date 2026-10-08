// Accès à la table `veille_abonnes` avec la clé de service (côté serveur uniquement : cette clé ne doit jamais atteindre le navigateur).
// La table n'a aucune politique d'accès publique (voir supabase-migration-veille-abonnes.sql) : seules ces routes serveur y touchent.
import { createClient } from '@supabase/supabase-js'
import type { Abonne, Depot } from './service'

const TABLE = 'veille_abonnes'

export function creerDepotSupabase(): Depot {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !cle) throw new Error('[veille] configuration Supabase incomplète (URL ou clé de service absente)')
  const supabase = createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } })

  async function un(colonne: string, valeur: string): Promise<Abonne | null> {
    const { data, error } = await supabase.from(TABLE).select('*').eq(colonne, valeur).maybeSingle()
    if (error) throw new Error(`[veille] lecture impossible : ${error.message}`)
    return (data as Abonne | null) ?? null
  }

  return {
    trouverParEmail: (email) => un('email', email),
    trouverParJetonConfirmation: (jeton) => un('jeton_confirmation', jeton),
    trouverParJetonDesinscription: (jeton) => un('jeton_desinscription', jeton),
    async creer(abonne) {
      const { error } = await supabase.from(TABLE).insert(abonne)
      if (error) throw new Error(`[veille] création impossible : ${error.message}`)
    },
    async mettreAJour(id, champs) {
      const { error } = await supabase.from(TABLE).update(champs).eq('id', id)
      if (error) throw new Error(`[veille] mise à jour impossible : ${error.message}`)
    },
    async lister() {
      const { data, error } = await supabase.from(TABLE).select('*').order('cree_le', { ascending: true })
      if (error) throw new Error(`[veille] liste impossible : ${error.message}`)
      return (data ?? []) as Abonne[]
    },
    async supprimerAnciens({ enAttenteAvant, desinscritsAvant }) {
      const a = await supabase.from(TABLE).delete({ count: 'exact' }).eq('statut', 'en_attente').lt('derniere_demande_le', enAttenteAvant)
      if (a.error) throw new Error(`[veille] purge impossible : ${a.error.message}`)
      const d = await supabase.from(TABLE).delete({ count: 'exact' }).eq('statut', 'desinscrit').lt('desinscrit_le', desinscritsAvant)
      if (d.error) throw new Error(`[veille] purge impossible : ${d.error.message}`)
      return { enAttente: a.count ?? 0, desinscrits: d.count ?? 0 }
    },
  }
}

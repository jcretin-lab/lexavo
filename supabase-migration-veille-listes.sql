-- Migration — Newsletters « Veille Lexavo » : une liste d'abonnés par veille.
-- À exécuter UNE FOIS dans Supabase (SQL Editor : coller tout le script, puis Run), AVANT de déployer le code qui lit la colonne `liste`.
-- Sans danger pour le site actuel : il n'utilise pas la colonne, qui prend sa valeur par défaut. Sans danger si elle est exécutée deux fois.
-- Les abonnés existants (la veille « baux et copropriété ») reçoivent la liste par défaut : rien d'autre ne change pour eux.
-- Prérequis : supabase-migration-veille-abonnes.sql (la table veille_abonnes).
--
-- Retour en arrière, si besoin (avant tout abonné à une autre liste) :
--   BEGIN;
--   CREATE UNIQUE INDEX IF NOT EXISTS veille_abonnes_email_uniq ON veille_abonnes (email);
--   DROP INDEX IF EXISTS veille_abonnes_email_liste_uniq;
--   ALTER TABLE veille_abonnes DROP CONSTRAINT IF EXISTS veille_abonnes_liste_valide;
--   ALTER TABLE veille_abonnes DROP COLUMN IF EXISTS liste;
--   COMMIT;

BEGIN;

ALTER TABLE veille_abonnes
  ADD COLUMN IF NOT EXISTS liste text NOT NULL DEFAULT 'baux-copropriete';

-- Une même adresse peut s'inscrire à plusieurs veilles : l'unicité porte désormais sur (adresse, liste).
-- Le nouvel index est créé AVANT de supprimer l'ancien : il n'y a jamais d'instant sans protection contre les doublons
-- (tant que toutes les lignes sont dans la liste par défaut, les deux protègent exactement la même chose).
CREATE UNIQUE INDEX IF NOT EXISTS veille_abonnes_email_liste_uniq ON veille_abonnes (email, liste);
DROP INDEX IF EXISTS veille_abonnes_email_uniq;
CREATE INDEX IF NOT EXISTS veille_abonnes_liste_statut_idx ON veille_abonnes (liste, statut);

-- Les slugs sont ceux de lib/veille/listes.ts (et de config/newsletters/<slug>.toml du projet de veille) : lettres minuscules, chiffres et tirets.
ALTER TABLE veille_abonnes DROP CONSTRAINT IF EXISTS veille_abonnes_liste_valide;
ALTER TABLE veille_abonnes ADD CONSTRAINT veille_abonnes_liste_valide CHECK (liste ~ '^[a-z0-9]+(-[a-z0-9]+)*$');

COMMENT ON COLUMN veille_abonnes.liste IS 'Veille à laquelle la personne est inscrite (slug). La même adresse peut figurer dans plusieurs listes.';

COMMIT;

-- Contrôle (à lancer ensuite) : toutes les lignes existantes doivent être dans la liste « baux-copropriete ».
-- SELECT liste, statut, count(*) FROM veille_abonnes GROUP BY liste, statut ORDER BY liste, statut;

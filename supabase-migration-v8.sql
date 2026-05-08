-- Migration v8 — Suppression des colonnes obsolètes par-réseau
-- Après l'unification via make_webhook_url (v7), les flags de connexion
-- spécifiques à Facebook et LinkedIn n'ont plus aucune utilité côté code.

ALTER TABLE cabinets
  DROP COLUMN IF EXISTS facebook_connected,
  DROP COLUMN IF EXISTS linkedin_connected,
  DROP COLUMN IF EXISTS linkedin_connected_at;

ALTER TABLE membres
  DROP COLUMN IF EXISTS linkedin_token;

-- Index orphelin créé en v5 pour le cron linkedin-reminder (lui aussi supprimé)
DROP INDEX IF EXISTS idx_cabinets_linkedin_connected_at;

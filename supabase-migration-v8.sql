-- Migration v8 — Simplification : suppression du plan Découverte + nettoyage colonnes par-réseau
-- 1) Plans : on retire "essentiel" (et son ancêtre "decouverte") ; les comptes existants
--    basculent vers le plan Pro (entrée payante). Le default DB passe à "trial" pour
--    rester aligné avec le code d'onboarding qui crée les nouveaux cabinets en trial.
-- 2) Colonnes par-réseau : après l'unification via make_webhook_url (v7), les flags
--    de connexion spécifiques à Facebook et LinkedIn n'ont plus d'utilité côté code.

-- ─── Plans ───────────────────────────────────────────────────────────
UPDATE cabinets SET plan = 'pro' WHERE plan IN ('essentiel', 'decouverte');
ALTER TABLE cabinets ALTER COLUMN plan SET DEFAULT 'trial';

-- ─── Colonnes par-réseau obsolètes ───────────────────────────────────
ALTER TABLE cabinets
  DROP COLUMN IF EXISTS facebook_connected,
  DROP COLUMN IF EXISTS linkedin_connected,
  DROP COLUMN IF EXISTS linkedin_connected_at;

ALTER TABLE membres
  DROP COLUMN IF EXISTS linkedin_token;

-- Index orphelin créé en v5 pour le cron linkedin-reminder (lui aussi supprimé)
DROP INDEX IF EXISTS idx_cabinets_linkedin_connected_at;

-- Migration v3 : webhooks par reseau + connexion LinkedIn

ALTER TABLE cabinets
  ADD COLUMN IF NOT EXISTS make_webhook_facebook TEXT,
  ADD COLUMN IF NOT EXISTS make_webhook_linkedin TEXT;

ALTER TABLE cabinets
  ADD COLUMN IF NOT EXISTS linkedin_connected BOOLEAN NOT NULL DEFAULT FALSE;

-- Renommage : linkedin_token stockait la connexion Facebook, nom corrige
ALTER TABLE cabinets RENAME COLUMN linkedin_token TO facebook_connected;

-- Migration v5 — Webhooks Make.com + tracking LinkedIn
-- À exécuter dans Supabase SQL Editor

ALTER TABLE cabinets
  ADD COLUMN IF NOT EXISTS make_webhook_facebook  TEXT,
  ADD COLUMN IF NOT EXISTS make_webhook_linkedin  TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_connected_at  TIMESTAMPTZ;

-- Index pour les requêtes cron (rappel expiration LinkedIn)
CREATE INDEX IF NOT EXISTS idx_cabinets_linkedin_connected_at
  ON cabinets (linkedin_connected_at)
  WHERE linkedin_connected_at IS NOT NULL;

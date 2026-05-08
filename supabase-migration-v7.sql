-- Migration v7 — Webhook unifié pour la publication multi-réseaux
-- Remplace les webhooks Facebook/LinkedIn séparés par un webhook Make unique
-- qui orchestre tous les réseaux sociaux du cabinet (LinkedIn, Facebook, Instagram...).

ALTER TABLE cabinets
  DROP COLUMN IF EXISTS make_webhook_facebook,
  DROP COLUMN IF EXISTS make_webhook_linkedin,
  ADD COLUMN IF NOT EXISTS make_webhook_url TEXT;

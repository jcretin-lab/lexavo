-- ============================================================
-- LexContent — Migration v2
-- Nouveau pricing : essentiel / pro / cabinet (plans illimités)
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Ajouter max_membres à la table cabinets
ALTER TABLE cabinets
  ADD COLUMN IF NOT EXISTS max_membres INTEGER NOT NULL DEFAULT 1;

-- 2. Mettre à jour max_membres selon le plan actuel
UPDATE cabinets SET max_membres = 3 WHERE plan = 'cabinet';
UPDATE cabinets SET max_membres = 1 WHERE plan IN ('essentiel', 'pro', 'trial', 'decouverte', 'actif');

-- 3. Renommer les anciens plans vers les nouveaux noms
UPDATE cabinets SET plan = 'essentiel' WHERE plan = 'decouverte';
UPDATE cabinets SET plan = 'pro'       WHERE plan = 'actif';
-- 'trial' et 'cabinet' restent identiques

-- 4. Créer la table membres
CREATE TABLE IF NOT EXISTS membres (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id UUID REFERENCES cabinets(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nom        TEXT NOT NULL,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'membre',
  statut     TEXT NOT NULL DEFAULT 'invite',
  linkedin_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Index pour les lookups fréquents
CREATE INDEX IF NOT EXISTS membres_cabinet_id_idx ON membres(cabinet_id);
CREATE INDEX IF NOT EXISTS membres_email_idx ON membres(email);
CREATE INDEX IF NOT EXISTS membres_user_id_idx ON membres(user_id);

-- 6. Row Level Security pour membres
ALTER TABLE membres ENABLE ROW LEVEL SECURITY;

-- Admin peut tout faire sur ses membres
CREATE POLICY "membres_admin" ON membres
  FOR ALL USING (
    cabinet_id IN (SELECT id FROM cabinets WHERE user_id = auth.uid())
  );

-- Un membre peut voir sa propre fiche
CREATE POLICY "membres_self" ON membres
  FOR SELECT USING (user_id = auth.uid());

-- ============================================================
-- Variables d'environnement Vercel à configurer :
--   STRIPE_PRICE_ESSENTIEL = price_xxx  (49€/mois)
--   STRIPE_PRICE_PRO       = price_xxx  (69€/mois)
--   STRIPE_PRICE_CABINET   = price_xxx  (149€/mois)
--   RESEND_API_KEY         = re_xxx
--   RESEND_FROM_EMAIL      = Lexavo <noreply@lexavo.fr>
-- ============================================================

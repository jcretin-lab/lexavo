-- ============================================================
-- LexContent — Schéma Supabase
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- ============================================================

-- Table : cabinets
CREATE TABLE IF NOT EXISTS cabinets (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nom                     TEXT NOT NULL,
  specialites             TEXT[] NOT NULL DEFAULT '{}',
  ville                   TEXT NOT NULL,
  barreau                 TEXT NOT NULL,
  site_web                TEXT,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT,
  plan                    TEXT NOT NULL DEFAULT 'trial',
  linkedin_token          TEXT,
  make_webhook_url        TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table : generations
CREATE TABLE IF NOT EXISTS generations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id       UUID REFERENCES cabinets(id) ON DELETE CASCADE,
  theme            TEXT NOT NULL,
  specialite       TEXT NOT NULL,
  article_blog     JSONB,
  posts_linkedin   JSONB,
  faq              JSONB,
  image_url        TEXT,
  statut           TEXT NOT NULL DEFAULT 'brouillon',
  date_publication TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table : calendrier
CREATE TABLE IF NOT EXISTS calendrier (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cabinet_id        UUID REFERENCES cabinets(id) ON DELETE CASCADE,
  generation_id     UUID REFERENCES generations(id) ON DELETE SET NULL,
  reseau            TEXT NOT NULL DEFAULT 'linkedin',
  contenu           TEXT NOT NULL,
  image_url         TEXT,
  date_programmee   TIMESTAMPTZ NOT NULL,
  statut            TEXT NOT NULL DEFAULT 'en_attente',
  make_execution_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

ALTER TABLE cabinets ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendrier ENABLE ROW LEVEL SECURITY;

-- Politiques cabinets
CREATE POLICY "cabinet_own" ON cabinets
  FOR ALL USING (auth.uid() = user_id);

-- Politiques generations
CREATE POLICY "generation_own" ON generations
  FOR ALL USING (
    cabinet_id IN (SELECT id FROM cabinets WHERE user_id = auth.uid())
  );

-- Politiques calendrier
CREATE POLICY "calendrier_own" ON calendrier
  FOR ALL USING (
    cabinet_id IN (SELECT id FROM cabinets WHERE user_id = auth.uid())
  );

-- ============================================================
-- Supabase Storage — bucket images
-- ============================================================
-- À exécuter séparément dans Supabase Dashboard > Storage
-- Créer un bucket public nommé "images"
-- Ou via la commande SQL ci-dessous :

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Politique de stockage : seuls les utilisateurs authentifiés peuvent uploader
CREATE POLICY "images_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' AND auth.role() = 'authenticated'
  );

-- Lecture publique des images
CREATE POLICY "images_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- ============================================================
-- Migration : plan trial (à exécuter sur une base existante)
-- ============================================================
-- ALTER TABLE cabinets ALTER COLUMN plan SET DEFAULT 'trial';

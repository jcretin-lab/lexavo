-- Migration v9 — 3 visuels par publication
-- Ajoute :
--   - images JSONB : { conceptuelle: url, photorealiste: url, humains: url }
--   - image_selectionnee TEXT : URL de l'image choisie pour la publication
-- image_url est conservé pour compat ascendante (pointera sur images.conceptuelle).

ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS images JSONB,
  ADD COLUMN IF NOT EXISTS image_selectionnee TEXT;

-- Backfill : si image_url existe déjà, le réutiliser comme image conceptuelle
-- pour que les anciennes générations continuent à afficher leur image.
UPDATE generations
   SET images = jsonb_build_object('conceptuelle', image_url),
       image_selectionnee = image_url
 WHERE image_url IS NOT NULL
   AND images IS NULL;

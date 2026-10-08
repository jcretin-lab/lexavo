-- Migration — Newsletter « Veille Lexavo » : abonnés, avec double confirmation et désinscription.
-- À exécuter UNE FOIS dans Supabase : Dashboard > SQL Editor > New query > coller ce fichier > Run.
-- Sans danger si elle est exécutée deux fois (tout est « IF NOT EXISTS »). N'ajoute qu'une table : aucune table existante n'est touchée.

CREATE TABLE IF NOT EXISTS veille_abonnes (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email                 text        NOT NULL,
  nom                   text,
  profil                text        NOT NULL DEFAULT 'autre'
                                    CHECK (profil IN ('avocat', 'syndic', 'gestionnaire', 'bailleur', 'notaire', 'autre')),
  statut                text        NOT NULL DEFAULT 'en_attente'
                                    CHECK (statut IN ('en_attente', 'confirme', 'desinscrit')),
  -- jetons à usage unique, longs et aléatoires (48 caractères hexadécimaux) : l'un confirme, l'autre désinscrit
  jeton_confirmation    text        NOT NULL,
  jeton_desinscription  text        NOT NULL,
  -- preuve du consentement : version et texte exact affichés sur le formulaire au moment de l'inscription
  consentement_version  text        NOT NULL,
  consentement_texte    text        NOT NULL,
  cree_le               timestamptz NOT NULL DEFAULT now(),
  derniere_demande_le   timestamptz NOT NULL DEFAULT now(),
  confirme_le           timestamptz,
  desinscrit_le         timestamptz,
  CONSTRAINT veille_abonnes_email_normalise CHECK (email = lower(btrim(email)))
);

CREATE UNIQUE INDEX IF NOT EXISTS veille_abonnes_email_uniq               ON veille_abonnes (email);
CREATE UNIQUE INDEX IF NOT EXISTS veille_abonnes_jeton_confirmation_uniq   ON veille_abonnes (jeton_confirmation);
CREATE UNIQUE INDEX IF NOT EXISTS veille_abonnes_jeton_desinscription_uniq ON veille_abonnes (jeton_desinscription);
CREATE INDEX        IF NOT EXISTS veille_abonnes_statut_idx                ON veille_abonnes (statut);

-- Sécurité : la table est fermée au public. Aucune politique n'est créée, donc les clés publiques (anon, authenticated)
-- n'y ont AUCUN accès ; seules les routes serveur de l'application, avec la clé de service, peuvent lire et écrire.
ALTER TABLE veille_abonnes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE veille_abonnes IS
  'Inscrits à la newsletter Veille Lexavo. Double confirmation (statut en_attente -> confirme), désinscription (desinscrit). Accès réservé au serveur.';

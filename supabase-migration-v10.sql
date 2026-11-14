-- v10 — Passage à un plan unique (29 €/mois, 1 utilisateur)
--
-- Contexte : suppression des paliers `cabinet` (119 €, 3 utilisateurs) et
-- `pilote` (290 €, service géré, jamais branché sur Stripe). Le slug `pro` est
-- conservé comme identifiant du plan unique, donc aucune valeur existante en
-- base n'a besoin d'être réécrite pour les clients déjà sur `pro`.
--
-- À exécuter APRÈS avoir vérifié qu'aucun cabinet n'est sur le plan `cabinet` :
--   SELECT plan, count(*) FROM cabinets GROUP BY plan;

-- 1. Filet de sécurité : bascule des éventuels cabinets restés sur `cabinet`.
--    Attendu : 0 ligne affectée.
UPDATE cabinets SET plan = 'pro' WHERE plan = 'cabinet';

-- 2. La fonctionnalité Équipe (multi-utilisateurs) est retirée du produit.
--    ATTENTION : destructif. Les invitations et rattachements sont perdus.
--    Avant de l'exécuter, identifier les comptes créés par invitation qui sont
--    en `pro` sans abonnement Stripe (accès gratuit hérité de l'ancien plan
--    Cabinet), car le lien permettant de les retrouver disparaît avec la table :
--      SELECT c.id, c.nom, c.plan
--      FROM cabinets c
--      JOIN membres m ON m.user_id = c.user_id
--      WHERE c.stripe_subscription_id IS NULL;
DROP TABLE IF EXISTS membres CASCADE;

-- 3. Le quota de sièges n'a plus d'objet : 1 utilisateur par cabinet.
ALTER TABLE cabinets DROP COLUMN IF EXISTS max_membres;

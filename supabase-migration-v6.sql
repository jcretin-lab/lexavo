-- Migration v6 : correction du plan des membres invités
-- Les cabinets appartenant à des membres invités (role='membre') avaient
-- incorrectement hérité du plan 'cabinet' de l'administrateur.
-- On les remet à 'pro' avec max_membres = 1.

UPDATE cabinets c
SET plan = 'pro', max_membres = 1
FROM membres m
WHERE m.user_id = c.user_id
  AND m.role = 'membre'
  AND m.user_id IS NOT NULL
  AND c.plan = 'cabinet';

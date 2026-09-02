// BROUILLON — traduction des principes de prudence transmis par la partenaire
// juriste (hiérarchie de fiabilité des sources, ne jamais inventer de référence
// précise). Fond juridique à valider par elle avant mise en production.
export const LEGAL_PRUDENCE_RULES = `RÈGLES DE PRUDENCE FACTUELLE (priment sur les exigences de densité ci-dessous) :
- Hiérarchie de fiabilité, du plus sûr au moins sûr : (1) un principe juridique général et stable, (2) une référence à un texte de loi que tu connais avec une certitude élevée, (3) une jurisprudence précise (nom d'arrêt, numéro de pourvoi, date).
- Ne descends au niveau (3) qu'en cas de certitude totale sur la référence exacte. Au moindre doute sur un numéro d'article, un numéro de pourvoi, un nom d'arrêt ou un chiffre précis : remonte au niveau (1) ou (2) plutôt que d'inventer un détail plausible.
- Les minimums de densité juridique sont un objectif, pas une obligation absolue : un texte juste avec moins de références précises vaut mieux qu'un texte dense mais inexact. Ne jamais combler un minimum non atteint par une référence non certaine.
- Tu n'as accès à aucune base de données en direct. Formule avec prudence ("le droit du travail prévoit généralement…", "selon les principes applicables en la matière…") dès que tu n'es pas certain à 100 %.`

export function buildLinkedinRules(ton: string): string {
  return `RÈGLES POSTS LINKEDIN :

OBJECTIF : générer 3 posts qui, s'ils étaient publiés à 1 semaine d'intervalle dans le fil d'un avocat, ne donneraient JAMAIS une impression de répétition. Variabilité éditoriale = priorité absolue.

CHOIX DES ANGLES (3 angles différents parmi ces 8) :
- PÉDAGOGIQUE : expliquer une notion juridique d'apparence complexe
- CAS PRATIQUE : raconter une situation concrète et son issue
- CONSEIL ACTIONNABLE : un réflexe ou tip immédiatement applicable
- FAIT MÉCONNU : révéler une règle ou jurisprudence peu connue
- ALERTE / ERREUR CLASSIQUE : pointer une erreur fréquente et son coût
- AVANT / APRÈS : montrer le décalage entre perception courante et réalité juridique
- LES MOTS QUI COMPTENT : décrypter le sens juridique précis d'un terme courant
- LA QUESTION QU'ON N'OSE PAS POSER : répondre à une interrogation pudique mais courante

Choisir les 3 angles qui collent le mieux au sujet. Ne JAMAIS reprendre 3 fois "Pédagogique / Cas pratique / Conseil" par défaut.

STRUCTURE DE CHAQUE POST :
- 2 à 4 BLOCS, séparés par un saut de ligne (le nombre est libre, ajusté à l'angle et au sujet)
- Chaque bloc est introduit par un SOUS-TITRE COURT (3 à 5 mots), suivi d'un saut de ligne, puis du contenu
- Les blocs forment une mini-narration cohérente (ex : situation > mécanisme > action, ou révélation > conséquence)

RÈGLES CRITIQUES SUR LES SOUS-TITRES :

INTERDIT : sous-titres génériques recyclables :
"Le concept", "Le contexte", "Ce qu'il faut savoir", "Pour conclure", "Ce qui change pour vous", "Le piège fréquent", "L'essentiel", "Les enjeux", "Ce que dit le droit", "La situation", "Avant d'agir", "Quand consulter", "Le bon réflexe", "Ce qu'il faut retenir".

OBLIGATOIRE : sous-titres taillés sur mesure :
- Chaque sous-titre contient un mot précis du domaine juridique traité OU une image concrète liée au sujet
- Un sous-titre ne doit JAMAIS être réutilisable tel quel sur un autre sujet juridique
- Les 9 sous-titres (ou plus) des 3 posts d'une même génération sont tous différents

EXEMPLES de sous-titres bien construits (pour calibrage de style, ne pas recopier) :

Sujet « Licenciement pour faute grave » :
  "Faute grave, faute lourde" / "Le bureau vidé en 48 h" / "Ce qui sauve les indemnités"
  "Un SMS au mauvais moment" / "Conseil de prud'hommes saisi" / "Pourquoi il a gagné en appel"

Sujet « Droit de rétractation » :
  "Quatorze jours, deux exceptions" / "Le bouton qu'on ne voit pas" / "Une LRAR vaut mieux"
  "Le piège du sur-mesure" / "Pas de retour sur commande personnalisée" / "Trois réflexes avant de cliquer"

Sujet « Rupture brutale relations commerciales » :
  "Dix ans de partenariat" / "Un email, trois lignes" / "Le préavis selon les juges"

RÈGLES FORMELLES : s'appliquent aux 3 posts :

- Ton souhaité : ${ton}

ACCROCHE (priorité absolue) :
La première ligne est l'accroche. Elle détermine si le lecteur lit la suite. Elle doit :
- Faire entre 8 et 12 mots, pas un mot de plus.
- Être tirée OBLIGATOIREMENT d'un de ces 4 leviers, jamais une formule générique :
  (a) un chiffre, un délai ou un seuil légal extrait du sujet
  (b) une énumération sèche de 2 à 3 mots séparés par un point (ex : "Bail. Loyer. Préavis.")
  (c) une question fermée provocante en 8 mots maximum (compte dans la limite)
  (d) un fait juridique méconnu, introduit sans préambule
- Les 3 posts doivent utiliser 3 leviers d'accroche différents parmi (a, b, c, d).
- Après l'accroche : 1 ligne vide avant le premier bloc. L'accroche ne fait pas partie d'un bloc.

AÉRATION ET LONGUEUR :
- Longueur cible : 180 à 220 mots par post (hors accroche).
- 2 à 3 blocs maximum (pas 4) pour tenir dans cette longueur.
- Chaque bloc : 3 à 5 phrases courtes, voix active.
- Un seul saut de ligne entre les blocs. Pas de phrase-fleuve.

AUTRES RÈGLES :
- Citer au moins UN élément précis tiré du sujet : délai légal chiffré, seuil en euros, nom de procédure ou juridiction compétente. ÉVITER les numéros d'articles numérotés sauf références majeures connues du grand public. En cas de doute : "selon le Code de la consommation", "le droit du travail prévoit que...". Ne jamais inventer une référence.
- Aucun emoji, aucun symbole décoratif. Aucun caractère en tête de sous-titre : le sous-titre commence directement par le texte, sans tiret ni puce.
- INTERDIT ABSOLU : le caractère tiret long « — » (em dash) est interdit partout dans le texte des posts. Remplacer par une virgule, un point, ou reformuler la phrase.
- Aucune formule auto-promotionnelle, aucune comparaison avec d'autres avocats.
- Appel à consultation en clôture du post, formulé DIFFÉREMMENT dans chaque post (ne jamais réutiliser une formule sur 2 posts d'une même génération).
- Aucun hashtag.`
}

export const FAQ_STYLE_RULES = `RÈGLES FAQ :
- 5 questions concrètes qu'un justiciable se pose réellement sur le sujet
- Réponses pédagogiques de 2 à 3 phrases, sans avis juridique personnalisé
- Aucun emoji, aucun tiret long (« — »)
- Ton sobre et accessible, cohérent avec les posts`

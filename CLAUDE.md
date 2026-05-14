@AGENTS.md

# Lexavo (lexcontent) — Contexte projet

SaaS qui transforme un sujet juridique ou un article existant en posts LinkedIn,
FAQ et image éditoriale pour avocats français. Site déployé sur https://www.lexavo.fr.

## Stack

- **Next.js 16.2 App Router** (React 19). Pas de Pages Router. `proxy.ts` à la
  racine remplace `middleware.ts` (rebranding Next 16). Lis
  `node_modules/next/dist/docs/` avant tout changement framework — l'API a
  cassé sur plusieurs points par rapport à Next 14/15.
- **Tailwind 4** (config dans `postcss.config.mjs`, pas de `tailwind.config.js`).
- **Supabase** (Postgres + Auth + Storage) via `@supabase/ssr`. Client serveur :
  `lib/supabase/server.ts`. Client navigateur : `lib/supabase/client.ts`.
  Middleware de session : `lib/supabase/middleware.ts` appelé depuis `proxy.ts`.
- **Stripe** pour l'abonnement (`pro` 69 €/mois, `cabinet` 149 €/mois).
- **Anthropic SDK** (`claude-sonnet-4-6`) pour le texte, **OpenAI**
  (`gpt-image-1`) pour les images.
- **Resend** pour les e-mails transactionnels.
- **Make** côté client : chaque cabinet renseigne son `make_webhook_url` pour
  publier sur ses réseaux ; on n'orchestre pas la publication nous-mêmes.
- Déploiement **Vercel** (`vercel --prod` depuis le repo, alias actif sur
  `www.lexavo.fr`). Cron unique : `/api/cron/publish-due` toutes les 5 min
  (`vercel.json`).

## Modèle métier

- Un `user` Supabase → un ou plusieurs `cabinets` (UI utilise toujours le
  premier par `created_at`).
- Un cabinet a un `plan` : `trial` | `pro` | `cabinet` (voir `types/index.ts`).
- **Quota trial : 10 générations totales par cabinet.** Vérifié avant et
  re-vérifié juste avant insert pour éviter les races (verrou en mémoire
  `inProgress` par cabinet_id dans les routes de génération).
- Une `generation` contient : 3 posts LinkedIn (angles pédagogique / cas
  pratique / conseil), 5 entrées FAQ, 1 image conceptuelle stockée dans le
  bucket Supabase `images`. Statuts : `brouillon` | `publie` | `programme`.
- Le plan `cabinet` autorise jusqu'à 3 membres (`MAX_MEMBRES_PAR_PLAN`).

## Arborescence

- `app/` — App Router. Pages publiques (`/`, `/cgv`, `/mentions-legales`…),
  auth (`/login`, `/update-password`), `/onboarding`, `/paiement`,
  `/preview/[token]`, `/dashboard/*`.
- `app/api/`
  - `article-to-linkedin/` — génère posts/FAQ/image à partir d'un texte
  - `fetch-article-url/` — récupère un article depuis une URL (cheerio)
  - `generate/` — génération à partir d'un thème
  - `publish/`, `content/`, `calendrier/` — gestion des contenus
  - `stripe/checkout`, `stripe/portal`, `webhooks/stripe`
  - `cron/publish-due` — exécuté par Vercel Cron
  - `auth/signup`, `account/`, `equipe/`, `email/bienvenue`, `update-webhook`,
    `contact`
- `components/dashboard/` — UI authentifiée (formulaires, listes, modales).
- `components/landing/`, `components/onboarding/`, `components/pricing/` — UI
  publique.
- `components/ui/` — primitives Tailwind (button, input, select). Pas de
  shadcn installé, pas de design system externe.
- `lib/supabase/{client,server,middleware}.ts`, `lib/email.ts`,
  `lib/constants.ts`, `lib/utils.ts`.
- `types/index.ts` — source de vérité pour `Plan`, `Cabinet`, `Generation`,
  `PostLinkedin`, `FaqItem`, `ImagesByStyle`, etc.
- `supabase-schema.sql` + `supabase-migration-v2.sql` … `v9.sql` — historique
  des migrations. Toute évolution de schéma passe par un nouveau fichier
  `supabase-migration-vN.sql`, jamais par modification d'un fichier existant.

## Conventions UI

- Charte navy-900 (#0F1B3D environ) + ocre + off-white. Police Geist (next/font).
- Ton sobre, professionnel, juridique. Aucun emoji dans les écrans produit.
- Tailwind direct dans le JSX, pas de styles globaux ad hoc (sauf
  `app/globals.css`).
- Composants client préfixés `'use client'`. Préférer pages serveur qui
  redirigent (`redirect('/login')`) puis injectent un composant client.

## Règles déontologiques produit (barreau français)

Les prompts LLM et les UI **ne doivent jamais** :
- promettre un résultat juridique
- comparer le cabinet à des confrères
- omettre l'appel à consultation en fin de post LinkedIn

Les prompts en place dans `app/api/article-to-linkedin/route.ts` et
`app/api/generate/route.ts` encodent déjà ces contraintes — ne pas les
affaiblir lors d'un refactor.

Règle temporelle : ne jamais mentionner une année pour désigner "aujourd'hui"
ou "actuellement" — utiliser "actuellement", "en vigueur", "à ce jour". Les
années restent autorisées pour citer un texte précis ou une date historique.

## À ne pas casser

- **Quota trial** : double check (avant génération + juste avant insert).
- **Verrou `inProgress`** par cabinet_id sur les routes de génération.
- **Migrations SQL** : append-only, jamais modifier une migration déjà
  appliquée en prod.
- **Webhook Stripe** (`app/api/webhooks/stripe`) : pas de changement sans
  tester en mode Stripe CLI/test.
- **Headers de sécurité** dans `next.config.ts` (X-Frame-Options DENY, etc.).
- **`remotePatterns`** images : si on change le bucket Supabase, mettre à jour
  `next.config.ts`.

## Variables d'environnement attendues

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`,
  `NEXT_PUBLIC_STRIPE_PRICE_PRO`, `NEXT_PUBLIC_STRIPE_PRICE_CABINET`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_CALENDLY_URL` (fallback dans `lib/constants.ts`)
- `CRON_SECRET` (vérifié dans `/api/cron/publish-due`)

Synchroniser avec Vercel via `vercel env pull .env.local`.

## Commandes utiles

```bash
npm run dev           # serveur dev (http://localhost:3000)
npm run build         # build prod local
npm run lint          # eslint
npx tsc --noEmit      # type-check
vercel --prod         # déploiement production (alias www.lexavo.fr)
```

@AGENTS.md

# Lexavo (lexcontent) — Contexte projet

Site vitrine de **Lexavo, création de sites internet pour avocats** (offre de
service, pas de logiciel). Déployé sur https://www.lexavo.fr. L'ancien SaaS de
génération de posts LinkedIn a été retiré en novembre 2026 (historique git :
commit « chore: retrait de la fonctionnalité Équipe » et précédents).

Le projet héberge aussi l'**API de la veille juridique** (newsletter
« Veille Lexavo ») : le site d'inscription est sur veille.lexavo.fr et appelle
les routes `/api/veille/*` de ce projet.

## Stack

- **Next.js 16.2 App Router** (React 19). Lis `node_modules/next/dist/docs/`
  avant tout changement framework — l'API a cassé sur plusieurs points par
  rapport à Next 14/15 (ex. `searchParams` est une Promise).
- **Tailwind 4** (config dans `postcss.config.mjs`).
- **Resend** pour les e-mails (formulaire de devis, veille).
- **Supabase** (`@supabase/supabase-js`, clé service role) uniquement pour la
  liste d'abonnés de la veille (`lib/veille/depot-supabase.ts`).
- Déploiement **Vercel** via Git Integration : `git push` sur `main` →
  production ; autre branche → preview. Plus aucun cron.

## Arborescence

- `app/page.tsx` — landing (hero, pourquoi, méthode, déontologie, forfaits,
  FAQ, encart veille, CTA).
- `app/contact/` — formulaire de demande de devis (`?forfait=<id>`
  présélectionne un forfait) → `app/api/contact/route.ts` (Resend vers
  `ADMIN_EMAIL`).
- `app/cgv`, `app/mentions-legales`, `app/politique-confidentialite`.
- `lib/offre.ts` — **source unique des forfaits, prix, délais et maintenance**.
  Utilisée par la landing, la page contact et les CGV.
- `app/api/veille/*` + `lib/veille/*` — veille juridique (tests :
  `npm test`). Ne pas casser : des abonnés réels en dépendent.
- `components/landing/` — nav, footer, FAQ accordéon, animations, encart veille.
- `next.config.ts` — headers de sécurité + redirections 308 des anciennes
  routes du SaaS (`/login`, `/dashboard`…) vers `/`.
- `supabase-*.sql` — historique des migrations (append-only).

## Conventions UI et contenu

- Palette éditoriale navy `#0F2247` + or `#B8872A` + papier `#F3EFE5`.
  Polices via `next/font` (variables `--font-instrument-serif`,
  `--font-jetbrains-mono`, `--font-inter`). Classes CTA dans `globals.css`
  (`ed-cta-primary`, `ed-cta-outlined`, `ed-cta-ghost`, `landing-nav-cta`).
- Ton sobre, professionnel. Aucun emoji.
- Pas de faux témoignages, fausses références ou chiffres inventés.
- Déontologie : ne jamais promettre de résultat (clients, position Google), ni
  affirmer une conformité « garantie » — l'avocat valide et reste responsable
  de sa communication (RIN art. 10).
- Règle temporelle : ne jamais écrire une année pour dire « aujourd'hui ».

## Variables d'environnement attendues

- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `ADMIN_EMAIL`
- `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (veille)
- Variables propres à la veille : voir `lib/veille/` (`VEILLE_BASE_URL`…)

## Commandes utiles

```bash
npm run dev           # serveur dev (http://localhost:3000)
npm run build         # build prod local
npm run lint          # eslint
npm test              # tests de la veille
npx tsc --noEmit      # type-check
```

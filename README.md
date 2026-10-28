# LUXE Ecommerce

This repository is an npm-workspaces monorepo deployed as **one Vercel project**:

- `Project link/Ecommerce` — React and Vite storefront
- `Project link/EcomBackend` — Express API and PostgreSQL database access
- `api/[...path].js` — Vercel function that routes `/api/*` requests to Express

## Deploy to Vercel

1. Import `Navadeep-07x18/Online_Ecommerce_website` as one Vercel project.
2. Set **Root Directory** to the repository root (`.`).
3. Use **Other** as the framework preset.
4. Keep the default install command (`npm install`). Set:
   - **Build Command:** `npm run build`
   - **Output Directory:** `Project link/Ecommerce/dist`
5. Connect your Supabase project using the Vercel Supabase integration. Make
   sure it provides a PostgreSQL connection URI to this Vercel project. The API
   recognizes `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`, and
   `SUPABASE_DB_URL`. If the integration uses a different variable name, add
   `DATABASE_URL` in Vercel with the Supabase **Transaction pooler** URI.
6. Add these environment variables to Vercel:

   | Variable | Value |
   | --- | --- |
   | `TOKEN_SECRET` | A long, random secret |
   | `ADMIN_EMAIL` | Email address for the store administrator |
   | `ADMIN_PASSWORD` | A strong, unique password |
   | `DB_POOL_MAX` | `1` (optional; this is also the default) |

   The Supabase integration supplies the database URL. Do not set `CORS_ORIGIN`
   or `VITE_API_BASE_URL`; the storefront and API use the same domain. Do not
   set `PORT`; Vercel manages it.
7. Deploy. The API creates its tables and seeds demo products on its first
   request. Check `https://YOUR-VERCEL-DOMAIN/api/health`; a working deployment
   returns `{"ok":true,"database":true}`.

Keep the database URL and admin secrets in Vercel's environment settings, not
in Git or the browser bundle. Do not use the local XAMPP/phpMyAdmin MySQL
database: the deployed API uses PostgreSQL.

## Local development

Install dependencies once from the repository root:

```sh
npm install
```

Create `Project link/EcomBackend/.env` from
`Project link/EcomBackend/.env.example` and set a local PostgreSQL connection
URI. Then run the API and frontend in separate terminals from the repository
root:

```sh
npm run dev:api
```

```sh
npm run dev:web
```

Vite proxies `/api` requests to the local API at `http://127.0.0.1:5000`.

## Checks

```sh
npm test
npm run lint
npm run build
```

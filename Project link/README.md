# Deploy LUXE on Vercel

The repository contains two Vercel projects in one GitHub repository: the Vite
frontend and the Express API. The backend uses PostgreSQL. For a new Vercel
deployment, the Vercel Marketplace's Neon Postgres integration can create and
connect the database directly.

## 1. Create and connect a PostgreSQL database

In Vercel, add the **Neon Postgres** integration from the Marketplace and
create a database. Connect it to the Vercel project whose root directory is
`Project link/EcomBackend`, enabling the Production environment. The integration
provides a `DATABASE_URL` connection string to that project.

Alternatively, create a PostgreSQL database with another hosted provider and
add its connection string as the `DATABASE_URL` environment variable in the API
project. Do not use a local XAMPP/MySQL database as the production database;
this backend now requires PostgreSQL.

Vercel Functions do not have fixed outbound IPs by default. Check whether your
database provider and Vercel plan support static egress or private connectivity.
For public connections, enable TLS and use the provider's recommended
connection-string settings.

## 2. Deploy the API

Import `Navadeep-07x18/Online_Ecommerce_website` as a new Vercel project. Set
its **Root Directory** to `Project link/EcomBackend`; Vercel detects the
Express API. Add these environment variables to the API project's Production
environment before deploying:

| Variable | Value |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string supplied by Neon or your database provider |
| `TOKEN_SECRET` | A long, random secret |
| `ADMIN_EMAIL` | Email address for the first admin account |
| `ADMIN_PASSWORD` | A strong, unique admin password |
| `CORS_ORIGIN` | The frontend's exact origin, e.g. `https://your-store.vercel.app` |

If using a provider other than Neon, its settings can instead be supplied using
`DB_HOST`, `DB_PORT` (default `5432`), `DB_USER`, `DB_PASSWORD`, `DB_NAME`
(default `luxe_store`), and `DB_SSL=true` when TLS is required. `DB_POOL_MAX`
can optionally limit the pool size. Do not set `PORT` on Vercel; the platform
manages it.

Keep the database URL, admin password, and token secret in Vercel environment
settings, never in source control or any `VITE_` variable. The API initializes
its tables and demo products on its first request.

Copy the API deployment origin, such as `https://your-api.vercel.app`.

## 3. Deploy the frontend

Import the same GitHub repository as a second Vercel project. Set its
**Root Directory** to `Project link/Ecommerce`. Set the environment variable
`VITE_API_BASE_URL` to the API URL followed by `/api`, e.g.
`https://your-api.vercel.app/api`, then deploy.

After deployment, set `CORS_ORIGIN` on the API project to the frontend's exact
Vercel origin (scheme and hostname only, with no trailing slash) and redeploy
the API. Add the variable to Production, and to Preview if needed.

## Local development

Install and run PostgreSQL locally, create the `luxe_store` database, and create
`EcomBackend/.env` from `.env.example` with your local PostgreSQL connection
string. Start the API with `npm start` in `EcomBackend`; start the Vite
frontend with `npm run dev` in `Ecommerce`. Vite proxies `/api` requests to
`http://127.0.0.1:5000` by default.

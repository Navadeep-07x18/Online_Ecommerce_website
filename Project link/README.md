# Deploy LUXE on Vercel

The repository contains two Vercel projects in one GitHub repository: the Vite
frontend and the Express API. The API uses MySQL for products, accounts,
addresses, and orders, so you also need a hosted MySQL database. Vercel does
not provide a MySQL database with this app.

## 1. Create a hosted MySQL database

Create a MySQL database with a provider that accepts connections from Vercel.
Record its host, port, database name, username, and password. If the provider
requires TLS, set `DB_SSL` to `true`. For example, TiDB Cloud Starter supports
MySQL-compatible public connections with required TLS; follow its
[connection guide](https://docs.pingcap.com/tidbcloud/connect-to-tidb-cluster-serverless/)
to get the connection details.

Vercel Functions do not have fixed outbound IPs by default. Before choosing a
database firewall rule, check whether your provider and Vercel plan support
static egress or private connectivity. Avoid opening a production database to
all IP addresses; if you use a public endpoint, use TLS and a strong,
dedicated database password.

## 2. Deploy the API

In Vercel, import `Navadeep-07x18/Online_Ecommerce_website` as a new project.
Set its **Root Directory** to `Project link/EcomBackend` and deploy it as an
Express project. Add these environment variables before deploying:

| Variable | Value |
| --- | --- |
| `DB_HOST` | Hosted MySQL host |
| `DB_PORT` | Hosted MySQL port, usually `3306` |
| `DB_USER` | MySQL username |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | MySQL database name |
| `DB_SSL` | `true` if the provider requires TLS; otherwise `false` |
| `TOKEN_SECRET` | A long, random secret |
| `ADMIN_EMAIL` | Email address for the first admin account |
| `ADMIN_PASSWORD` | A strong, unique admin password |
| `CORS_ORIGIN` | The frontend's exact origin, e.g. `https://your-store.vercel.app` |

Do not set `PORT` on Vercel; the platform manages it. Keep database and admin
credentials and `TOKEN_SECRET` in Vercel environment settings, not in source
control or any `VITE_` variable. The API initializes its tables and demo
products when it receives its first request.

Copy the API deployment origin, such as `https://your-api.vercel.app`.

## 3. Deploy the frontend

Import the same GitHub repository as a second Vercel project. Set its
**Root Directory** to `Project link/Ecommerce`. Set the environment variable
`VITE_API_BASE_URL` to the API URL followed by `/api`, e.g.
`https://your-api.vercel.app/api`, then deploy.

After deployment, set `CORS_ORIGIN` on the API project to the frontend's exact
Vercel origin (scheme and hostname only, with no trailing slash) and redeploy
the API. Add the variable to both Vercel projects' Production environments;
add it to Preview as needed.

## Local development

Create `EcomBackend/.env` from `EcomBackend/.env.example` and set your MySQL
credentials. Start the API with `npm start` in `EcomBackend`; start the Vite
frontend with `npm run dev` in `Ecommerce`. Vite proxies `/api` requests to
`http://127.0.0.1:5000` by default.

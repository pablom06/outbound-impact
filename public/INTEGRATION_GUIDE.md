# Outbound Impact - Developer Integration Guide

Complete guide for deploying and integrating the Outbound Impact Dashboard Platform on Railway.

---

## Architecture Overview

```
Frontend (React/Vite)  →  Backend (Node.js/Express)  →  PostgreSQL
       ↑                          ↓                        ↑
    Railway                  Bunny.net CDN            Railway
                                  ↓
                            SendGrid (email)
```

All services deploy on **Railway** (frontend, backend, and database in one project):

- **Frontend:** React 18 + Vite + Tailwind CSS → Railway (static site or Node serve)
- **Backend:** Node.js/Express server → Railway
- **Database:** PostgreSQL → Railway (same project)
- **File Storage:** Bunny.net CDN (uploads, thumbnails, media)
- **Email:** SendGrid (internal messaging + external email + inbound parse)

---

## Step 1: Railway Project Setup

### Create Project and Database

1. Sign up at [railway.app](https://railway.app)
2. Click **New Project** → **Provision PostgreSQL**
3. This creates your project with a PostgreSQL service
4. Go to the PostgreSQL service → **Variables** tab
5. Copy the `DATABASE_URL` (format: `postgresql://postgres:PASSWORD@HOST:PORT/railway`)

### Run Database Migrations

Run migrations in order from the `backend/migrations/` folder:

```bash
# Set your DATABASE_URL
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:PORT/railway"

# Option 1: Run the migration script
cd backend
node run-migration.js

# Option 2: Run migrations manually via psql
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_add_bytea_storage.sql
psql $DATABASE_URL -f migrations/002_oi_admin_tables.sql
psql $DATABASE_URL -f migrations/003_add_personal_tier.sql
psql $DATABASE_URL -f migrations/004_discount_codes.sql
```

### Database Tables Created

| Table | Purpose |
|-------|---------|
| `organizations` | Company accounts with plan tiers and limits |
| `users` | User accounts linked to organizations |
| `uploaded_files` | File metadata, storage URLs, thumbnails |
| `qr_codes` | QR codes linked to uploaded files |
| `qr_scan_events` | Scan analytics (device, location, timestamp) |
| `campaigns` | Marketing campaign groupings |
| `activity_log` | Audit trail of all user actions |
| `oi_admin_users` | Internal admin accounts (separate from customer users) |
| `discount_codes` | Promo/reseller discount codes |
| `discount_code_usage` | Tracks which orgs used which codes |

### Plan Tiers & Limits

The database trigger `set_organization_limits()` automatically sets limits on insert:

| Plan | Max Users | Max QR Codes | Storage | Price |
|------|-----------|-------------|---------|-------|
| Personal | 1 | 3 | 5 GB | Free |
| Small Business | 3 | 5 | 250 GB | Free |
| Medium Business | Unlimited | Unlimited | 500 GB | $29/mo |
| Enterprise | Unlimited | Unlimited | 1 TB | $99/mo |

---

## Step 2: Bunny.net Setup (File Storage)

### Create Storage Zone

1. Sign up at [bunny.net](https://bunny.net)
2. Go to **Storage** → **Add Storage Zone**
3. Name it (e.g., `outbound-impact-files`)
4. Select your preferred region
5. Copy your **Storage API Key** from the zone settings

### Create Pull Zone (CDN)

1. Go to **CDN** → **Add Pull Zone**
2. Name it (e.g., `outbound-impact-cdn`)
3. Set **Origin Type** to **Storage Zone** and select your zone
4. Copy the **Pull Zone URL** (e.g., `https://outbound-impact-cdn.b-cdn.net`)

### How File Storage Works

When a user uploads a file:

1. File is sent to the backend via `POST /upload/file`
2. Backend uploads to Bunny.net Storage Zone via HTTPS PUT
3. CDN URL is stored in `uploaded_files.storage_url`
4. When accessed, users are redirected to the Bunny CDN URL (301 redirect)
5. If Bunny is not configured, falls back to PostgreSQL BYTEA storage (dev mode)

### Environment Variables for Bunny

```
BUNNY_STORAGE_ZONE=outbound-impact-files
BUNNY_API_KEY=your-storage-zone-api-key
BUNNY_CDN_URL=https://outbound-impact-cdn.b-cdn.net
BUNNY_STORAGE_REGION=            # Leave empty for default (Falkenstein), or: ny, la, sg, syd
```

---

## Step 3: SendGrid Setup (Email)

The platform uses SendGrid for three email features:

### A. External Email (Outbound)

Allows dashboard users to send emails to external recipients from within the platform.

1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Go to **Settings** → **API Keys** → Create API Key (Full Access)
3. Go to **Settings** → **Sender Authentication** → Verify your sending domain
4. Set environment variables:

```
SENDGRID_API_KEY=SG.your-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

### B. Internal Messaging

Team messages between users within an organization. These are stored in the database and displayed in the dashboard messaging tab. No additional SendGrid setup needed beyond the API key.

### C. Inbound Email (Receiving)

Allows the platform to receive email replies and route them to the correct organization inbox.

1. In SendGrid, go to **Settings** → **Inbound Parse**
2. Click **Add Host & URL**
3. Set:
   - **Receiving Domain:** `parse.yourdomain.com` (add MX record pointing to `mx.sendgrid.net`)
   - **Destination URL:** `https://your-backend.up.railway.app/webhooks/inbound-email`
   - Check **POST the raw, full MIME message**
4. Add DNS MX record for your subdomain:
   - Type: `MX`
   - Host: `parse` (or your chosen subdomain)
   - Value: `mx.sendgrid.net`
   - Priority: `10`

### Email Features by Plan

| Feature | Personal | Small Biz | Medium Biz | Enterprise |
|---------|----------|-----------|------------|------------|
| Internal messages | Yes | Yes | Yes | Yes |
| External email | No | No | Yes | Yes |
| Inbound parse | No | No | Yes | Yes |
| Email templates | No | No | No | Yes |

---

## Step 4: Backend Deployment (Railway)

The backend has two entry points. For Railway, use the standard Express server (`backend/src/index.js`) instead of the Vercel serverless function.

### Deploy Backend to Railway

1. In your Railway project, click **New** → **GitHub Repo**
2. Connect your GitHub account and select this repository
3. Railway will detect the project. Set:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
4. Go to **Variables** tab and add:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}    # Railway auto-links if PostgreSQL is in same project
JWT_SECRET=generate-a-random-64-char-string
BUNNY_STORAGE_ZONE=your-zone-name
BUNNY_API_KEY=your-api-key
BUNNY_CDN_URL=https://your-zone.b-cdn.net
SENDGRID_API_KEY=SG.your-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
CORS_ORIGIN=https://your-frontend.up.railway.app
NODE_ENV=production
PORT=3001
```

5. Go to **Settings** → **Networking** → **Generate Domain** (creates a `*.up.railway.app` URL)
6. Copy the generated URL — this is your backend API URL

### Linking Database Automatically

If your PostgreSQL service is in the same Railway project, you can reference it with Railway's variable references:

- In the backend service Variables, set: `DATABASE_URL = ${{Postgres.DATABASE_URL}}`
- Railway automatically injects the correct connection string

### Backend Entry Points

| File | Purpose | Use For |
|------|---------|---------|
| `backend/src/index.js` | Standard Express server | **Railway deployment** |
| `backend/api/index.js` | Vercel serverless function | Vercel deployment (legacy) |

Both files contain the same routes and logic. Use `src/index.js` for Railway since it runs as a persistent Node.js process (not serverless).

### Backend API Structure

| Category | Endpoints | Auth |
|----------|-----------|------|
| **Auth** | `POST /auth/login`, `POST /auth/register`, `GET /auth/me` | Public / JWT |
| **Upload** | `POST /upload/file`, `POST /upload/text`, `POST /upload/embed` | JWT |
| **Files** | `GET /files/:id`, `GET /files/:id/thumbnail` | Public |
| **Items** | `GET /items`, `PUT /items/:id`, `DELETE /items/:id` | JWT |
| **QR Codes** | `GET /items/public/:slug` (public scan endpoint) | Public |
| **Dashboard** | `GET /dashboard/stats`, `GET /dashboard/activity` | JWT |
| **Analytics** | `GET /analytics`, `GET /analytics/advanced` | JWT |
| **Messages** | `GET /messages`, `POST /messages/internal`, `POST /messages/external` | JWT |
| **Campaigns** | CRUD on `/campaigns` | JWT |
| **Admin** | All `/admin/*` routes | Admin JWT |
| **Webhooks** | `POST /webhooks/inbound-email` | SendGrid |

### Create First Admin User

```bash
cd backend
DATABASE_URL="your-connection-string" node scripts/create-admin.js admin@yourdomain.com YourPassword "Admin Name" super_admin
```

Or hit the one-time setup endpoint:
```
POST https://your-backend.up.railway.app/admin/setup
{
  "email": "admin@yourdomain.com",
  "password": "YourPassword",
  "fullName": "Admin Name"
}
```

---

## Step 5: Frontend Deployment (Railway)

### Option A: Static Site on Railway (Recommended)

1. In the same Railway project, click **New** → **GitHub Repo** (same repo, second service)
2. Set:
   - **Root Directory:** `.` (root of the repo — the frontend)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx serve dist -s -l 3000`
3. Add environment variable:

```
VITE_API_BASE_URL=https://your-backend-service.up.railway.app
```

4. Go to **Settings** → **Networking** → **Generate Domain**
5. This is your frontend URL — share this link

> **Note:** The `VITE_API_BASE_URL` variable must be set BEFORE building. Vite bakes environment variables into the build at compile time. If you change it, redeploy.

### Option B: Nixpacks Auto-Detect

Railway's Nixpacks builder can auto-detect Vite projects:

1. Add a `nixpacks.toml` to the repo root (Railway reads this automatically):

```toml
[phases.build]
cmds = ["npm install", "npm run build"]

[start]
cmd = "npx serve dist -s -l ${PORT:-3000}"
```

2. Railway will build and serve automatically

### Frontend Structure

- `App.jsx` → Renders `DashboardSwitcher`
- `DashboardSwitcher.jsx` → Dropdown to switch between dashboard tiers
- `Dashboard_Personal.jsx` → Personal tier view
- `Dashboard_SmallBusiness.jsx` → Small Business tier view
- `Dashboard_MediumBusiness.jsx` → Medium Business tier view
- `Dashboard_Enterprise.jsx` → Enterprise tier view
- `Dashboard_OIAdmin.jsx` → Internal admin dashboard (all customer data)
- `services/api.js` → Axios HTTP client configured for the backend

### Update CORS After Frontend Deploy

Once you have the frontend URL, go back to the backend service Variables and update:

```
CORS_ORIGIN=https://your-frontend.up.railway.app
```

---

## Step 6: User Registration Flow

### How Sign-Up Works

1. User visits the frontend
2. Clicks **Sign Up** → fills in email, password, full name, company name
3. Backend creates:
   - An `organization` record (defaults to `personal` plan)
   - A `user` record linked to that organization (role: `Owner`)
4. Returns JWT token → stored in `localStorage`
5. User is logged into their dashboard

### How Plan Upgrades Work

1. User goes to **Settings** → **Billing** tab in their dashboard
2. Selects a new plan tier
3. Frontend calls `PATCH /admin/customers/:id/plan` (or subscription API)
4. Database trigger automatically updates limits (QR codes, users, storage)

---

## Step 7: Custom Domain (Optional)

### Using Cloudflare for DNS

1. Buy a domain (e.g., Namecheap, GoDaddy)
2. Add it to [Cloudflare](https://cloudflare.com) (free plan works)
3. In Railway, go to your service → **Settings** → **Networking** → **Custom Domain**
4. Enter your domain (e.g., `app.yourdomain.com` for frontend, `api.yourdomain.com` for backend)
5. Railway provides a CNAME target. In Cloudflare, add:
   - Type: `CNAME`
   - Name: `app` (or `api`)
   - Target: the value Railway provides
6. Set Cloudflare proxy to **DNS only** (gray cloud) for Railway compatibility
7. Update `CORS_ORIGIN` in the backend to match your custom frontend domain

---

## Railway Project Structure

Your Railway project should have **3 services** in a single project:

```
Railway Project: "Outbound Impact"
├── PostgreSQL          (database)
├── Backend Service     (Node.js/Express, root: backend/)
│   └── Uses: ${{Postgres.DATABASE_URL}}
└── Frontend Service    (Vite static, root: ./)
    └── Uses: VITE_API_BASE_URL pointing to backend
```

All three share the same project and can reference each other's variables.

---

## Environment Variables Summary

### Backend (Railway Service Variables)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `${{Postgres.DATABASE_URL}}` (auto-linked) |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens (64+ chars) |
| `BUNNY_STORAGE_ZONE` | Yes | Bunny.net storage zone name |
| `BUNNY_API_KEY` | Yes | Bunny.net storage API key |
| `BUNNY_CDN_URL` | Yes | Bunny.net pull zone URL |
| `BUNNY_STORAGE_REGION` | No | Storage region (empty = default) |
| `SENDGRID_API_KEY` | No* | SendGrid API key for email |
| `SENDGRID_FROM_EMAIL` | No* | Verified sender email address |
| `CORS_ORIGIN` | Yes | Frontend Railway URL |
| `NODE_ENV` | Yes | Set to `production` |
| `PORT` | Yes | Set to `3001` (Railway assigns dynamically, but set a default) |

*Email features work in demo mode without SendGrid (messages saved but not actually sent)

### Frontend (Railway Service Variables)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes | Backend Railway URL (e.g., `https://backend.up.railway.app`) |

---

## Cost Breakdown (All on Railway)

| Service | Free Tier | Estimated Monthly Cost |
|---------|-----------|----------------------|
| Railway (PostgreSQL + Backend + Frontend) | $5 credit/mo | ~$5-15/mo |
| Bunny.net (Storage + CDN) | Pay-as-you-go | ~$1-5/mo |
| SendGrid | 100 emails/day free | $0-20/mo |
| Cloudflare (DNS) | Free plan | $0 |
| **Total** | | **~$6-40/mo** |

Railway's $5/month Trial plan includes 500 hours of execution. The Pro plan ($5/mo + usage) removes limits and provides better uptime for production.

---

## Troubleshooting

### "Cannot connect to database"
- Verify `DATABASE_URL` is set correctly (use `${{Postgres.DATABASE_URL}}` for auto-linking)
- Check PostgreSQL service is running in Railway dashboard
- Ensure SSL is enabled: `ssl: { rejectUnauthorized: false }`

### "File upload fails"
- Verify Bunny.net credentials are set
- Check storage zone name matches exactly
- Without Bunny config, uploads fall back to BYTEA (database storage)

### "Emails not sending"
- Verify `SENDGRID_API_KEY` is set
- Verify sender email is authenticated in SendGrid
- Without SendGrid, messages save to database but don't actually send (demo mode)

### "CORS error"
- Set `CORS_ORIGIN` to your frontend URL (include `https://`)
- If testing locally, set to `http://localhost:5173`
- After deploying frontend, update backend `CORS_ORIGIN` to match

### "Frontend shows blank / API errors"
- `VITE_API_BASE_URL` must be set BEFORE building (Vite bakes it in at build time)
- Redeploy after changing the variable
- Check the backend URL is correct and accessible

### "Railway build fails"
- Ensure **Root Directory** is set correctly (`backend` for backend, `.` for frontend)
- Check that `package.json` exists in the root directory
- For frontend: install `serve` as a dependency or use `npx serve`

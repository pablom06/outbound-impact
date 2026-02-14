# Database Architecture & Deployment Guide

Complete guide for the Outbound Impact multi-tenant dashboard platform.

---

## Architecture Overview

```
Users
  |
  v
[Cloudflare DNS] --- outboundimpact.net
  |
  v
[Railway] --- Backend API (Node.js/Express) + PostgreSQL Database
  |
  v
[Bunny.net CDN] --- File storage (images, videos, PDFs)
```

| Service | Purpose | What It Stores |
|---------|---------|----------------|
| **Railway** | Backend API + PostgreSQL database | Users, organizations, analytics, metadata, QR scan events |
| **Bunny.net** | File storage + CDN delivery | Images, videos, PDFs, audio files |
| **Cloudflare** | DNS routing | Points outboundimpact.net to Railway |
| **SendGrid** | Email delivery | Outbound emails, retention emails |
| **Vercel** | Demo API hosting (temporary) | Same API code as Railway for testing |

---

## Database: Railway PostgreSQL

All metadata, analytics, and user data lives in PostgreSQL on Railway. Files are stored externally on Bunny.net -- only the CDN URLs are saved in the database.

### Actual Schema (What's Deployed)

The database uses `SERIAL` integer IDs for all tables. Schema is defined across migration files.

---

### Migration 001: Core Tables (`001_initial_schema.sql`)

#### Organizations (Tenants)
Every customer who signs up creates an organization. All their data is scoped to this org.

```sql
CREATE TABLE organizations (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_email VARCHAR(255) NOT NULL UNIQUE,
  plan_type VARCHAR(50) DEFAULT 'personal',   -- personal, small_business, medium_business, enterprise
  status VARCHAR(50) DEFAULT 'active',         -- active, suspended, cancelled
  monthly_price DECIMAL(10,2) DEFAULT 0,
  max_qr_codes INTEGER DEFAULT 3,
  max_contributors INTEGER DEFAULT 1,
  storage_limit_gb INTEGER DEFAULT 1,
  total_qr_scans INTEGER DEFAULT 0,
  total_uploads INTEGER DEFAULT 0,
  subscription_start_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member',    -- owner, admin, member, viewer
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Uploaded Files
Metadata only in production. Actual file binary is on Bunny.net CDN. `storage_url` holds the Bunny CDN link. `file_data` BYTEA column is a fallback for local dev without Bunny.

```sql
CREATE TABLE uploaded_files (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_size_bytes BIGINT DEFAULT 0,
  mime_type VARCHAR(100),
  storage_key VARCHAR(500),
  storage_url TEXT,           -- Bunny CDN URL (e.g. https://your-zone.b-cdn.net/uploads/1/abc123.jpg)
  slug VARCHAR(100) UNIQUE,
  type_category VARCHAR(50),  -- image, video, audio, pdf, file, text, embed
  content_text TEXT,           -- for text posts
  embed_url TEXT,              -- for embed links
  thumbnail_url TEXT,          -- Bunny CDN thumbnail URL
  file_data BYTEA,             -- fallback: raw binary (local dev only)
  thumbnail_data BYTEA,        -- fallback: thumbnail binary (local dev only)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### QR Codes
```sql
CREATE TABLE qr_codes (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_file_id INTEGER REFERENCES uploaded_files(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  total_scans INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### QR Scan Events (Analytics)
Every QR code scan creates a row here. This is the core analytics data.

```sql
CREATE TABLE qr_scan_events (
  id SERIAL PRIMARY KEY,
  qr_code_id INTEGER REFERENCES qr_codes(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_type VARCHAR(50),    -- mobile, desktop, tablet
  os VARCHAR(100),
  browser VARCHAR(100),
  country VARCHAR(100),
  country_code VARCHAR(10),
  city VARCHAR(100),
  state VARCHAR(100),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6)
);
```

#### Campaigns
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Activity Log
```sql
CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

### Migration 002: OI Admin Tables (`002_oi_admin_tables.sql`)

Separate admin user table for Outbound Impact employees. These users see ALL customer data.

```sql
CREATE TABLE oi_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',       -- analyst, admin, super_admin
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  created_by_user_id UUID REFERENCES oi_admin_users(id)
);

CREATE TABLE admin_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES oi_admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  endpoint VARCHAR(500),
  method VARCHAR(10),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Migration 003: Personal Tier (`003_add_personal_tier.sql`)

Adds `is_personal` and `personal_user_id` columns to organizations. Creates a trigger that auto-sets plan limits on insert.

| Plan | Users | QR Codes | Storage | Price |
|------|-------|----------|---------|-------|
| Personal | 1 | 3 | 5 GB | Free |
| Small Business | 3 | 5 | 250 GB | Free |
| Medium Business | Unlimited | Unlimited | 500 GB | $29/mo |
| Enterprise | Unlimited | Unlimited | 1 TB | $99/mo |

---

### Migration 004: Discount Codes (`004_discount_codes.sql`)

```sql
CREATE TABLE discount_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',  -- percentage or fixed
  discount_value DECIMAL(10,2) NOT NULL,
  applicable_plans TEXT[] DEFAULT '{}',
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  reseller_email VARCHAR(255),
  reseller_commission DECIMAL(5,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  starts_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE discount_code_usage (
  id SERIAL PRIMARY KEY,
  discount_code_id INTEGER REFERENCES discount_codes(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  applied_at TIMESTAMP DEFAULT NOW(),
  plan_type VARCHAR(50),
  discount_amount DECIMAL(10,2)
);
```

---

## File Storage: Bunny.net

Files are NOT stored in the database. They go to Bunny.net CDN and only the URL is saved.

### Upload Flow

```
User uploads file
  |
  v
Backend receives file via multer (in memory)
  |
  v
Backend uploads to Bunny.net Storage Zone via PUT request
  |
  v
Bunny returns success --> Backend saves CDN URL in uploaded_files.storage_url
  |
  v
File served globally via Bunny CDN Pull Zone
```

### File Path Structure on Bunny

```
storage-zone/
  uploads/
    {org_id}/
      {timestamp}-{uuid}.{ext}        -- original files
      thumbs/
        {timestamp}-{uuid}.{ext}      -- thumbnails
```

### Environment Variables for Bunny

```env
BUNNY_STORAGE_ZONE=outbound-impact        # Storage Zone name
BUNNY_API_KEY=your-storage-api-key         # Storage Zone > FTP & API Access > Password
BUNNY_CDN_URL=https://outbound-impact.b-cdn.net   # Pull Zone URL
BUNNY_STORAGE_REGION=                      # Empty = EU default, ny/la/sg for other regions
```

### Fallback: BYTEA Storage

If Bunny.net env vars are not set, files fall back to BYTEA binary storage directly in PostgreSQL. This works for local development but should NOT be used in production with 200+ users.

### Cost

| Users | Files | Bunny Storage | Bunny Bandwidth | Monthly Cost |
|-------|-------|---------------|-----------------|-------------|
| 50 | 250 | ~12 GB | ~50 GB | ~$0.62 |
| 200 | 1,000 | ~50 GB | ~200 GB | ~$2.50 |
| 500 | 2,500 | ~125 GB | ~500 GB | ~$6.25 |
| 1,000 | 5,000 | ~250 GB | ~1 TB | ~$12.50 |

---

## Deployment

### Current: Vercel (Demo)

The API runs as a Vercel serverless function at `backend/api/index.js`. This is a single self-contained file with all routes.

### Production: Railway

For production with 200+ users, deploy the backend on Railway.

### Step-by-Step Deployment

#### 1. Railway Setup

1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Add PostgreSQL database (click New > Database > PostgreSQL)
4. Railway auto-provides `DATABASE_URL`

#### 2. Run Migrations

After database is created, run migrations in order. Use the built-in migration endpoints or run SQL directly:

**Option A: Via API endpoints (easiest)**
```
GET /run-migration          -- Creates BYTEA columns (002)
GET /run-admin-migration    -- Creates admin + discount tables
```

**Option B: Via Railway CLI or psql**
```bash
psql $DATABASE_URL -f backend/migrations/001_initial_schema.sql
psql $DATABASE_URL -f backend/migrations/002_add_bytea_storage.sql
psql $DATABASE_URL -f backend/migrations/002_oi_admin_tables.sql
psql $DATABASE_URL -f backend/migrations/003_add_personal_tier.sql
psql $DATABASE_URL -f backend/migrations/004_discount_codes.sql
```

#### 3. Create First Admin User

**Option A: Via API (one-time setup endpoint)**
```
POST /admin/setup
Body: { "email": "admin@outboundimpact.com", "password": "your-secure-password", "full_name": "OI Admin" }
```
This only works once -- when no admin exists yet.

**Option B: Via script**
```bash
DATABASE_URL=your-connection-string node backend/scripts/create-admin.js admin@outboundimpact.com password123 "OI Admin" super_admin
```

#### 4. Set Environment Variables

Add these in Railway dashboard (Settings > Variables):

```env
# Database (auto-provided by Railway)
DATABASE_URL=postgresql://...

# File Storage
BUNNY_STORAGE_ZONE=outbound-impact
BUNNY_API_KEY=your-bunny-storage-password
BUNNY_CDN_URL=https://outbound-impact.b-cdn.net
BUNNY_STORAGE_REGION=

# Auth
JWT_SECRET=a-strong-random-secret-string
OI_ADMIN_SECRET=a-different-strong-secret-for-admin-tokens

# Email
SENDGRID_API_KEY=SG.your-sendgrid-key
SENDGRID_FROM_EMAIL=noreply@outboundimpact.com

# App
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://outboundimpact.net
API_BASE_URL=https://your-railway-url.railway.app
```

#### 5. Set Up Bunny.net

1. Create account at [bunny.net](https://bunny.net)
2. Create Storage Zone (name: `outbound-impact`, region: closest to users)
3. Create Pull Zone (auto-linked to storage zone, gives you CDN URL)
4. Get API key from Storage Zone > FTP & API Access > Password
5. Add credentials to Railway env vars

#### 6. Point Domain

In Cloudflare DNS, add a CNAME record pointing `api.outboundimpact.net` to your Railway deployment URL.

---

## API Endpoints Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user + organization |
| POST | `/auth/login` | User login, returns JWT |
| GET | `/auth/me` | Get current user info |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Upload count, views, QR codes, storage used |
| GET | `/items` | List all items for organization |
| GET | `/activity` | Activity feed |

### File Upload
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload/file` | Upload file to Bunny CDN |
| POST | `/upload/text` | Create text post |
| POST | `/upload/embed` | Create embed link |
| GET | `/files/:id` | Serve file (redirects to Bunny CDN) |
| GET | `/files/:id/thumbnail` | Serve thumbnail |

### Messages
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/messages` | List messages (filter by type) |
| POST | `/messages/internal` | Send internal message |
| POST | `/messages/external` | Send external email via SendGrid |

### OI Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/admin/setup` | None | Create first admin (one-time) |
| POST | `/admin/login` | None | Admin login |
| GET | `/admin/overview` | Admin JWT | Total customers, MRR, churn |
| GET | `/admin/plan-breakdown` | Admin JWT | Revenue by plan type |
| GET | `/admin/customers` | Admin JWT | All customers (filterable) |
| GET | `/admin/customers/:id` | Admin JWT | Single customer detail |
| PATCH | `/admin/customers/:id/plan` | Admin JWT | Change customer plan |
| PATCH | `/admin/customers/:id/status` | Admin JWT | Activate/suspend/cancel |
| GET | `/admin/opportunities/upgrades` | Admin JWT | Upgrade candidates |
| GET | `/admin/opportunities/churn-risk` | Admin JWT | At-risk customers |
| GET | `/admin/opportunities/top-performers` | Admin JWT | Best customers |
| GET | `/admin/geography/top-locations` | Admin JWT | QR scan locations |
| GET | `/admin/geography/device-stats` | Admin JWT | Device breakdown |
| GET | `/admin/revenue/mrr` | Admin JWT | MRR breakdown |
| GET | `/admin/discount-codes` | Admin JWT | List discount codes |
| POST | `/admin/discount-codes` | Admin JWT | Create discount code |
| PATCH | `/admin/discount-codes/:id` | Admin JWT | Update discount code |
| DELETE | `/admin/discount-codes/:id` | Admin JWT | Delete discount code |
| POST | `/admin/retention/send-email` | Admin JWT | Send retention email |
| POST | `/admin/retention/schedule-call` | Admin JWT | Schedule callback |

### Migrations (run once)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/run-migration` | Add BYTEA columns |
| GET | `/run-admin-migration` | Create admin + discount tables |

---

## Data Flow

### User Signs Up
```
POST /auth/register
  > Creates organization (with plan limits auto-set by trigger)
  > Creates user linked to organization
  > Returns JWT token
```

### User Uploads File
```
POST /upload/file
  > Multer receives file in memory
  > If Bunny configured: uploads to Bunny CDN, gets URL
  > If no Bunny: stores as BYTEA in database (dev fallback)
  > Saves metadata + URL/binary in uploaded_files table
  > Creates QR code entry
  > Logs activity
```

### User Views File
```
GET /files/:id
  > If storage_url exists: 301 redirect to Bunny CDN
  > If no URL: serve BYTEA binary from database (fallback)
```

### OI Admin Views All Data
```
GET /admin/overview (with admin JWT)
  > Queries ALL organizations (no tenant filter)
  > Returns total customers, MRR, churn rate
  > OI Admin Dashboard displays aggregated data
```

---

## Multi-Tenant Isolation

Every customer query MUST filter by `organization_id`. The auth middleware sets `req.user.organizationId` from the JWT token.

```javascript
// CORRECT - Tenant isolated
const items = await pool.query(
  'SELECT * FROM uploaded_files WHERE organization_id = $1',
  [req.user.organizationId]
);

// WRONG - Shows all customer data
const items = await pool.query('SELECT * FROM uploaded_files');
```

**Exception**: OI Admin endpoints intentionally query across ALL organizations to provide aggregate analytics.

---

## Cost Summary

### Monthly Costs at Scale

| Service | 200 Users | 1,000 Users | 5,000 Users |
|---------|-----------|-------------|-------------|
| Railway (API + DB) | ~$10 | ~$25 | ~$50 |
| Bunny.net (Storage + CDN) | ~$2.50 | ~$12 | ~$50 |
| SendGrid (Email) | Free | Free | $20 |
| Cloudflare (DNS) | Free | Free | Free |
| **Total** | **~$12.50** | **~$37** | **~$120** |

### Revenue vs Cost (Example: 200 customers)

| Plan | Customers | MRR |
|------|-----------|-----|
| Personal (free) | 100 | $0 |
| Small Business (free) | 50 | $0 |
| Medium Business ($29) | 35 | $1,015 |
| Enterprise ($99) | 15 | $1,485 |
| **Total** | **200** | **$2,500** |
| **Costs** | | **$12.50** |
| **Profit** | | **$2,487.50** |

---

## Key Files

| File | Purpose |
|------|---------|
| `backend/api/index.js` | Main API - all routes (Vercel + Railway) |
| `backend/migrations/001_initial_schema.sql` | Core tables |
| `backend/migrations/002_add_bytea_storage.sql` | BYTEA fallback columns |
| `backend/migrations/002_oi_admin_tables.sql` | Admin user tables |
| `backend/migrations/003_add_personal_tier.sql` | Plan tier limits + trigger |
| `backend/migrations/004_discount_codes.sql` | Discount code tables |
| `backend/scripts/create-admin.js` | CLI script to create admin users |
| `backend/config/database.js` | Shared DB pool (for src/ entry point) |
| `backend/routes/admin.js` | Admin routes (separate router module) |
| `backend/middleware/adminAuth.js` | Admin JWT auth middleware |
| `backend/utils/exporters.js` | CSV/Excel/PDF export utilities |
| `backend/.env.example` | Environment variable template |

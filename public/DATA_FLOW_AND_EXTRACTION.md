# Data Flow & Extraction Guide
## Single Database with Tenant Isolation

Complete guide showing how data flows from your three dashboard versions to the database and how to extract it for analytics.

---

## Why Single Database with Tenant Isolation?

✅ **PERFECT for your needs because:**
1. **Cross-tenant analytics** - Query all customers at once for OI admin dashboard
2. **Easy data monetization** - One query can show all QR scans across all customers
3. **Simple maintenance** - One database to backup, optimize, and manage
4. **Cost effective** - No need for multiple database instances
5. **Powerful reporting** - Compare metrics across plan tiers easily

---

## Complete Data Flow Architecture

### Overview
```
Frontend Dashboard (React)
    ↓
API Request with JWT Token
    ↓
Backend validates token & extracts organization_id
    ↓
Database query with organization_id filter (tenant isolation)
    ↓
Data stored/retrieved with organization_id
    ↓
OI Admin can query without organization_id filter (sees all data)
```

---

## 1. User Registration & Login Flow

### Frontend: Registration (Small Business Example)

**User Action**: New customer signs up on your website

**Frontend sends**:
```javascript
// From registration form
POST https://api.outboundimpact.com/auth/register

{
  "company_name": "Pizza Palace Inc",
  "company_email": "owner@pizzapalace.com",
  "full_name": "John Smith",
  "email": "john@pizzapalace.com",
  "password": "securepass123",
  "plan_type": "small_business",
  "phone": "+1-555-0123",
  "billing_address": "123 Main St, Chicago, IL"
}
```

**Database stores**:
```sql
-- Table: organizations
INSERT INTO organizations (
  id,                    -- UUID: '550e8400-e29b-41d4-a716-446655440000'
  company_name,          -- 'Pizza Palace Inc'
  company_email,         -- 'owner@pizzapalace.com'
  plan_type,             -- 'small_business'
  status,                -- 'active'
  max_contributors,      -- 3
  max_qr_codes,          -- 5
  storage_limit_gb,      -- 250
  monthly_price,         -- 0.00 (free tier)
  created_at             -- '2026-01-31 10:30:00'
);

-- Table: users
INSERT INTO users (
  id,                    -- UUID: '7c9e6679-7425-40de-944b-e07fc1f90ae7'
  organization_id,       -- '550e8400-e29b-41d4-a716-446655440000'
  email,                 -- 'john@pizzapalace.com'
  password_hash,         -- bcrypt hash of password
  full_name,             -- 'John Smith'
  role,                  -- 'Admin'
  status,                -- 'active'
  created_at             -- '2026-01-31 10:30:00'
);
```

**Backend returns**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "email": "john@pizzapalace.com",
    "full_name": "John Smith",
    "role": "Admin",
    "organization_id": "550e8400-e29b-41d4-a716-446655440000",
    "plan_type": "small_business"
  }
}
```

### Frontend: Login

**User Action**: John logs in to dashboard

**Frontend sends**:
```javascript
POST https://api.outboundimpact.com/auth/login

{
  "email": "john@pizzapalace.com",
  "password": "securepass123"
}
```

**Database query**:
```sql
SELECT
  u.id,
  u.organization_id,
  u.email,
  u.password_hash,
  u.full_name,
  u.role,
  o.plan_type,
  o.max_contributors,
  o.max_qr_codes
FROM users u
JOIN organizations o ON u.organization_id = o.id
WHERE u.email = 'john@pizzapalace.com'
  AND u.status = 'active'
  AND o.status = 'active';
```

**Database updates**:
```sql
-- Track login
UPDATE users
SET
  last_login_at = NOW(),
  login_count = login_count + 1,
  last_login_ip = '203.0.113.45',
  last_login_location = 'Chicago, IL, USA'
WHERE id = '7c9e6679-7425-40de-944b-e07fc1f90ae7';

-- Log activity
INSERT INTO activity_log (
  organization_id,       -- '550e8400-e29b-41d4-a716-446655440000'
  user_id,              -- '7c9e6679-7425-40de-944b-e07fc1f90ae7'
  action,               -- 'login'
  ip_address,           -- '203.0.113.45'
  location,             -- 'Chicago, IL, USA'
  created_at            -- '2026-01-31 14:22:15'
);
```

---

## 2. QR Code Creation Flow

### Frontend: User Creates QR Code

**User Action**: John creates a QR code for "Front Door Menu"

**Dashboard sends**:
```javascript
// Dashboard_SmallBusiness.jsx - Create QR Code button clicked
POST https://api.outboundimpact.com/qrcodes
Headers: {
  Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}

{
  "name": "Front Door Menu",
  "location": "Main Entrance - Downtown Location",
  "linked_content_id": "a1b2c3d4-5678-90ab-cdef-1234567890ab",
  "qr_url": "https://pizzapalace.com/menu",
  "qr_code_data": "https://api.qr-code-generator.com/v1/create?data=..."
}
```

**Backend middleware**:
```javascript
// 1. Extract JWT token
const decoded = jwt.verify(token);
// decoded = { userId: '7c9e6679...', organizationId: '550e8400...' }

// 2. Check plan limits
const qrCount = await db.query(
  'SELECT COUNT(*) FROM qr_codes WHERE organization_id = $1 AND status = $2',
  ['550e8400-e29b-41d4-a716-446655440000', 'active']
);
// Result: 4 QR codes (limit is 5, OK to proceed)

// 3. Insert with organization_id from token (TENANT ISOLATION)
```

**Database stores**:
```sql
INSERT INTO qr_codes (
  id,                       -- UUID: 'qr-123e4567-e89b-12d3-a456-426614174000'
  organization_id,          -- '550e8400-e29b-41d4-a716-446655440000' (Pizza Palace)
  created_by_user_id,       -- '7c9e6679-7425-40de-944b-e07fc1f90ae7' (John)
  name,                     -- 'Front Door Menu'
  location,                 -- 'Main Entrance - Downtown Location'
  linked_content_id,        -- 'a1b2c3d4-5678-90ab-cdef-1234567890ab'
  qr_url,                   -- 'https://pizzapalace.com/menu'
  qr_code_data,             -- QR code image data/URL
  status,                   -- 'active'
  total_scans,              -- 0
  created_at                -- '2026-01-31 15:00:00'
);

-- Update organization stats
UPDATE organizations
SET total_qr_codes = total_qr_codes + 1
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

**Database storage looks like**:
```
qr_codes table:
┌──────────────────────────────────────┬──────────────────────────────────────┬─────────────────────┬───────────────┐
│ id                                   │ organization_id                      │ name                │ total_scans   │
├──────────────────────────────────────┼──────────────────────────────────────┼─────────────────────┼───────────────┤
│ qr-123e4567-e89b-12d3-a456-426614174 │ 550e8400-e29b-41d4-a716-446655440000 │ Front Door Menu     │ 0             │
│ qr-789abc12-3456-7890-abcd-ef1234567 │ 550e8400-e29b-41d4-a716-446655440000 │ Delivery Box QR     │ 0             │
│ qr-456def78-90ab-cdef-1234-567890abc │ 8f7d6c5b-4a3e-2d1c-0b9a-8f7e6d5c4b3a │ Hotel Lobby         │ 0             │ ← Different org
└──────────────────────────────────────┴──────────────────────────────────────┴─────────────────────┴───────────────┘
```

**Frontend receives**:
```json
{
  "id": "qr-123e4567-e89b-12d3-a456-426614174000",
  "name": "Front Door Menu",
  "location": "Main Entrance - Downtown Location",
  "qr_url": "https://pizzapalace.com/menu",
  "total_scans": 0,
  "created_at": "2026-01-31T15:00:00Z",
  "status": "active"
}
```

---

## 3. QR Code Scan Tracking Flow

### Real-World: Customer Scans QR Code

**User Action**: A customer walks by Pizza Palace and scans the QR code with their phone

**What happens**:
```javascript
// Public endpoint (no authentication needed)
// Customer's phone makes request:
GET https://api.outboundimpact.com/qrcodes/scan/qr-123e4567-e89b-12d3-a456-426614174000

// Or POST if tracking more data:
POST https://api.outboundimpact.com/qrcodes/scan/qr-123e4567-e89b-12d3-a456-426614174000
{
  "referrer": "instagram.com"  // Optional: where they found the QR
}
```

**Backend captures**:
```javascript
// 1. Get IP address
const ip = req.ip; // '198.51.100.42'

// 2. Get geolocation from IP
const location = await getLocationFromIP(ip);
// Returns: {
//   latitude: 41.8781,
//   longitude: -87.6298,
//   city: 'Chicago',
//   state: 'Illinois',
//   country: 'United States',
//   country_code: 'US'
// }

// 3. Parse device info
const userAgent = req.headers['user-agent'];
// 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) ...'

const deviceInfo = parseUserAgent(userAgent);
// Returns: {
//   device_type: 'mobile',
//   os: 'iOS 16.0',
//   browser: 'Safari'
// }
```

**Database stores (CRITICAL for monetization)**:
```sql
-- Store detailed scan event
INSERT INTO qr_scan_events (
  id,                       -- UUID: 'scan-9f8e7d6c-5b4a-3e2d-1c0b-9a8f7e6d5c4b'
  qr_code_id,               -- 'qr-123e4567-e89b-12d3-a456-426614174000'
  organization_id,          -- '550e8400-e29b-41d4-a716-446655440000' (Pizza Palace)
  scanned_at,               -- '2026-01-31 18:45:22'
  ip_address,               -- '198.51.100.42'
  latitude,                 -- 41.8781
  longitude,                -- -87.6298
  city,                     -- 'Chicago'
  state,                    -- 'Illinois'
  country,                  -- 'United States'
  country_code,             -- 'US'
  user_agent,               -- Full UA string
  device_type,              -- 'mobile'
  os,                       -- 'iOS 16.0'
  browser,                  -- 'Safari'
  referrer_url              -- 'instagram.com'
);

-- Update QR code statistics
UPDATE qr_codes
SET
  total_scans = total_scans + 1,
  last_scanned_at = NOW()
WHERE id = 'qr-123e4567-e89b-12d3-a456-426614174000';

-- Update organization totals
UPDATE organizations
SET total_qr_scans = total_qr_scans + 1
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

**Database now contains**:
```
qr_scan_events table (grows rapidly - this is your GOLD MINE):
┌──────────────────────┬───────────────────┬──────────┬───────────┬──────────────────┬─────────────┬─────────────┐
│ id                   │ qr_code_id        │ city     │ country   │ scanned_at       │ device_type │ referrer    │
├──────────────────────┼───────────────────┼──────────┼───────────┼──────────────────┼─────────────┼─────────────┤
│ scan-9f8e7d6c...     │ qr-123e4567...    │ Chicago  │ US        │ 2026-01-31 18:45 │ mobile      │ instagram   │
│ scan-8e7d6c5b...     │ qr-123e4567...    │ Chicago  │ US        │ 2026-01-31 19:12 │ mobile      │ null        │
│ scan-7d6c5b4a...     │ qr-123e4567...    │ Milwaukee│ US        │ 2026-01-31 20:05 │ desktop     │ facebook    │
│ scan-6c5b4a3e...     │ qr-789abc12...    │ Chicago  │ US        │ 2026-01-31 20:30 │ mobile      │ null        │
└──────────────────────┴───────────────────┴──────────┴───────────┴──────────────────┴─────────────┴─────────────┘
```

---

## 4. Campaign Creation Flow

### Frontend: Create Campaign

**User Action**: John creates "Valentine's Day Special" campaign

**Dashboard sends**:
```javascript
POST https://api.outboundimpact.com/campaigns
Headers: { Authorization: 'Bearer token...' }

{
  "name": "Valentine's Day Special",
  "description": "Heart-shaped pizza promotion",
  "start_date": "2026-02-10",
  "end_date": "2026-02-15",
  "status": "active"
}
```

**Database stores**:
```sql
INSERT INTO campaigns (
  id,                       -- UUID: 'camp-a1b2c3d4-5e6f-7890-abcd-ef1234567890'
  organization_id,          -- '550e8400-e29b-41d4-a716-446655440000' (Pizza Palace)
  created_by_user_id,       -- '7c9e6679-7425-40de-944b-e07fc1f90ae7' (John)
  name,                     -- 'Valentine's Day Special'
  description,              -- 'Heart-shaped pizza promotion'
  start_date,               -- '2026-02-10'
  end_date,                 -- '2026-02-15'
  status,                   -- 'active'
  created_at                -- '2026-01-31 16:00:00'
);
```

### Frontend: Social Share Campaign

**User Action**: John clicks "Share" button, then "Share on Facebook"

**Dashboard sends**:
```javascript
// Just opens Facebook share dialog - no backend call needed
// But we can track that the button was clicked:

POST https://api.outboundimpact.com/activity/track
{
  "action": "campaign_social_share",
  "entity_type": "campaign",
  "entity_id": "camp-a1b2c3d4-5e6f-7890-abcd-ef1234567890",
  "metadata": {
    "platform": "facebook",
    "campaign_name": "Valentine's Day Special"
  }
}
```

**Database stores**:
```sql
INSERT INTO activity_log (
  organization_id,          -- '550e8400-e29b-41d4-a716-446655440000'
  user_id,                  -- '7c9e6679-7425-40de-944b-e07fc1f90ae7'
  action,                   -- 'campaign_social_share'
  entity_type,              -- 'campaign'
  entity_id,                -- 'camp-a1b2c3d4-5e6f-7890-abcd-ef1234567890'
  metadata,                 -- '{"platform": "facebook", "campaign_name": "..."}'
  created_at                -- '2026-01-31 16:15:00'
);
```

---

## 5. File Upload Flow

### Frontend: Upload Menu PDF

**User Action**: John uploads "menu.pdf" (5.2 MB)

**Dashboard sends**:
```javascript
POST https://api.outboundimpact.com/uploads
Headers: {
  Authorization: 'Bearer token...',
  Content-Type: 'multipart/form-data'
}

FormData:
  file: [binary data]
  file_name: "menu.pdf"
  campaign_id: "camp-a1b2c3d4-5e6f-7890-abcd-ef1234567890"
```

**Backend process**:
```javascript
// 1. Check storage limit
const storageUsed = await db.query(`
  SELECT SUM(file_size_bytes) as total
  FROM uploaded_files
  WHERE organization_id = $1
`, ['550e8400-e29b-41d4-a716-446655440000']);

const storageUsedGB = storageUsed.rows[0].total / 1073741824; // bytes to GB
const storageLimit = 250; // GB for small business

if (storageUsedGB + (fileSize / 1073741824) > storageLimit) {
  return res.status(403).json({ error: 'Storage limit exceeded' });
}

// 2. Upload to Backblaze B2
const fileUrl = await uploadToB2({
  bucket: 'outbound-impact-files',
  path: `organizations/550e8400.../uploads/file-uuid.pdf`,
  file: fileBuffer
});
// Returns: 'https://f002.backblazeb2.com/file/outbound-impact-files/...'

// 3. Store in database
```

**Database stores**:
```sql
INSERT INTO uploaded_files (
  id,                       -- UUID: 'file-1a2b3c4d-5e6f-7890-abcd-ef1234567890'
  organization_id,          -- '550e8400-e29b-41d4-a716-446655440000'
  uploaded_by_user_id,      -- '7c9e6679-7425-40de-944b-e07fc1f90ae7'
  file_name,                -- 'menu.pdf'
  file_type,                -- 'pdf'
  file_size_bytes,          -- 5452595 (5.2 MB)
  file_url,                 -- 'https://f002.backblazeb2.com/file/...'
  storage_path,             -- 'organizations/550e8400.../uploads/file-uuid.pdf'
  campaign_id,              -- 'camp-a1b2c3d4-5e6f-7890-abcd-ef1234567890'
  created_at                -- '2026-01-31 16:30:00'
);

-- Update organization totals
UPDATE organizations
SET total_uploads = total_uploads + 1
WHERE id = '550e8400-e29b-41d4-a716-446655440000';
```

---

## 6. Dashboard Analytics Load Flow

### Frontend: Dashboard Page Loads

**User Action**: John opens his dashboard

**Dashboard sends multiple requests**:
```javascript
// Request 1: Get organization stats
GET https://api.outboundimpact.com/analytics/stats
Headers: { Authorization: 'Bearer token...' }

// Request 2: Get recent activity
GET https://api.outboundimpact.com/activity/recent?limit=10

// Request 3: Get QR code performance
GET https://api.outboundimpact.com/qrcodes/performance

// Request 4: Get campaign stats
GET https://api.outboundimpact.com/campaigns/stats
```

**Backend queries (with TENANT ISOLATION)**:
```sql
-- Query 1: Organization stats
SELECT
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT q.id) as total_qr_codes,
  COUNT(DISTINCT c.id) as total_campaigns,
  COUNT(DISTINCT uf.id) as total_uploads,
  SUM(uf.file_size_bytes) as storage_used,
  o.total_qr_scans
FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
LEFT JOIN campaigns c ON c.organization_id = o.id
LEFT JOIN uploaded_files uf ON uf.organization_id = o.id
WHERE o.id = '550e8400-e29b-41d4-a716-446655440000'  -- TENANT ISOLATION
GROUP BY o.id;

-- Query 2: Recent activity (last 10 items)
SELECT
  al.action,
  al.entity_type,
  al.created_at,
  u.full_name as user_name,
  al.metadata
FROM activity_log al
JOIN users u ON al.user_id = u.id
WHERE al.organization_id = '550e8400-e29b-41d4-a716-446655440000'  -- TENANT ISOLATION
ORDER BY al.created_at DESC
LIMIT 10;

-- Query 3: QR code performance
SELECT
  id,
  name,
  location,
  total_scans,
  last_scanned_at,
  created_at
FROM qr_codes
WHERE organization_id = '550e8400-e29b-41d4-a716-446655440000'  -- TENANT ISOLATION
  AND status = 'active'
ORDER BY total_scans DESC;
```

**Frontend receives**:
```json
{
  "stats": {
    "total_users": 1,
    "total_qr_codes": 5,
    "total_campaigns": 2,
    "total_uploads": 8,
    "storage_used_gb": 42.5,
    "total_qr_scans": 156
  },
  "recent_activity": [
    {
      "action": "upload_file",
      "entity_type": "file",
      "created_at": "2026-01-31T16:30:00Z",
      "user_name": "John Smith",
      "metadata": { "file_name": "menu.pdf" }
    },
    // ... more activities
  ],
  "qr_performance": [
    {
      "id": "qr-123e4567...",
      "name": "Front Door Menu",
      "total_scans": 87,
      "last_scanned_at": "2026-01-31T20:30:00Z"
    },
    // ... more QR codes
  ]
}
```

---

## 7. DATA EXTRACTION FOR OI ADMIN

### This is the POWER of single database - you can query EVERYTHING

### Extract: All Customers Overview

```sql
-- Get complete customer list with key metrics
SELECT
  o.id as org_id,
  o.company_name,
  o.company_email,
  o.plan_type,
  o.status,
  o.monthly_price,
  o.created_at as customer_since,

  -- User metrics
  COUNT(DISTINCT u.id) as total_users,
  o.max_contributors as user_limit,

  -- QR code metrics
  COUNT(DISTINCT q.id) as total_qr_codes,
  o.max_qr_codes as qr_limit,
  o.total_qr_scans,

  -- Storage metrics
  COALESCE(SUM(uf.file_size_bytes) / 1073741824.0, 0) as storage_used_gb,
  o.storage_limit_gb,

  -- Campaign metrics
  COUNT(DISTINCT c.id) as total_campaigns,

  -- Last activity
  MAX(al.created_at) as last_activity_at

FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
LEFT JOIN uploaded_files uf ON uf.organization_id = o.id
LEFT JOIN campaigns c ON c.organization_id = o.id
LEFT JOIN activity_log al ON al.organization_id = o.id

GROUP BY o.id
ORDER BY o.created_at DESC;
```

**Returns** (example with 3 customers):
```
┌──────────────┬─────────────────┬─────────────────┬──────────┬──────────┬───────────┬─────────────┬───────────────┐
│ company_name │ plan_type       │ monthly_price   │ users    │ qr_codes │ qr_scans  │ storage_gb  │ last_activity │
├──────────────┼─────────────────┼─────────────────┼──────────┼──────────┼───────────┼─────────────┼───────────────┤
│ Pizza Palace │ small_business  │ 0.00            │ 1        │ 5        │ 156       │ 42.5        │ 2026-01-31... │
│ Acme Corp    │ medium_business │ 29.00           │ 8        │ 23       │ 2,451     │ 185.3       │ 2026-01-31... │
│ MegaBrand Inc│ enterprise      │ 99.00           │ 45       │ 187      │ 45,892    │ 756.8       │ 2026-01-31... │
└──────────────┴─────────────────┴─────────────────┴──────────┴──────────┴───────────┴─────────────┴───────────────┘
```

### Extract: Geographic Heat Map (WHERE are QR codes being scanned?)

```sql
-- QR scan locations worldwide
SELECT
  country,
  country_code,
  city,
  state,
  COUNT(*) as scan_count,
  COUNT(DISTINCT qr_code_id) as unique_qr_codes,
  COUNT(DISTINCT organization_id) as unique_customers,
  AVG(latitude) as avg_latitude,
  AVG(longitude) as avg_longitude,

  -- Group by device type
  SUM(CASE WHEN device_type = 'mobile' THEN 1 ELSE 0 END) as mobile_scans,
  SUM(CASE WHEN device_type = 'desktop' THEN 1 ELSE 0 END) as desktop_scans

FROM qr_scan_events
WHERE scanned_at >= NOW() - INTERVAL '30 days'
GROUP BY country, country_code, city, state
ORDER BY scan_count DESC
LIMIT 100;
```

**Returns**:
```
┌────────────────┬──────────┬────────────┬──────────┬──────────────┬─────────────┬────────────┐
│ country        │ city     │ scan_count │ unique_qr│ mobile_scans │ avg_lat    │ avg_lng    │
├────────────────┼──────────┼────────────┼──────────┼──────────────┼────────────┼────────────┤
│ United States  │ Chicago  │ 3,457      │ 89       │ 2,845        │ 41.8781    │ -87.6298   │
│ United States  │ New York │ 2,891      │ 67       │ 2,456        │ 40.7128    │ -74.0060   │
│ Canada         │ Toronto  │ 1,234      │ 45       │ 987          │ 43.6532    │ -79.3832   │
│ United Kingdom │ London   │ 876        │ 23       │ 745          │ 51.5074    │ -0.1278    │
└────────────────┴──────────┴────────────┴──────────┴──────────────┴────────────┴────────────┘
```

**💰 MONETIZATION INSIGHT**: "3,457 QR scans in Chicago last month - sell this data to Chicago tourism board!"

### Extract: Revenue Analytics

```sql
-- Monthly Recurring Revenue (MRR) breakdown
SELECT
  plan_type,
  COUNT(*) as customer_count,
  SUM(monthly_price) as total_mrr,
  AVG(monthly_price) as avg_price,

  -- Calculate total metrics for all customers in this tier
  SUM(total_qr_scans) as total_scans_all_customers,
  SUM(total_uploads) as total_uploads_all_customers

FROM organizations
WHERE status = 'active'
GROUP BY plan_type
ORDER BY total_mrr DESC;
```

**Returns**:
```
┌─────────────────┬────────────────┬───────────┬───────────┬─────────────┐
│ plan_type       │ customer_count │ total_mrr │ avg_price │ total_scans │
├─────────────────┼────────────────┼───────────┼───────────┼─────────────┤
│ enterprise      │ 15             │ 1,485.00  │ 99.00     │ 125,678     │
│ medium_business │ 68             │ 1,972.00  │ 29.00     │ 67,891      │
│ small_business  │ 142            │ 0.00      │ 0.00      │ 23,456      │
└─────────────────┴────────────────┴───────────┴───────────┴─────────────┘

Total MRR: $3,457/month
Total Customers: 225
Total QR Scans (all time): 216,025
```

### Extract: Identify Upgrade Opportunities

```sql
-- Small Business customers close to limits (ready to upgrade)
SELECT
  o.company_name,
  o.company_email,
  o.plan_type,
  o.created_at as customer_since,

  -- User limit status
  COUNT(DISTINCT u.id) as current_users,
  o.max_contributors as user_limit,
  ROUND((COUNT(DISTINCT u.id)::numeric / o.max_contributors) * 100, 1) as user_limit_percent,

  -- QR code limit status
  COUNT(DISTINCT q.id) as current_qr_codes,
  o.max_qr_codes as qr_limit,
  ROUND((COUNT(DISTINCT q.id)::numeric / o.max_qr_codes) * 100, 1) as qr_limit_percent,

  -- Activity level (high activity = more likely to upgrade)
  o.total_qr_scans,
  COUNT(DISTINCT al.id) as activities_last_30_days

FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
LEFT JOIN activity_log al ON al.organization_id = o.id
  AND al.created_at >= NOW() - INTERVAL '30 days'

WHERE o.plan_type = 'small_business'
  AND o.status = 'active'

GROUP BY o.id

-- Find customers using 60%+ of their limits OR have high activity
HAVING
  (COUNT(DISTINCT u.id)::numeric / o.max_contributors) >= 0.6
  OR (COUNT(DISTINCT q.id)::numeric / o.max_qr_codes) >= 0.6
  OR COUNT(DISTINCT al.id) > 50  -- Very active users

ORDER BY
  o.total_qr_scans DESC,
  (COUNT(DISTINCT u.id)::numeric / o.max_contributors) DESC;
```

**Returns** (upgrade candidates):
```
┌──────────────────┬──────────────────────┬──────────┬──────────┬──────────────┬──────────────┬──────────────┐
│ company_name     │ company_email        │ users    │ user_%   │ qr_codes     │ qr_%         │ qr_scans     │
├──────────────────┼──────────────────────┼──────────┼──────────┼──────────────┼──────────────┼──────────────┤
│ Pizza Palace     │ owner@pizzapalace... │ 3/3      │ 100%     │ 5/5          │ 100%         │ 1,234        │
│ Bob's Burgers    │ bob@burgers.com      │ 2/3      │ 67%      │ 5/5          │ 100%         │ 892          │
│ Coffee Shop Inc  │ info@coffeeshop.com  │ 3/3      │ 100%     │ 3/5          │ 60%          │ 2,456        │
└──────────────────┴──────────────────────┴──────────┴──────────┴──────────────┴──────────────┴──────────────┘
```

**💰 ACTION**: Send automated upgrade email to these 3 customers!

### Extract: Churn Risk Analysis

```sql
-- Identify customers at risk of cancelling
SELECT
  o.company_name,
  o.plan_type,
  o.monthly_price,
  o.created_at as customer_since,

  -- Last activity
  MAX(al.created_at) as last_activity,
  NOW() - MAX(al.created_at) as days_inactive,

  -- Usage metrics
  COUNT(DISTINCT al.id) as total_activities,
  o.total_qr_scans,

  -- Risk score (higher = more risk)
  CASE
    WHEN MAX(al.created_at) < NOW() - INTERVAL '30 days' THEN 'HIGH RISK'
    WHEN MAX(al.created_at) < NOW() - INTERVAL '14 days' THEN 'MEDIUM RISK'
    ELSE 'ACTIVE'
  END as churn_risk

FROM organizations o
LEFT JOIN activity_log al ON al.organization_id = o.id

WHERE o.status = 'active'
  AND o.plan_type IN ('medium_business', 'enterprise')  -- Paying customers

GROUP BY o.id

HAVING MAX(al.created_at) < NOW() - INTERVAL '7 days'  -- No activity in 7 days

ORDER BY MAX(al.created_at) ASC;
```

**Returns**:
```
┌─────────────────┬─────────────────┬──────────────┬───────────────┬─────────────┬─────────────┐
│ company_name    │ plan_type       │ monthly_price│ last_activity │ days_inactive│ churn_risk  │
├─────────────────┼─────────────────┼──────────────┼───────────────┼──────────────┼─────────────┤
│ Dormant Corp    │ medium_business │ 29.00        │ 2025-12-15    │ 47 days      │ HIGH RISK   │
│ Inactive Inc    │ enterprise      │ 99.00        │ 2026-01-10    │ 21 days      │ HIGH RISK   │
│ Quiet Business  │ medium_business │ 29.00        │ 2026-01-18    │ 13 days      │ MEDIUM RISK │
└─────────────────┴─────────────────┴──────────────┴───────────────┴──────────────┴─────────────┘
```

**💰 ACTION**: Reach out to "Dormant Corp" and "Inactive Inc" - at risk of losing $128/month!

### Extract: Best Performing Customers (for case studies)

```sql
-- Top customers by engagement
SELECT
  o.company_name,
  o.plan_type,
  o.created_at as customer_since,

  -- Usage metrics
  COUNT(DISTINCT u.id) as team_size,
  COUNT(DISTINCT q.id) as qr_codes,
  o.total_qr_scans,
  COUNT(DISTINCT c.id) as campaigns,

  -- Scans per QR code (effectiveness metric)
  CASE
    WHEN COUNT(DISTINCT q.id) > 0
    THEN o.total_qr_scans::numeric / COUNT(DISTINCT q.id)
    ELSE 0
  END as avg_scans_per_qr,

  -- Activity score
  COUNT(DISTINCT al.id) as total_activities,

  -- Geographic reach
  COUNT(DISTINCT qse.country) as countries_reached

FROM organizations o
LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
LEFT JOIN campaigns c ON c.organization_id = o.id
LEFT JOIN activity_log al ON al.organization_id = o.id
LEFT JOIN qr_scan_events qse ON qse.organization_id = o.id

WHERE o.status = 'active'

GROUP BY o.id

-- High engagement = lots of scans, active team, multiple campaigns
HAVING o.total_qr_scans > 1000
  AND COUNT(DISTINCT c.id) >= 3

ORDER BY
  o.total_qr_scans DESC,
  COUNT(DISTINCT al.id) DESC

LIMIT 20;
```

**Returns**:
```
┌──────────────────┬─────────────────┬──────────┬──────────┬───────────────┬──────────────────┬──────────────┐
│ company_name     │ plan_type       │ qr_codes │ qr_scans │ campaigns     │ avg_scans_per_qr │ countries    │
├──────────────────┼─────────────────┼──────────┼──────────┼───────────────┼──────────────────┼──────────────┤
│ Global Hotels    │ enterprise      │ 245      │ 78,923   │ 15            │ 322              │ 47           │
│ Restaurant Chain │ enterprise      │ 156      │ 45,678   │ 12            │ 293              │ 8            │
│ Event Company    │ medium_business │ 87       │ 23,456   │ 34            │ 270              │ 12           │
└──────────────────┴─────────────────┴──────────┴──────────┴───────────────┴──────────────────┴──────────────┘
```

**💰 ACTION**: Contact "Global Hotels" for a case study - 78k scans across 47 countries!

### Extract: Data Monetization Query

```sql
-- MOST VALUABLE QUERY: Complete scan data for selling to third parties
SELECT
  qse.scanned_at::date as scan_date,
  qse.country,
  qse.country_code,
  qse.city,
  qse.state,
  qse.latitude,
  qse.longitude,
  qse.device_type,
  qse.os,
  qse.browser,

  -- Aggregate data (don't expose individual customer info)
  COUNT(*) as total_scans,
  COUNT(DISTINCT qse.qr_code_id) as unique_qr_codes,

  -- Time of day distribution
  SUM(CASE WHEN EXTRACT(HOUR FROM qse.scanned_at) BETWEEN 6 AND 12 THEN 1 ELSE 0 END) as morning_scans,
  SUM(CASE WHEN EXTRACT(HOUR FROM qse.scanned_at) BETWEEN 12 AND 18 THEN 1 ELSE 0 END) as afternoon_scans,
  SUM(CASE WHEN EXTRACT(HOUR FROM qse.scanned_at) BETWEEN 18 AND 24 THEN 1 ELSE 0 END) as evening_scans

FROM qr_scan_events qse

WHERE qse.scanned_at >= NOW() - INTERVAL '30 days'
  -- Don't expose sensitive customer data
  -- AND qse.organization_id NOT IN (SELECT id FROM organizations WHERE data_sharing_opted_out = true)

GROUP BY
  qse.scanned_at::date,
  qse.country,
  qse.country_code,
  qse.city,
  qse.state,
  qse.latitude,
  qse.longitude,
  qse.device_type,
  qse.os,
  qse.browser

HAVING COUNT(*) >= 10  -- Only include statistically significant data

ORDER BY total_scans DESC;
```

**Returns** (anonymized aggregate data):
```
┌────────────┬────────────────┬──────────┬─────────────┬──────────┬──────────┬──────────────┬─────────┐
│ scan_date  │ country        │ city     │ device_type │ os       │ scans    │ unique_qrs   │ lat/lng │
├────────────┼────────────────┼──────────┼─────────────┼──────────┼──────────┼──────────────┼─────────┤
│ 2026-01-30 │ United States  │ Chicago  │ mobile      │ iOS      │ 4,567    │ 234          │ 41.88...│
│ 2026-01-30 │ United States  │ Chicago  │ mobile      │ Android  │ 3,234    │ 198          │ 41.88...│
│ 2026-01-30 │ United States  │ New York │ mobile      │ iOS      │ 2,891    │ 156          │ 40.71...│
└────────────┴────────────────┴──────────┴─────────────┴──────────┴──────────┴──────────────┴─────────┘
```

**💰 MONETIZE**: Sell this to:
- Marketing agencies: "4,567 mobile iOS users scanned QR codes in Chicago yesterday"
- Tourism boards: Geographic distribution of engagement
- Device manufacturers: OS/browser trends

---

## 8. How OI Admin Dashboard Accesses Data

### OI Admin Login (Separate from tenant users)

**Create OI Admin Users**:
```sql
-- Special table for OI employees
CREATE TABLE oi_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- 'super_admin', 'admin', 'analyst'
  created_at TIMESTAMP DEFAULT NOW()
);

-- These users bypass organization_id filtering
INSERT INTO oi_admin_users (email, password_hash, full_name, role)
VALUES ('admin@outboundimpact.com', '$2b$10$...', 'OI Admin', 'super_admin');
```

### OI Admin API Routes

**routes/admin.js**:
```javascript
const express = require('express');
const router = express.Router();

// Special middleware for OI admins (not regular users)
const authenticateOIAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // Check if OI admin
  const admin = await db.query(
    'SELECT * FROM oi_admin_users WHERE id = $1',
    [decoded.userId]
  );

  if (admin.rows.length === 0) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  req.admin = admin.rows[0];
  next();
};

router.use(authenticateOIAdmin);

// Get ALL customers (no organization filter)
router.get('/customers', async (req, res) => {
  const result = await db.query(`
    SELECT
      o.*,
      COUNT(DISTINCT u.id) as user_count,
      COUNT(DISTINCT q.id) as qr_count,
      SUM(uf.file_size_bytes) as storage_used
    FROM organizations o
    LEFT JOIN users u ON u.organization_id = o.id
    LEFT JOIN qr_codes q ON q.organization_id = o.id
    LEFT JOIN uploaded_files uf ON uf.organization_id = o.id
    GROUP BY o.id
    ORDER BY o.created_at DESC
  `);

  res.json(result.rows);
});

// Get ALL QR scan data (across all customers)
router.get('/scans/global', async (req, res) => {
  const result = await db.query(`
    SELECT
      country,
      city,
      COUNT(*) as scan_count,
      AVG(latitude) as lat,
      AVG(longitude) as lng
    FROM qr_scan_events
    WHERE scanned_at >= NOW() - INTERVAL '30 days'
    GROUP BY country, city
    ORDER BY scan_count DESC
    LIMIT 1000
  `);

  res.json(result.rows);
});

module.exports = router;
```

---

## Summary: Complete Data Flow

### Single Database Table Structure
```
organizations (225 rows - your customers)
├── users (8,450 rows - all users across all customers)
├── qr_codes (12,345 rows - all QR codes across all customers)
│   └── qr_scan_events (1,234,567 rows - EVERY scan - your GOLD)
├── campaigns (4,567 rows - all campaigns)
├── uploaded_files (23,456 rows - all uploads)
└── activity_log (456,789 rows - all actions)
```

### Key Points

1. **Every table has `organization_id`** - This is tenant isolation
2. **Regular API queries ALWAYS filter by `organization_id`** - Security
3. **OI Admin queries DON'T filter by `organization_id`** - See everything
4. **One query can analyze ALL customers** - Perfect for analytics

### The Magic Query

```sql
-- One query, all customers, all data
SELECT COUNT(*) FROM qr_scan_events;
-- Returns: 1,234,567 total scans

-- Filter to one customer
SELECT COUNT(*) FROM qr_scan_events
WHERE organization_id = 'pizza-palace-uuid';
-- Returns: 156 scans (just Pizza Palace)
```

---

This is exactly what you need! Single database, tenant isolation, easy extraction for OI admin. Want me to create the actual OI Admin Dashboard component next?

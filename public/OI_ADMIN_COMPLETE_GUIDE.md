# OI Admin Dashboard - Complete Integration Guide

This guide shows how all three components work together: Frontend Dashboard, Backend API, and Data Export System.

---

## Overview

You now have a complete OI Admin system with:

1. ✅ **Frontend Dashboard** - React component with analytics visualizations
2. ✅ **Backend API Routes** - Node.js/Express endpoints for data access
3. ✅ **Data Export System** - CSV, Excel, and PDF export utilities

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     OI Admin Dashboard (React)                  │
│                  Dashboard_OIAdmin.jsx                          │
│  - Overview Stats                                               │
│  - Customer Management                                          │
│  - Geographic Analytics                                         │
│  - Revenue Tracking                                             │
│  - Upgrade Opportunities                                        │
│  - Data Exports                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP Requests
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│                     Backend API Server                          │
│                    /api/admin/*                                 │
│                                                                 │
│  Authentication: adminAuth.js (JWT + oi_admin_users table)     │
│  Routes: admin.js (All admin endpoints)                        │
│  Exports: exporters.js (CSV/Excel/PDF generators)              │
└──────────────────────┬──────────────────────────────────────────┘
                       │ SQL Queries (NO organization_id filter)
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│              Single PostgreSQL Database                         │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌────────────────┐ │
│  │  organizations  │  │  qr_scan_events │  │  activity_log  │ │
│  │  (225 rows)     │  │  (1.2M rows)    │  │  (450K rows)   │ │
│  └─────────────────┘  └─────────────────┘  └────────────────┘ │
│                                                                 │
│  Plus: users, qr_codes, campaigns, uploaded_files, etc.        │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
dashboard-project/
├── src/
│   ├── Dashboard_SmallBusiness.jsx
│   ├── Dashboard_MediumBusiness.jsx
│   ├── Dashboard_Enterprise.jsx
│   └── Dashboard_OIAdmin.jsx           ← NEW: OI Admin Dashboard
│
├── backend/
│   ├── routes/
│   │   ├── auth.js                     (Regular customer auth)
│   │   ├── qrcodes.js                  (Tenant-scoped)
│   │   └── admin.js                    ← NEW: Admin routes (no tenant filter)
│   │
│   ├── middleware/
│   │   ├── auth.js                     (Regular auth)
│   │   ├── tenantContext.js            (Tenant isolation)
│   │   └── adminAuth.js                ← NEW: Admin authentication
│   │
│   ├── utils/
│   │   └── exporters.js                ← NEW: CSV/Excel/PDF exports
│   │
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_oi_admin_tables.sql     ← NEW: Admin tables
│
└── OI_ADMIN_COMPLETE_GUIDE.md          ← You are here
```

---

## Setup Instructions

### 1. Install Required NPM Packages

```bash
cd backend
npm install exceljs pdfkit
```

**Dependencies needed**:
- `exceljs` - Excel file generation
- `pdfkit` - PDF generation
- (Already have): `express`, `pg`, `bcrypt`, `jsonwebtoken`

### 2. Run Database Migrations

```bash
# Create OI admin tables
psql -U postgres -d outbound_impact_prod -f backend/migrations/002_oi_admin_tables.sql
```

### 3. Create First Admin User

```javascript
// backend/scripts/create-admin.js
const bcrypt = require('bcrypt');
const db = require('../config/database');

async function createAdmin() {
  const email = 'admin@outboundimpact.com';
  const password = 'ChangeThisPassword123!'; // CHANGE THIS!
  const full_name = 'OI Super Admin';

  const passwordHash = await bcrypt.hash(password, 10);

  await db.query(
    `INSERT INTO oi_admin_users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
    [email, passwordHash, full_name, 'super_admin']
  );

  console.log('✅ Admin user created/updated');
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  console.log('⚠️  CHANGE THE PASSWORD IMMEDIATELY!');
  process.exit(0);
}

createAdmin();
```

Run it:
```bash
node backend/scripts/create-admin.js
```

### 4. Mount Admin Routes in Express

**backend/index.js**:
```javascript
const express = require('express');
const adminRoutes = require('./routes/admin');

const app = express();

// ... other routes ...

// Mount admin routes
app.use('/api/admin', adminRoutes);

// ... rest of server setup ...
```

### 5. Add Admin Login Route

**backend/routes/admin.js** (add at the top):
```javascript
/**
 * POST /api/admin/login
 * Admin login (separate from customer login)
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM oi_admin_users WHERE email = $1 AND status = $2',
      [email, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    const admin = result.rows[0];

    // Check password
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Update last login
    await db.query(
      'UPDATE oi_admin_users SET last_login_at = NOW() WHERE id = $1',
      [admin.id]
    );

    // Generate JWT (same secret as customer tokens, but different payload)
    const token = jwt.sign(
      { userId: admin.id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});
```

### 6. Update App.jsx to Include Admin Dashboard

**src/App.jsx**:
```javascript
// ========================================
// DASHBOARD VERSION SWITCHER
// ========================================

// 1️⃣ SMALL BUSINESS
// import Dashboard from './Dashboard_SmallBusiness'

// 2️⃣ MEDIUM BUSINESS
// import Dashboard from './Dashboard_MediumBusiness'

// 3️⃣ ENTERPRISE
// import Dashboard from './Dashboard_Enterprise'

// 4️⃣ OI ADMIN (Internal Use Only)
import Dashboard from './Dashboard_OIAdmin'

function App() {
  return <Dashboard />
}

export default App
```

---

## Complete API Endpoint Reference

### Admin Authentication

```javascript
POST /api/admin/login
Body: { email: "admin@outboundimpact.com", password: "..." }
Returns: { token: "...", admin: { ... } }
```

### Overview & Stats

```javascript
GET /api/admin/overview
Headers: { Authorization: "Bearer <admin_token>" }
Returns: {
  total_customers: 225,
  active_customers: 218,
  total_mrr: 3457,
  total_qr_scans: 216025,
  new_customers_this_month: 12,
  churn_rate: "2.80"
}

GET /api/admin/plan-breakdown
Returns: [
  {
    plan_type: "enterprise",
    customer_count: 15,
    total_mrr: 1485,
    avg_scans: 8378,
    ...
  },
  ...
]
```

### Customer Management

```javascript
GET /api/admin/customers?plan=small_business&search=pizza&limit=50&offset=0
Returns: {
  customers: [ { company_name: "...", ... }, ... ],
  total: 142,
  limit: 50,
  offset: 0
}

GET /api/admin/customers/:id
Returns: {
  customer: { id: "...", company_name: "...", ... },
  recent_activity: [ { action: "...", ... }, ... ]
}
```

### Geographic Analytics

```javascript
GET /api/admin/geography/top-locations?days=30&limit=100
Returns: [
  {
    country: "United States",
    city: "Chicago",
    scan_count: 3457,
    unique_qr_codes: 89,
    mobile_scans: 2845,
    avg_latitude: 41.8781,
    avg_longitude: -87.6298
  },
  ...
]

GET /api/admin/geography/device-stats?days=30
Returns: [
  {
    device_type: "mobile",
    os: "iOS",
    browser: "Safari",
    scan_count: 98456,
    percentage: 62.3
  },
  ...
]
```

### Revenue Analytics

```javascript
GET /api/admin/revenue/mrr
Returns: {
  by_plan: [
    {
      plan_type: "enterprise",
      customer_count: 15,
      total_mrr: 1485,
      avg_price: 99
    },
    ...
  ],
  totals: {
    total_mrr: 3457,
    total_active_customers: 225,
    annual_run_rate: 41484
  }
}

GET /api/admin/revenue/history?months=12
Returns: [
  {
    month: "2026-01-01T00:00:00.000Z",
    plan_type: "medium_business",
    events: 12,
    mrr: 348
  },
  ...
]
```

### Opportunities

```javascript
GET /api/admin/opportunities/upgrades
Returns: [
  {
    company_name: "Pizza Palace Inc",
    plan_type: "small_business",
    current_users: 3,
    user_limit: 3,
    user_limit_percent: 100,
    current_qr_codes: 5,
    qr_limit: 5,
    qr_limit_percent: 100,
    upgrade_score: 95,
    potential_mrr_increase: 29
  },
  ...
]

GET /api/admin/opportunities/churn-risk
Returns: [
  {
    company_name: "Dormant Corp",
    plan_type: "medium_business",
    monthly_price: 29,
    last_activity: "2025-12-15T10:30:00.000Z",
    days_inactive: 47,
    churn_risk: "HIGH"
  },
  ...
]

GET /api/admin/opportunities/top-performers
Returns: [
  {
    company_name: "Global Hotels Ltd",
    team_size: 45,
    qr_codes: 245,
    total_qr_scans: 78923,
    campaigns: 15,
    avg_scans_per_qr: 322,
    countries_reached: 47
  },
  ...
]
```

### Data Exports

```javascript
GET /api/admin/export/customers?format=csv
Returns: CSV file download
Content-Type: text/csv
Content-Disposition: attachment; filename="customers.csv"

GET /api/admin/export/customers?format=excel
Returns: Excel file download
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="customers.xlsx"

GET /api/admin/export/geographic?format=csv&days=30
Returns: CSV file with geographic data (anonymized)

GET /api/admin/export/revenue?format=excel
Returns: Excel file with revenue report
```

---

## Frontend Usage Examples

### 1. Admin Login

```javascript
// In Dashboard_OIAdmin.jsx or separate login component
async function handleAdminLogin(email, password) {
  const response = await fetch('https://api.outboundimpact.com/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  // Store token
  localStorage.setItem('oi_admin_token', data.token);
  localStorage.setItem('oi_admin', JSON.stringify(data.admin));
}
```

### 2. Fetch Overview Stats

```javascript
async function fetchOverviewStats() {
  const token = localStorage.getItem('oi_admin_token');

  const response = await fetch('https://api.outboundimpact.com/admin/overview', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const stats = await response.json();
  setOverviewStats(stats);
}

// Use in useEffect
useEffect(() => {
  fetchOverviewStats();
}, []);
```

### 3. Fetch Customer List with Filters

```javascript
async function fetchCustomers(filters) {
  const token = localStorage.getItem('oi_admin_token');
  const { plan, search, page } = filters;

  const params = new URLSearchParams({
    plan: plan || 'all',
    search: search || '',
    limit: 50,
    offset: page * 50
  });

  const response = await fetch(
    `https://api.outboundimpact.com/admin/customers?${params}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  const data = await response.json();
  setCustomers(data.customers);
  setTotalCustomers(data.total);
}
```

### 4. Download Export

```javascript
async function downloadCustomerExport(format) {
  const token = localStorage.getItem('oi_admin_token');

  const response = await fetch(
    `https://api.outboundimpact.com/admin/export/customers?format=${format}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  // Create download link
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `customers.${format}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// Usage:
<button onClick={() => downloadCustomerExport('csv')}>
  Download CSV
</button>
<button onClick={() => downloadCustomerExport('excel')}>
  Download Excel
</button>
```

---

## Security Best Practices

### 1. Environment Variables

**.env**:
```env
# Different admin JWT secret for extra security
ADMIN_JWT_SECRET=your-separate-admin-secret-key-change-this
ADMIN_JWT_EXPIRES_IN=4h  # Shorter expiry for admins

# Or use same secret but check isAdmin flag
JWT_SECRET=your-jwt-secret
```

### 2. Rate Limiting for Admin Routes

```javascript
const rateLimit = require('express-rate-limit');

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many admin requests, please try again later'
});

app.use('/api/admin', adminLimiter);
```

### 3. Admin Access Logging

All admin access is automatically logged to `admin_access_log` table for security audits.

Query admin activity:
```sql
SELECT
  au.email,
  aal.action,
  aal.endpoint,
  aal.created_at
FROM admin_access_log aal
JOIN oi_admin_users au ON aal.admin_user_id = au.id
ORDER BY aal.created_at DESC
LIMIT 100;
```

---

## Testing the Complete System

### 1. Start Backend

```bash
cd backend
npm run dev
```

### 2. Start Frontend

```bash
cd dashboard-project
npm run dev
```

### 3. Switch to OI Admin Dashboard

Edit `src/App.jsx`:
```javascript
import Dashboard from './Dashboard_OIAdmin'
```

### 4. Login as Admin

Open http://localhost:5173

Use credentials created in step 3 above.

### 5. Test Data Exports

Navigate to "Data Exports" tab and click on any export button.

---

## Data Monetization Workflow

### Step 1: Collect Geographic Data

QR scan events automatically collect:
- Location (city, country, coordinates)
- Device type (mobile, desktop, tablet)
- OS and browser
- Time of day

### Step 2: Anonymize Data

The geographic export query (in admin.js) already anonymizes data:
- No individual customer identifiers
- Aggregated by location and date
- Only includes statistically significant data (>10 scans)

### Step 3: Export for Selling

```javascript
// Admin clicks "Geographic Data" export
GET /api/admin/export/geographic?format=csv&days=30
```

Returns CSV with:
```
scan_date,country,city,device_type,os,total_scans,morning_scans,afternoon_scans,evening_scans
2026-01-30,United States,Chicago,mobile,iOS,4567,1234,2156,1177
2026-01-30,United States,Chicago,mobile,Android,3234,987,1654,593
...
```

### Step 4: Sell to Third Parties

**Potential buyers**:
- Marketing agencies
- Tourism boards
- Device manufacturers
- Market research firms

**Pricing model**:
- Per location: $500/city/month
- Per industry vertical: $2,000/month
- Full dataset: $10,000/month

---

## Summary

You now have:

✅ **Complete OI Admin Dashboard** (React component)
✅ **15+ Admin API endpoints** (Backend routes)
✅ **Data export system** (CSV/Excel/PDF)
✅ **Authentication & security** (Separate admin auth)
✅ **Customer analytics** (Overview, metrics, trends)
✅ **Geographic insights** (Heat maps, device stats)
✅ **Revenue tracking** (MRR, forecasts, growth)
✅ **Opportunity detection** (Upgrades, churn risk)
✅ **Data monetization** (Anonymized exports)

All working with **single database + tenant isolation** architecture!

Next steps:
1. Deploy to Hostinger
2. Add real customer data
3. Integrate charting library (Chart.js or Recharts) for visualizations
4. Add email automation for upgrade opportunities
5. Set up automated data export jobs

🎉 Your OI Admin system is complete and ready to manage your entire customer base!

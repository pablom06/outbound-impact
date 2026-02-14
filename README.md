# Outbound Impact Dashboard Platform

Multi-tenant SaaS dashboard platform with QR code analytics, file management, and admin oversight. Supports Personal, Small Business, Medium Business, and Enterprise tiers.

## Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js / Express (Vercel serverless)
- **Database:** PostgreSQL (Railway)
- **File Storage:** Bunny.net CDN
- **Icons:** Lucide React

## Dashboard Tiers

| Tier | Users | QR Codes | Storage | Price |
|------|-------|----------|---------|-------|
| Personal | 1 | 3 | 5 GB | Free |
| Small Business | 3 | 5 | 250 GB | Free |
| Medium Business | Unlimited | Unlimited | 500 GB | $29/mo |
| Enterprise | Unlimited | Unlimited | 1 TB | $99/mo |

**OI Admin Dashboard** - Internal admin panel to manage all customers, revenue, subscriptions, and analytics.

## Local Development

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## Environment Variables

### Frontend (.env.local)
```
VITE_API_BASE_URL=https://your-backend-url.vercel.app
```

### Backend (backend/.env)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
BUNNY_STORAGE_ZONE=your-zone
BUNNY_API_KEY=your-key
BUNNY_CDN_URL=https://your-zone.b-cdn.net
```

## Deployment

1. **Backend:** Deploy `backend/` to Vercel. Set environment variables.
2. **Frontend:** Deploy root project to Vercel. Set `VITE_API_BASE_URL`.
3. **Database:** PostgreSQL on Railway. Run migrations in `backend/migrations/`.
4. **Files:** Create Bunny.net storage zone + pull zone.

## Project Structure

```
outbound-impact/
├── src/
│   ├── Dashboard_Personal.jsx
│   ├── Dashboard_SmallBusiness.jsx
│   ├── Dashboard_MediumBusiness.jsx
│   ├── Dashboard_Enterprise.jsx
│   ├── Dashboard_OIAdmin.jsx
│   ├── DashboardSwitcher.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── UploadModal.jsx
│   │   ├── MediaEditor.jsx
│   │   ├── ComposeMessageModal.jsx
│   │   └── GlobalAiChatWidget.jsx
│   └── services/
│       └── api.js
├── backend/
│   ├── api/index.js              # Vercel serverless entry
│   ├── src/routes/               # Modular route files
│   ├── migrations/               # SQL migrations
│   ├── scripts/create-admin.js   # Admin user setup
│   └── config/                   # DB and storage config
└── package.json
```

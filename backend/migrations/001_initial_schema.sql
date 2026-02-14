-- Outbound Impact Database Schema
-- Initial schema for core functionality

-- Organizations (tenants)
CREATE TABLE IF NOT EXISTS organizations (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_email VARCHAR(255) NOT NULL UNIQUE,
  plan_type VARCHAR(50) DEFAULT 'personal',
  status VARCHAR(50) DEFAULT 'active',
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

-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Uploaded Files
CREATE TABLE IF NOT EXISTS uploaded_files (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_size_bytes BIGINT DEFAULT 0,
  mime_type VARCHAR(100),
  storage_key VARCHAR(500),
  storage_url TEXT,
  slug VARCHAR(100) UNIQUE,
  type_category VARCHAR(50),
  content_text TEXT,
  embed_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR Codes
CREATE TABLE IF NOT EXISTS qr_codes (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  uploaded_file_id INTEGER REFERENCES uploaded_files(id) ON DELETE CASCADE,
  slug VARCHAR(100) UNIQUE,
  status VARCHAR(50) DEFAULT 'active',
  total_scans INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QR Scan Events (for analytics)
CREATE TABLE IF NOT EXISTS qr_scan_events (
  id SERIAL PRIMARY KEY,
  qr_code_id INTEGER REFERENCES qr_codes(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  scanned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50),
  user_agent TEXT,
  device_type VARCHAR(50),
  os VARCHAR(100),
  browser VARCHAR(100),
  country VARCHAR(100),
  country_code VARCHAR(10),
  city VARCHAR(100),
  state VARCHAR(100),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6)
);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
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

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id INTEGER,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_organization ON uploaded_files(organization_id);
CREATE INDEX IF NOT EXISTS idx_uploaded_files_slug ON uploaded_files(slug);
CREATE INDEX IF NOT EXISTS idx_qr_codes_organization ON qr_codes(organization_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON qr_codes(slug);
CREATE INDEX IF NOT EXISTS idx_qr_scan_events_qr_code ON qr_scan_events(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_events_organization ON qr_scan_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_qr_scan_events_scanned_at ON qr_scan_events(scanned_at);
CREATE INDEX IF NOT EXISTS idx_activity_log_organization ON activity_log(organization_id);

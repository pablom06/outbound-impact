// Quick migration runner
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const migration = `
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
`;

async function runMigration() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();

    console.log('Running migration...');
    await client.query(migration);

    console.log('Migration complete! Tables created:');
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
    `);
    tables.rows.forEach(row => console.log('  -', row.table_name));

    client.release();
    await pool.end();
    console.log('Done!');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

runMigration();

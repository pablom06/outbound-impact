-- OI ADMIN DATABASE TABLES
-- Tables for Outbound Impact internal administrators

-- Table: oi_admin_users
-- Stores OI company employees who can access the admin dashboard
CREATE TABLE IF NOT EXISTS oi_admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin', -- 'analyst', 'admin', 'super_admin'
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  last_login_at TIMESTAMP,
  created_by_user_id UUID REFERENCES oi_admin_users(id)
);

-- Table: admin_access_log
-- Audit log for all admin dashboard access
CREATE TABLE IF NOT EXISTS admin_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES oi_admin_users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  endpoint VARCHAR(500),
  method VARCHAR(10),
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_access_log_user ON admin_access_log(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_date ON admin_access_log(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_access_log_action ON admin_access_log(action);

-- Insert first super admin (change password!)
INSERT INTO oi_admin_users (email, password_hash, full_name, role)
VALUES (
  'admin@outboundimpact.com',
  '$2b$10$YourHashedPasswordHere', -- CHANGE THIS!
  'OI Super Admin',
  'super_admin'
)
ON CONFLICT (email) DO NOTHING;

-- Grant read permissions on all customer tables to admins
-- (They'll use application-level queries, but this is for direct DB access if needed)

COMMENT ON TABLE oi_admin_users IS 'Outbound Impact internal administrators';
COMMENT ON TABLE admin_access_log IS 'Audit log of all admin dashboard activity';

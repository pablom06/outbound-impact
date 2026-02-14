-- Discount codes table for OI Admin
-- Supports reseller codes, promotions, and percentage/fixed discounts

CREATE TABLE IF NOT EXISTS discount_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' or 'fixed'
  discount_value DECIMAL(10,2) NOT NULL, -- percentage (e.g., 20.00) or fixed amount (e.g., 10.00)
  applicable_plans TEXT[] DEFAULT '{}', -- which plans this applies to: '{small_business,medium_business,enterprise}'
  max_uses INTEGER, -- NULL = unlimited
  current_uses INTEGER DEFAULT 0,
  reseller_email VARCHAR(255), -- if this is a reseller code
  reseller_commission DECIMAL(5,2) DEFAULT 0, -- reseller commission percentage
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'expired', 'disabled'
  starts_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP, -- NULL = never expires
  created_by VARCHAR(255), -- admin who created it
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Track which organizations used which discount codes
CREATE TABLE IF NOT EXISTS discount_code_usage (
  id SERIAL PRIMARY KEY,
  discount_code_id INTEGER REFERENCES discount_codes(id) ON DELETE CASCADE,
  organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
  applied_at TIMESTAMP DEFAULT NOW(),
  plan_type VARCHAR(50),
  discount_amount DECIMAL(10,2)
);

CREATE INDEX IF NOT EXISTS idx_discount_codes_code ON discount_codes(code);
CREATE INDEX IF NOT EXISTS idx_discount_codes_status ON discount_codes(status);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_code ON discount_code_usage(discount_code_id);
CREATE INDEX IF NOT EXISTS idx_discount_code_usage_org ON discount_code_usage(organization_id);

-- ============================================
-- Migration: Add Personal Tier Support
-- ============================================
-- Adds support for Personal users (solo accounts)
-- alongside Small/Medium/Enterprise business accounts

-- Add columns for Personal tier
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS personal_user_id UUID REFERENCES users(id);

-- Update constraint to include 'personal' plan type
ALTER TABLE organizations
  DROP CONSTRAINT IF EXISTS organizations_plan_type_check;

ALTER TABLE organizations
  ADD CONSTRAINT organizations_plan_type_check
  CHECK (plan_type IN ('personal', 'small_business', 'medium_business', 'enterprise'));

-- Create indexes for Personal tier queries
CREATE INDEX IF NOT EXISTS idx_org_is_personal ON organizations(is_personal);
CREATE INDEX IF NOT EXISTS idx_org_personal_user ON organizations(personal_user_id);
CREATE INDEX IF NOT EXISTS idx_org_plan_personal ON organizations(plan_type, is_personal);

-- ============================================
-- Function: Automatically set limits based on plan type
-- ============================================
CREATE OR REPLACE FUNCTION set_organization_limits()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan_type = 'personal' THEN
    -- Personal tier: Solo users
    NEW.max_contributors := 1;
    NEW.max_qr_codes := 3;
    NEW.storage_limit_gb := 5;
    NEW.monthly_price := COALESCE(NEW.monthly_price, 0.00);  -- Free by default, can be $5 for premium
    NEW.is_personal := TRUE;

  ELSIF NEW.plan_type = 'small_business' THEN
    -- Small Business: Small teams
    NEW.max_contributors := 3;
    NEW.max_qr_codes := 5;
    NEW.storage_limit_gb := 250;
    NEW.monthly_price := 0.00;
    NEW.is_personal := FALSE;

  ELSIF NEW.plan_type = 'medium_business' THEN
    -- Medium Business: Growing teams
    NEW.max_contributors := NULL;  -- Unlimited
    NEW.max_qr_codes := NULL;      -- Unlimited
    NEW.storage_limit_gb := 500;
    NEW.monthly_price := 29.00;
    NEW.is_personal := FALSE;

  ELSIF NEW.plan_type = 'enterprise' THEN
    -- Enterprise: Large organizations
    NEW.max_contributors := NULL;
    NEW.max_qr_codes := NULL;
    NEW.storage_limit_gb := 1000;
    NEW.monthly_price := 99.00;
    NEW.is_personal := FALSE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run before insert
DROP TRIGGER IF EXISTS set_org_limits_trigger ON organizations;
CREATE TRIGGER set_org_limits_trigger
  BEFORE INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION set_organization_limits();

-- ============================================
-- Add helpful comments
-- ============================================
COMMENT ON COLUMN organizations.is_personal IS 'TRUE for personal accounts (solo user), FALSE for business accounts (team)';
COMMENT ON COLUMN organizations.personal_user_id IS 'For personal accounts, the primary/owner user ID';
COMMENT ON COLUMN organizations.plan_type IS 'Plan tier: personal, small_business, medium_business, or enterprise';

-- ============================================
-- Update existing organizations (if any)
-- ============================================
-- Mark existing Small/Medium/Enterprise as business (not personal)
UPDATE organizations
SET is_personal = FALSE
WHERE plan_type IN ('small_business', 'medium_business', 'enterprise')
  AND is_personal IS NULL;

-- ============================================
-- Example: Create a test Personal user
-- ============================================
-- Uncomment to create a test Personal account:

/*
DO $$
DECLARE
  org_id UUID;
  user_id UUID;
  password_hash TEXT := '$2b$10$YourHashedPasswordHere'; -- Change this!
BEGIN
  -- Create Personal organization
  INSERT INTO organizations (
    company_name, plan_type, status, is_personal,
    max_contributors, max_qr_codes, storage_limit_gb, monthly_price
  ) VALUES (
    'John Doe''s Personal Account',
    'personal',
    'active',
    TRUE,
    1,
    3,
    5,
    0.00
  ) RETURNING id INTO org_id;

  -- Create user
  INSERT INTO users (
    organization_id, email, password_hash, full_name, role, status
  ) VALUES (
    org_id,
    'john@personal.com',
    password_hash,
    'John Doe',
    'Owner',
    'active'
  ) RETURNING id INTO user_id;

  -- Link user as primary personal user
  UPDATE organizations
  SET personal_user_id = user_id
  WHERE id = org_id;

  RAISE NOTICE 'Created test Personal account: john@personal.com';
END $$;
*/

-- ============================================
-- Verification Queries
-- ============================================

-- Verify plan types are set correctly
SELECT
  plan_type,
  is_personal,
  COUNT(*) as count,
  AVG(max_contributors) as avg_user_limit,
  AVG(max_qr_codes) as avg_qr_limit,
  AVG(monthly_price) as avg_price
FROM organizations
GROUP BY plan_type, is_personal
ORDER BY
  CASE plan_type
    WHEN 'personal' THEN 1
    WHEN 'small_business' THEN 2
    WHEN 'medium_business' THEN 3
    WHEN 'enterprise' THEN 4
  END;

-- Show sample of organizations with new columns
SELECT
  id,
  company_name,
  plan_type,
  is_personal,
  personal_user_id,
  max_contributors,
  max_qr_codes,
  monthly_price
FROM organizations
LIMIT 10;

COMMENT ON TABLE organizations IS 'Customer organizations - supports Personal (solo) and Business (team) accounts';

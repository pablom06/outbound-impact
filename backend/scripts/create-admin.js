// Create OI Admin User Script
// Usage: node scripts/create-admin.js <email> <password> <full_name> [role]
// Roles: analyst, admin, super_admin

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createAdmin() {
  const [,, email, password, fullName, role = 'admin'] = process.argv;

  if (!email || !password || !fullName) {
    console.error('Usage: node scripts/create-admin.js <email> <password> <full_name> [role]');
    console.error('Roles: analyst, admin, super_admin');
    process.exit(1);
  }

  const validRoles = ['analyst', 'admin', 'super_admin'];
  if (!validRoles.includes(role)) {
    console.error(`Invalid role: ${role}. Must be one of: ${validRoles.join(', ')}`);
    process.exit(1);
  }

  try {
    // Ensure oi_admin_users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS oi_admin_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'admin',
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        last_login_at TIMESTAMP,
        created_by_user_id UUID REFERENCES oi_admin_users(id)
      );
    `);

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO oi_admin_users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (email) DO UPDATE SET password_hash = $2, full_name = $3, role = $4
       RETURNING id, email, full_name, role`,
      [email.toLowerCase(), passwordHash, fullName, role]
    );

    console.log('Admin user created successfully:');
    console.log(result.rows[0]);
  } catch (error) {
    console.error('Failed to create admin:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();

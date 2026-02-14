// OI ADMIN AUTHENTICATION MIDDLEWARE
// Separate authentication for OI company administrators
// These users can access ALL customer data

const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Authenticate OI Admin User
 * Verifies JWT token and checks if user is in oi_admin_users table
 */
async function authenticateOIAdmin(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: 'Admin access token required' });
    }

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists in OI admin users table
    const result = await db.query(
      'SELECT id, email, full_name, role FROM oi_admin_users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Admin access denied. Not an OI administrator.' });
    }

    // Set admin user in request
    req.admin = result.rows[0];

    // Log admin access
    await logAdminAccess(req);

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid admin token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Admin token expired' });
    }

    console.error('Admin auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Log admin access for security audit
 */
async function logAdminAccess(req) {
  try {
    await db.query(`
      INSERT INTO admin_access_log (
        admin_user_id,
        action,
        endpoint,
        method,
        ip_address,
        user_agent,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [
      req.admin.id,
      'api_access',
      req.path,
      req.method,
      req.ip,
      req.headers['user-agent']
    ]);
  } catch (error) {
    // Don't fail request if logging fails
    console.error('Admin access logging error:', error);
  }
}

/**
 * Check if admin has specific permission level
 * Usage: checkAdminPermission('super_admin')
 */
function checkAdminPermission(requiredRole) {
  const roleHierarchy = {
    'analyst': 1,
    'admin': 2,
    'super_admin': 3
  };

  return (req, res, next) => {
    const userRoleLevel = roleHierarchy[req.admin.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 999;

    if (userRoleLevel < requiredRoleLevel) {
      return res.status(403).json({
        error: `Insufficient permissions. Required: ${requiredRole}, You have: ${req.admin.role}`
      });
    }

    next();
  };
}

module.exports = {
  authenticateOIAdmin,
  checkAdminPermission
};

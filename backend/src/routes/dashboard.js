// Dashboard Routes
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Get organization info and limits
    const orgResult = await db.query(
      `SELECT plan_type, max_qr_codes, storage_limit_gb, max_contributors
       FROM organizations WHERE id = $1`,
      [organizationId]
    );

    if (orgResult.rows.length === 0) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const org = orgResult.rows[0];

    // Get counts
    const statsResult = await db.query(
      `SELECT
        COUNT(DISTINCT uf.id) as uploads,
        COALESCE(SUM(q.total_scans), 0) as views,
        COUNT(DISTINCT q.id) as qr_codes,
        COALESCE(SUM(uf.file_size_bytes), 0) as storage_used
       FROM uploaded_files uf
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1`,
      [organizationId]
    );

    const stats = statsResult.rows[0];

    // Determine limits based on plan
    let storageLimit = 1073741824; // 1GB default (personal)
    let uploadLimit = 3;

    switch (org.plan_type) {
      case 'small_business':
        storageLimit = 10 * 1073741824; // 10GB
        uploadLimit = 50;
        break;
      case 'medium_business':
        storageLimit = 50 * 1073741824; // 50GB
        uploadLimit = 200;
        break;
      case 'enterprise':
        storageLimit = 500 * 1073741824; // 500GB
        uploadLimit = -1; // unlimited
        break;
    }

    res.json({
      uploads: parseInt(stats.uploads) || 0,
      views: parseInt(stats.views) || 0,
      qrCodes: parseInt(stats.qr_codes) || 0,
      storageUsed: parseInt(stats.storage_used) || 0,
      storageLimit,
      uploadLimit,
      planType: org.plan_type
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Get recent activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { limit = 10 } = req.query;

    const result = await db.query(
      `SELECT
        uf.id, uf.title, uf.type_category as type,
        uf.created_at as "createdAt",
        q.total_scans as views
       FROM uploaded_files uf
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1
       ORDER BY uf.created_at DESC
       LIMIT $2`,
      [organizationId, limit]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

module.exports = router;

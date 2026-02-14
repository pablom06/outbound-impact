// Analytics Routes
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get basic analytics
router.get('/', authenticateToken, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { range = '7d' } = req.query;

    // Parse range
    let interval = '7 days';
    switch (range) {
      case '24h': interval = '1 day'; break;
      case '7d': interval = '7 days'; break;
      case '30d': interval = '30 days'; break;
      case '90d': interval = '90 days'; break;
    }

    // Get total views in range
    const viewsResult = await db.query(
      `SELECT COALESCE(SUM(q.total_scans), 0) as total_views
       FROM qr_codes q
       JOIN uploaded_files uf ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1`,
      [organizationId]
    );

    // Get top performing items
    const topItemsResult = await db.query(
      `SELECT
        uf.id, uf.title, uf.type_category as type,
        COALESCE(q.total_scans, 0) as views
       FROM uploaded_files uf
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1
       ORDER BY q.total_scans DESC NULLS LAST
       LIMIT 5`,
      [organizationId]
    );

    res.json({
      totalViews: parseInt(viewsResult.rows[0].total_views) || 0,
      topItems: topItemsResult.rows,
      range
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get advanced analytics (for paid plans)
router.get('/advanced', authenticateToken, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    // Check if user has access to advanced analytics
    const orgResult = await db.query(
      'SELECT plan_type FROM organizations WHERE id = $1',
      [organizationId]
    );

    if (!orgResult.rows.length) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const planType = orgResult.rows[0].plan_type;
    if (planType === 'personal') {
      return res.status(403).json({
        error: 'Advanced analytics requires a paid plan',
        upgrade: true
      });
    }

    // Get detailed stats
    const statsResult = await db.query(
      `SELECT
        COUNT(DISTINCT uf.id) as total_items,
        COALESCE(SUM(q.total_scans), 0) as total_views,
        AVG(q.total_scans) as avg_views_per_item
       FROM uploaded_files uf
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1`,
      [organizationId]
    );

    // Get views by type
    const byTypeResult = await db.query(
      `SELECT
        uf.type_category as type,
        COUNT(*) as count,
        COALESCE(SUM(q.total_scans), 0) as views
       FROM uploaded_files uf
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1
       GROUP BY uf.type_category`,
      [organizationId]
    );

    res.json({
      summary: statsResult.rows[0],
      byType: byTypeResult.rows
    });
  } catch (error) {
    console.error('Get advanced analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;

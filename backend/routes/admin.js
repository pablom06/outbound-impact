// OI ADMIN API ROUTES
// Internal routes for Outbound Impact company administrators
// These routes bypass tenant isolation and can access ALL customer data

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateOIAdmin } = require('../middleware/adminAuth');
const { exportToCSV, exportToExcel, exportToPDF } = require('../utils/exporters');

// Apply OI admin authentication to all routes
router.use(authenticateOIAdmin);

// ============================================
// OVERVIEW & DASHBOARD STATS
// ============================================

/**
 * GET /api/admin/overview
 * Get high-level overview statistics
 */
router.get('/overview', async (req, res) => {
  try {
    const stats = await db.query(`
      SELECT
        -- Customer counts
        COUNT(DISTINCT o.id) as total_customers,
        COUNT(DISTINCT CASE WHEN o.status = 'active' THEN o.id END) as active_customers,
        COUNT(DISTINCT CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN o.id END) as new_customers_this_month,

        -- Revenue
        SUM(CASE WHEN o.status = 'active' THEN o.monthly_price ELSE 0 END) as total_mrr,

        -- Activity
        SUM(o.total_qr_scans) as total_qr_scans,
        SUM(o.total_uploads) as total_uploads,

        -- Averages
        AVG(CASE WHEN o.status = 'active' THEN o.monthly_price END) as avg_mrr_per_customer

      FROM organizations o
    `);

    // Calculate churn rate (last 30 days)
    const churnQuery = await db.query(`
      SELECT
        COUNT(DISTINCT CASE WHEN status = 'cancelled' AND updated_at >= NOW() - INTERVAL '30 days' THEN id END)::numeric /
        NULLIF(COUNT(DISTINCT CASE WHEN updated_at >= NOW() - INTERVAL '60 days' THEN id END), 0) * 100 as churn_rate
      FROM organizations
    `);

    const overview = {
      ...stats.rows[0],
      churn_rate: parseFloat(churnQuery.rows[0].churn_rate || 0).toFixed(2)
    };

    res.json(overview);
  } catch (error) {
    console.error('Get overview error:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

/**
 * GET /api/admin/plan-breakdown
 * Get customer and revenue breakdown by plan type
 */
router.get('/plan-breakdown', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        plan_type,
        COUNT(*) as customer_count,
        SUM(CASE WHEN status = 'active' THEN monthly_price ELSE 0 END) as total_mrr,
        AVG(total_qr_scans) as avg_scans,
        SUM(total_qr_scans) as total_scans,
        AVG(total_uploads) as avg_uploads

      FROM organizations

      GROUP BY plan_type
      ORDER BY total_mrr DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get plan breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch plan breakdown' });
  }
});

// ============================================
// CUSTOMER MANAGEMENT
// ============================================

/**
 * GET /api/admin/customers
 * Get all customers with detailed metrics
 * Query params: plan, status, search, limit, offset
 */
router.get('/customers', async (req, res) => {
  try {
    const { plan, status, search, limit = 50, offset = 0 } = req.query;

    let whereConditions = ['1=1'];
    let queryParams = [];

    if (plan && plan !== 'all') {
      queryParams.push(plan);
      whereConditions.push(`o.plan_type = $${queryParams.length}`);
    }

    if (status && status !== 'all') {
      queryParams.push(status);
      whereConditions.push(`o.status = $${queryParams.length}`);
    }

    if (search) {
      queryParams.push(`%${search}%`);
      whereConditions.push(`(o.company_name ILIKE $${queryParams.length} OR o.company_email ILIKE $${queryParams.length})`);
    }

    queryParams.push(limit, offset);

    const result = await db.query(`
      SELECT
        o.id,
        o.company_name,
        o.company_email,
        o.plan_type,
        o.status,
        o.monthly_price,
        o.created_at,
        o.total_qr_scans,
        o.total_uploads,

        -- User metrics
        COUNT(DISTINCT u.id) as total_users,
        o.max_contributors as user_limit,

        -- QR code metrics
        COUNT(DISTINCT q.id) as total_qr_codes,
        o.max_qr_codes as qr_limit,

        -- Storage metrics
        COALESCE(SUM(uf.file_size_bytes) / 1073741824.0, 0) as storage_used_gb,
        o.storage_limit_gb,

        -- Campaign metrics
        COUNT(DISTINCT c.id) as total_campaigns,

        -- Last activity
        MAX(al.created_at) as last_activity_at

      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
      LEFT JOIN uploaded_files uf ON uf.organization_id = o.id
      LEFT JOIN campaigns c ON c.organization_id = o.id
      LEFT JOIN activity_log al ON al.organization_id = o.id

      WHERE ${whereConditions.join(' AND ')}

      GROUP BY o.id
      ORDER BY o.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `, queryParams);

    // Get total count for pagination
    const countResult = await db.query(`
      SELECT COUNT(DISTINCT o.id) as total
      FROM organizations o
      WHERE ${whereConditions.join(' AND ')}
    `, queryParams.slice(0, -2));

    res.json({
      customers: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

/**
 * GET /api/admin/customers/:id
 * Get detailed information about a specific customer
 */
router.get('/customers/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const customerQuery = await db.query(`
      SELECT
        o.*,
        COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT q.id) as total_qr_codes,
        COUNT(DISTINCT c.id) as total_campaigns,
        COALESCE(SUM(uf.file_size_bytes), 0) as storage_used_bytes
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id
      LEFT JOIN campaigns c ON c.organization_id = o.id
      LEFT JOIN uploaded_files uf ON uf.organization_id = o.id
      WHERE o.id = $1
      GROUP BY o.id
    `, [id]);

    if (customerQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get recent activity
    const activityQuery = await db.query(`
      SELECT
        al.action,
        al.entity_type,
        al.created_at,
        u.full_name as user_name
      FROM activity_log al
      LEFT JOIN users u ON al.user_id = u.id
      WHERE al.organization_id = $1
      ORDER BY al.created_at DESC
      LIMIT 20
    `, [id]);

    res.json({
      customer: customerQuery.rows[0],
      recent_activity: activityQuery.rows
    });
  } catch (error) {
    console.error('Get customer details error:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
});

// ============================================
// GEOGRAPHIC ANALYTICS
// ============================================

/**
 * GET /api/admin/geography/top-locations
 * Get top locations by QR scan activity
 */
router.get('/geography/top-locations', async (req, res) => {
  try {
    const { days = 30, limit = 100 } = req.query;

    const result = await db.query(`
      SELECT
        country,
        country_code,
        city,
        state,
        COUNT(*) as scan_count,
        COUNT(DISTINCT qr_code_id) as unique_qr_codes,
        COUNT(DISTINCT organization_id) as unique_customers,
        AVG(latitude) as avg_latitude,
        AVG(longitude) as avg_longitude,

        -- Device breakdown
        SUM(CASE WHEN device_type = 'mobile' THEN 1 ELSE 0 END) as mobile_scans,
        SUM(CASE WHEN device_type = 'desktop' THEN 1 ELSE 0 END) as desktop_scans,
        SUM(CASE WHEN device_type = 'tablet' THEN 1 ELSE 0 END) as tablet_scans

      FROM qr_scan_events
      WHERE scanned_at >= NOW() - INTERVAL '${days} days'
        AND country IS NOT NULL
        AND city IS NOT NULL

      GROUP BY country, country_code, city, state
      ORDER BY scan_count DESC
      LIMIT $1
    `, [limit]);

    res.json(result.rows);
  } catch (error) {
    console.error('Get top locations error:', error);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

/**
 * GET /api/admin/geography/device-stats
 * Get device and browser statistics
 */
router.get('/geography/device-stats', async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await db.query(`
      SELECT
        device_type,
        os,
        browser,
        COUNT(*) as scan_count,
        ROUND((COUNT(*)::numeric / (SELECT COUNT(*) FROM qr_scan_events WHERE scanned_at >= NOW() - INTERVAL '${days} days')) * 100, 2) as percentage

      FROM qr_scan_events
      WHERE scanned_at >= NOW() - INTERVAL '${days} days'

      GROUP BY device_type, os, browser
      ORDER BY scan_count DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get device stats error:', error);
    res.status(500).json({ error: 'Failed to fetch device stats' });
  }
});

// ============================================
// REVENUE ANALYTICS
// ============================================

/**
 * GET /api/admin/revenue/mrr
 * Get Monthly Recurring Revenue breakdown
 */
router.get('/revenue/mrr', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        plan_type,
        COUNT(*) as customer_count,
        SUM(monthly_price) as total_mrr,
        AVG(monthly_price) as avg_price,
        MIN(monthly_price) as min_price,
        MAX(monthly_price) as max_price

      FROM organizations
      WHERE status = 'active'

      GROUP BY plan_type
      ORDER BY total_mrr DESC
    `);

    const totals = await db.query(`
      SELECT
        SUM(monthly_price) as total_mrr,
        COUNT(*) as total_active_customers,
        SUM(monthly_price) * 12 as annual_run_rate
      FROM organizations
      WHERE status = 'active'
    `);

    res.json({
      by_plan: result.rows,
      totals: totals.rows[0]
    });
  } catch (error) {
    console.error('Get MRR error:', error);
    res.status(500).json({ error: 'Failed to fetch MRR data' });
  }
});

/**
 * GET /api/admin/revenue/history
 * Get revenue history over time
 */
router.get('/revenue/history', async (req, res) => {
  try {
    const { months = 12 } = req.query;

    const result = await db.query(`
      SELECT
        DATE_TRUNC('month', sh.event_date) as month,
        plan_type,
        COUNT(*) as events,
        SUM(monthly_price) as mrr

      FROM subscription_history sh

      WHERE sh.event_date >= NOW() - INTERVAL '${months} months'
        AND sh.event_type IN ('created', 'upgraded', 'downgraded', 'renewed')

      GROUP BY DATE_TRUNC('month', sh.event_date), plan_type
      ORDER BY month DESC, plan_type
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get revenue history error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue history' });
  }
});

// ============================================
// OPPORTUNITIES
// ============================================

/**
 * GET /api/admin/opportunities/upgrades
 * Find customers ready to upgrade
 */
router.get('/opportunities/upgrades', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        o.id,
        o.company_name,
        o.company_email,
        o.plan_type,
        o.monthly_price,
        o.created_at as customer_since,

        -- User limit status
        COUNT(DISTINCT u.id) as current_users,
        o.max_contributors as user_limit,
        ROUND((COUNT(DISTINCT u.id)::numeric / NULLIF(o.max_contributors, 0)) * 100, 1) as user_limit_percent,

        -- QR code limit status
        COUNT(DISTINCT q.id) as current_qr_codes,
        o.max_qr_codes as qr_limit,
        ROUND((COUNT(DISTINCT q.id)::numeric / NULLIF(o.max_qr_codes, 0)) * 100, 1) as qr_limit_percent,

        -- Activity level
        o.total_qr_scans,
        COUNT(DISTINCT al.id) as activities_last_30_days,

        -- Calculate upgrade score (0-100)
        LEAST(
          COALESCE(
            (COUNT(DISTINCT u.id)::numeric / NULLIF(o.max_contributors, 0)) * 50 +
            (COUNT(DISTINCT q.id)::numeric / NULLIF(o.max_qr_codes, 0)) * 30 +
            (COUNT(DISTINCT al.id)::numeric / 100.0) * 20
          , 0),
          100
        )::int as upgrade_score,

        -- Potential revenue increase
        CASE
          WHEN o.plan_type = 'small_business' THEN 29
          WHEN o.plan_type = 'medium_business' THEN 70
          ELSE 0
        END as potential_mrr_increase

      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
      LEFT JOIN activity_log al ON al.organization_id = o.id
        AND al.created_at >= NOW() - INTERVAL '30 days'

      WHERE o.status = 'active'
        AND o.plan_type IN ('small_business', 'medium_business')

      GROUP BY o.id

      HAVING
        -- Close to limits or very active
        (COUNT(DISTINCT u.id)::numeric / NULLIF(o.max_contributors, 0)) >= 0.6
        OR (COUNT(DISTINCT q.id)::numeric / NULLIF(o.max_qr_codes, 0)) >= 0.6
        OR COUNT(DISTINCT al.id) > 50

      ORDER BY
        LEAST(
          COALESCE(
            (COUNT(DISTINCT u.id)::numeric / NULLIF(o.max_contributors, 0)) * 50 +
            (COUNT(DISTINCT q.id)::numeric / NULLIF(o.max_qr_codes, 0)) * 30 +
            (COUNT(DISTINCT al.id)::numeric / 100.0) * 20
          , 0),
          100
        ) DESC,
        o.total_qr_scans DESC

      LIMIT 50
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get upgrade opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch upgrade opportunities' });
  }
});

/**
 * GET /api/admin/opportunities/churn-risk
 * Find customers at risk of churning
 */
router.get('/opportunities/churn-risk', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        o.id,
        o.company_name,
        o.company_email,
        o.plan_type,
        o.monthly_price,
        o.created_at as customer_since,

        -- Last activity
        MAX(al.created_at) as last_activity,
        EXTRACT(DAY FROM NOW() - MAX(al.created_at))::int as days_inactive,

        -- Usage metrics
        COUNT(DISTINCT al.id) as total_activities,
        o.total_qr_scans,

        -- Risk score
        CASE
          WHEN MAX(al.created_at) < NOW() - INTERVAL '30 days' THEN 'HIGH'
          WHEN MAX(al.created_at) < NOW() - INTERVAL '14 days' THEN 'MEDIUM'
          ELSE 'LOW'
        END as churn_risk

      FROM organizations o
      LEFT JOIN activity_log al ON al.organization_id = o.id

      WHERE o.status = 'active'
        AND o.plan_type IN ('medium_business', 'enterprise')  -- Paying customers

      GROUP BY o.id

      HAVING MAX(al.created_at) < NOW() - INTERVAL '7 days'  -- No activity in 7 days

      ORDER BY MAX(al.created_at) ASC

      LIMIT 50
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get churn risk error:', error);
    res.status(500).json({ error: 'Failed to fetch churn risk data' });
  }
});

/**
 * GET /api/admin/opportunities/top-performers
 * Find best performing customers for case studies
 */
router.get('/opportunities/top-performers', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        o.company_name,
        o.company_email,
        o.plan_type,
        o.created_at as customer_since,

        -- Usage metrics
        COUNT(DISTINCT u.id) as team_size,
        COUNT(DISTINCT q.id) as qr_codes,
        o.total_qr_scans,
        COUNT(DISTINCT c.id) as campaigns,

        -- Effectiveness metric
        CASE
          WHEN COUNT(DISTINCT q.id) > 0
          THEN ROUND(o.total_qr_scans::numeric / COUNT(DISTINCT q.id), 1)
          ELSE 0
        END as avg_scans_per_qr,

        -- Activity score
        COUNT(DISTINCT al.id) as total_activities,

        -- Geographic reach
        COUNT(DISTINCT qse.country) as countries_reached

      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
      LEFT JOIN campaigns c ON c.organization_id = o.id
      LEFT JOIN activity_log al ON al.organization_id = o.id
      LEFT JOIN qr_scan_events qse ON qse.organization_id = o.id

      WHERE o.status = 'active'

      GROUP BY o.id

      HAVING o.total_qr_scans > 1000
        AND COUNT(DISTINCT c.id) >= 3

      ORDER BY
        o.total_qr_scans DESC,
        COUNT(DISTINCT al.id) DESC

      LIMIT 20
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
});

// ============================================
// DATA EXPORT ROUTES
// ============================================

/**
 * GET /api/admin/export/customers
 * Export all customer data
 * Query params: format (csv, excel, pdf)
 */
router.get('/export/customers', async (req, res) => {
  try {
    const { format = 'csv' } = req.query;

    const result = await db.query(`
      SELECT
        o.company_name,
        o.company_email,
        o.plan_type,
        o.status,
        o.monthly_price,
        o.created_at,
        COUNT(DISTINCT u.id) as users,
        COUNT(DISTINCT q.id) as qr_codes,
        o.total_qr_scans,
        COUNT(DISTINCT c.id) as campaigns,
        COALESCE(SUM(uf.file_size_bytes) / 1073741824.0, 0) as storage_gb

      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id
      LEFT JOIN campaigns c ON c.organization_id = o.id
      LEFT JOIN uploaded_files uf ON uf.organization_id = o.id

      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    if (format === 'csv') {
      const csv = exportToCSV(result.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment('customers.csv');
      return res.send(csv);
    } else if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'Customers');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('customers.xlsx');
      return res.send(excel);
    }

    res.status(400).json({ error: 'Invalid format' });
  } catch (error) {
    console.error('Export customers error:', error);
    res.status(500).json({ error: 'Failed to export customers' });
  }
});

/**
 * GET /api/admin/export/geographic
 * Export geographic QR scan data (anonymized for selling)
 */
router.get('/export/geographic', async (req, res) => {
  try {
    const { format = 'csv', days = 30 } = req.query;

    const result = await db.query(`
      SELECT
        scanned_at::date as scan_date,
        country,
        country_code,
        city,
        state,
        latitude,
        longitude,
        device_type,
        os,
        browser,

        -- Aggregate data (no individual customer info)
        COUNT(*) as total_scans,
        COUNT(DISTINCT qr_code_id) as unique_qr_codes,

        -- Time of day distribution
        SUM(CASE WHEN EXTRACT(HOUR FROM scanned_at) BETWEEN 6 AND 12 THEN 1 ELSE 0 END) as morning_scans,
        SUM(CASE WHEN EXTRACT(HOUR FROM scanned_at) BETWEEN 12 AND 18 THEN 1 ELSE 0 END) as afternoon_scans,
        SUM(CASE WHEN EXTRACT(HOUR FROM scanned_at) BETWEEN 18 AND 24 THEN 1 ELSE 0 END) as evening_scans

      FROM qr_scan_events

      WHERE scanned_at >= NOW() - INTERVAL '${days} days'
        AND country IS NOT NULL

      GROUP BY
        scanned_at::date,
        country,
        country_code,
        city,
        state,
        latitude,
        longitude,
        device_type,
        os,
        browser

      HAVING COUNT(*) >= 10  -- Only statistically significant data

      ORDER BY total_scans DESC
    `);

    if (format === 'csv') {
      const csv = exportToCSV(result.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment('geographic_data.csv');
      return res.send(csv);
    } else if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'Geographic Data');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('geographic_data.xlsx');
      return res.send(excel);
    } else if (format === 'json') {
      res.json(result.rows);
    }
  } catch (error) {
    console.error('Export geographic data error:', error);
    res.status(500).json({ error: 'Failed to export geographic data' });
  }
});

/**
 * GET /api/admin/export/revenue
 * Export revenue report
 */
router.get('/export/revenue', async (req, res) => {
  try {
    const { format = 'excel' } = req.query;

    const result = await db.query(`
      SELECT
        o.company_name,
        o.plan_type,
        o.monthly_price,
        o.status,
        o.created_at as customer_since,
        o.subscription_start_date,
        o.total_qr_scans,
        COUNT(DISTINCT u.id) as team_size

      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'

      WHERE o.status = 'active'

      GROUP BY o.id
      ORDER BY o.monthly_price DESC, o.company_name
    `);

    if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'Revenue Report');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment('revenue_report.xlsx');
      return res.send(excel);
    }

    res.status(400).json({ error: 'Invalid format' });
  } catch (error) {
    console.error('Export revenue error:', error);
    res.status(500).json({ error: 'Failed to export revenue' });
  }
});

module.exports = router;

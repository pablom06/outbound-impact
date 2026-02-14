// CUSTOMER DATA EXPORT ROUTES
// Tenant-scoped exports - each customer can only export THEIR data
// Export capabilities differ by plan tier

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { setTenantContext } = require('../middleware/tenantContext');
const { exportToCSV, exportToExcel, exportToPDF } = require('../utils/exporters');

// Apply authentication and tenant context to all routes
router.use(authenticateToken);
router.use(setTenantContext);

// Plan-based export permissions
const EXPORT_PERMISSIONS = {
  small_business: ['csv'],
  medium_business: ['csv', 'excel'],
  enterprise: ['csv', 'excel', 'pdf', 'custom']
};

/**
 * Middleware to check if user's plan allows the requested format
 */
function checkExportPermission(req, res, next) {
  const { format } = req.query;
  const planType = req.user.plan_type;
  const allowedFormats = EXPORT_PERMISSIONS[planType] || [];

  if (!allowedFormats.includes(format)) {
    return res.status(403).json({
      error: `Export format '${format}' not available in ${planType} plan`,
      allowed_formats: allowedFormats,
      upgrade_required: true,
      upgrade_to: planType === 'small_business' ? 'medium_business' : 'enterprise'
    });
  }

  next();
}

// ============================================
// ACTIVITY / ALL UPLOADS EXPORT
// ============================================

/**
 * GET /api/exports/activity
 * Export all activity/uploads for this organization
 * Small: CSV only
 * Medium: CSV + Excel
 * Enterprise: CSV + Excel + PDF
 */
router.get('/activity', checkExportPermission, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const organizationId = req.organizationId;

    // Query all activity for this organization
    const result = await db.query(`
      SELECT
        uf.file_name as "Asset Name",
        uf.file_type as "Type",
        ROUND(uf.file_size_bytes / 1048576.0, 2) as "Size (MB)",
        uf.total_views as "Views",
        c.name as "Campaign",
        uf.created_at::date as "Upload Date",
        u.full_name as "Uploaded By"
      FROM uploaded_files uf
      LEFT JOIN campaigns c ON uf.campaign_id = c.id
      LEFT JOIN users u ON uf.uploaded_by_user_id = u.id
      WHERE uf.organization_id = $1
      ORDER BY uf.created_at DESC
    `, [organizationId]);

    const filename = `activity_export_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(result.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${filename}.csv`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'Activity');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`${filename}.xlsx`);
      return res.send(excel);
    }

    if (format === 'pdf') {
      const pdf = await exportToPDF(result.rows, 'Activity Report');
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${filename}.pdf`);
      return res.send(pdf);
    }

  } catch (error) {
    console.error('Export activity error:', error);
    res.status(500).json({ error: 'Failed to export activity data' });
  }
});

// ============================================
// QR CODES EXPORT
// ============================================

/**
 * GET /api/exports/qr-codes
 * Export all QR codes for this organization
 */
router.get('/qr-codes', checkExportPermission, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const organizationId = req.organizationId;

    const result = await db.query(`
      SELECT
        q.name as "QR Code Name",
        q.location as "Location",
        q.qr_url as "Target URL",
        q.total_scans as "Total Scans",
        q.created_at::date as "Created Date",
        q.last_scanned_at as "Last Scanned",
        q.status as "Status",
        u.full_name as "Created By"
      FROM qr_codes q
      LEFT JOIN users u ON q.created_by_user_id = u.id
      WHERE q.organization_id = $1
      ORDER BY q.total_scans DESC, q.created_at DESC
    `, [organizationId]);

    const filename = `qr_codes_export_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(result.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${filename}.csv`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'QR Codes');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`${filename}.xlsx`);
      return res.send(excel);
    }

    if (format === 'pdf') {
      const pdf = await exportToPDF(result.rows, 'QR Codes Report');
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${filename}.pdf`);
      return res.send(pdf);
    }

  } catch (error) {
    console.error('Export QR codes error:', error);
    res.status(500).json({ error: 'Failed to export QR code data' });
  }
});

// ============================================
// QR SCAN ANALYTICS EXPORT
// ============================================

/**
 * GET /api/exports/qr-scans
 * Export detailed QR scan events for this organization
 * Enterprise only feature - shows individual scan events
 */
router.get('/qr-scans', checkExportPermission, async (req, res) => {
  try {
    const { format = 'csv', days = 30 } = req.query;
    const organizationId = req.organizationId;

    const result = await db.query(`
      SELECT
        qse.scanned_at::timestamp as "Scan DateTime",
        q.name as "QR Code",
        qse.city as "City",
        qse.state as "State",
        qse.country as "Country",
        qse.device_type as "Device Type",
        qse.os as "Operating System",
        qse.browser as "Browser"
      FROM qr_scan_events qse
      JOIN qr_codes q ON qse.qr_code_id = q.id
      WHERE qse.organization_id = $1
        AND qse.scanned_at >= NOW() - INTERVAL '${days} days'
      ORDER BY qse.scanned_at DESC
      LIMIT 10000
    `, [organizationId]);

    const filename = `qr_scans_${days}days_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(result.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${filename}.csv`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'QR Scan Events');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`${filename}.xlsx`);
      return res.send(excel);
    }

    if (format === 'pdf') {
      const pdf = await exportToPDF(result.rows, 'QR Scan Analytics');
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${filename}.pdf`);
      return res.send(pdf);
    }

  } catch (error) {
    console.error('Export QR scans error:', error);
    res.status(500).json({ error: 'Failed to export QR scan data' });
  }
});

// ============================================
// CAMPAIGNS EXPORT
// ============================================

/**
 * GET /api/exports/campaigns
 * Export all campaigns for this organization
 */
router.get('/campaigns', checkExportPermission, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const organizationId = req.organizationId;

    const result = await db.query(`
      SELECT
        c.name as "Campaign Name",
        c.description as "Description",
        c.start_date as "Start Date",
        c.end_date as "End Date",
        c.status as "Status",
        c.total_views as "Total Views",
        c.total_qr_codes as "QR Codes",
        c.total_assets as "Assets",
        c.performance_score as "Performance Score",
        c.created_at::date as "Created Date",
        u.full_name as "Created By"
      FROM campaigns c
      LEFT JOIN users u ON c.created_by_user_id = u.id
      WHERE c.organization_id = $1
      ORDER BY c.created_at DESC
    `, [organizationId]);

    const filename = `campaigns_export_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(result.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${filename}.csv`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'Campaigns');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`${filename}.xlsx`);
      return res.send(excel);
    }

    if (format === 'pdf') {
      const pdf = await exportToPDF(result.rows, 'Campaigns Report');
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${filename}.pdf`);
      return res.send(pdf);
    }

  } catch (error) {
    console.error('Export campaigns error:', error);
    res.status(500).json({ error: 'Failed to export campaign data' });
  }
});

// ============================================
// ANALYTICS SUMMARY EXPORT
// ============================================

/**
 * GET /api/exports/analytics
 * Export analytics summary for this organization
 * Medium & Enterprise only
 */
router.get('/analytics', checkExportPermission, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const organizationId = req.organizationId;

    // Get comprehensive analytics
    const statsQuery = await db.query(`
      SELECT
        'Total Users' as "Metric",
        COUNT(DISTINCT u.id)::text as "Value"
      FROM users u
      WHERE u.organization_id = $1 AND u.status = 'active'

      UNION ALL

      SELECT
        'Total QR Codes',
        COUNT(DISTINCT q.id)::text
      FROM qr_codes q
      WHERE q.organization_id = $1

      UNION ALL

      SELECT
        'Total QR Scans',
        SUM(q.total_scans)::text
      FROM qr_codes q
      WHERE q.organization_id = $1

      UNION ALL

      SELECT
        'Total Campaigns',
        COUNT(DISTINCT c.id)::text
      FROM campaigns c
      WHERE c.organization_id = $1

      UNION ALL

      SELECT
        'Total Uploads',
        COUNT(DISTINCT uf.id)::text
      FROM uploaded_files uf
      WHERE uf.organization_id = $1

      UNION ALL

      SELECT
        'Storage Used (GB)',
        ROUND(SUM(uf.file_size_bytes) / 1073741824.0, 2)::text
      FROM uploaded_files uf
      WHERE uf.organization_id = $1
    `, [organizationId]);

    const filename = `analytics_summary_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(statsQuery.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${filename}.csv`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const excel = await exportToExcel(statsQuery.rows, 'Analytics Summary');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`${filename}.xlsx`);
      return res.send(excel);
    }

    if (format === 'pdf') {
      const pdf = await exportToPDF(statsQuery.rows, 'Analytics Summary');
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${filename}.pdf`);
      return res.send(pdf);
    }

  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({ error: 'Failed to export analytics data' });
  }
});

// ============================================
// TEAM MEMBERS / CONTRIBUTORS EXPORT
// ============================================

/**
 * GET /api/exports/team
 * Export team members/contributors for this organization
 */
router.get('/team', checkExportPermission, async (req, res) => {
  try {
    const { format = 'csv' } = req.query;
    const organizationId = req.organizationId;

    const result = await db.query(`
      SELECT
        u.full_name as "Full Name",
        u.email as "Email",
        u.role as "Role",
        u.status as "Status",
        u.created_at::date as "Joined Date",
        u.last_login_at as "Last Login",
        u.login_count as "Total Logins"
      FROM users u
      WHERE u.organization_id = $1
      ORDER BY u.created_at ASC
    `, [organizationId]);

    const filename = `team_export_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(result.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${filename}.csv`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'Team Members');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`${filename}.xlsx`);
      return res.send(excel);
    }

    if (format === 'pdf') {
      const pdf = await exportToPDF(result.rows, 'Team Members Report');
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${filename}.pdf`);
      return res.send(pdf);
    }

  } catch (error) {
    console.error('Export team error:', error);
    res.status(500).json({ error: 'Failed to export team data' });
  }
});

// ============================================
// CUSTOM EXPORT (Enterprise Only)
// ============================================

/**
 * POST /api/exports/custom
 * Create a custom export with user-defined columns and filters
 * Enterprise only feature
 */
router.post('/custom', checkExportPermission, async (req, res) => {
  try {
    const { format = 'csv', entity_type, columns, filters, date_range } = req.body;
    const organizationId = req.organizationId;

    // Validate entity type
    const allowedEntities = ['qr_codes', 'campaigns', 'uploads', 'qr_scans', 'team'];
    if (!allowedEntities.includes(entity_type)) {
      return res.status(400).json({ error: 'Invalid entity type' });
    }

    // Build dynamic query based on user selections
    let tableName, columnMap;

    if (entity_type === 'qr_codes') {
      tableName = 'qr_codes';
      columnMap = {
        name: 'name',
        location: 'location',
        url: 'qr_url',
        scans: 'total_scans',
        created: 'created_at::date',
        status: 'status'
      };
    } else if (entity_type === 'campaigns') {
      tableName = 'campaigns';
      columnMap = {
        name: 'name',
        description: 'description',
        start_date: 'start_date',
        end_date: 'end_date',
        views: 'total_views',
        status: 'status'
      };
    }
    // ... add other entity types

    // Build SELECT clause
    const selectedColumns = columns || Object.keys(columnMap);
    const selectClause = selectedColumns
      .filter(col => columnMap[col])
      .map(col => `${columnMap[col]} as "${col}"`)
      .join(', ');

    // Build WHERE clause
    let whereClause = `organization_id = $1`;
    const queryParams = [organizationId];

    if (date_range && date_range.start) {
      queryParams.push(date_range.start);
      whereClause += ` AND created_at >= $${queryParams.length}`;
    }

    if (date_range && date_range.end) {
      queryParams.push(date_range.end);
      whereClause += ` AND created_at <= $${queryParams.length}`;
    }

    // Execute query
    const query = `
      SELECT ${selectClause}
      FROM ${tableName}
      WHERE ${whereClause}
      ORDER BY created_at DESC
    `;

    const result = await db.query(query, queryParams);

    const filename = `custom_${entity_type}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      const csv = exportToCSV(result.rows);
      res.header('Content-Type', 'text/csv');
      res.attachment(`${filename}.csv`);
      return res.send(csv);
    }

    if (format === 'excel') {
      const excel = await exportToExcel(result.rows, 'Custom Export');
      res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.attachment(`${filename}.xlsx`);
      return res.send(excel);
    }

    if (format === 'pdf') {
      const pdf = await exportToPDF(result.rows, 'Custom Export Report');
      res.header('Content-Type', 'application/pdf');
      res.attachment(`${filename}.pdf`);
      return res.send(pdf);
    }

  } catch (error) {
    console.error('Custom export error:', error);
    res.status(500).json({ error: 'Failed to create custom export' });
  }
});

// ============================================
// GET AVAILABLE EXPORT FORMATS
// ============================================

/**
 * GET /api/exports/available-formats
 * Returns what export formats are available for this user's plan
 */
router.get('/available-formats', async (req, res) => {
  try {
    const planType = req.user.plan_type;
    const allowedFormats = EXPORT_PERMISSIONS[planType] || [];

    const formatDetails = {
      csv: {
        name: 'CSV',
        description: 'Comma-separated values, works with Excel and Google Sheets',
        available: allowedFormats.includes('csv')
      },
      excel: {
        name: 'Excel',
        description: 'Microsoft Excel format (.xlsx) with formatting',
        available: allowedFormats.includes('excel'),
        upgrade_required: !allowedFormats.includes('excel')
      },
      pdf: {
        name: 'PDF',
        description: 'Printable PDF report',
        available: allowedFormats.includes('pdf'),
        upgrade_required: !allowedFormats.includes('pdf')
      },
      custom: {
        name: 'Custom Export',
        description: 'Create custom exports with your chosen columns',
        available: allowedFormats.includes('custom'),
        upgrade_required: !allowedFormats.includes('custom')
      }
    };

    res.json({
      plan_type: planType,
      allowed_formats: allowedFormats,
      formats: formatDetails
    });
  } catch (error) {
    console.error('Get export formats error:', error);
    res.status(500).json({ error: 'Failed to fetch export formats' });
  }
});

module.exports = router;

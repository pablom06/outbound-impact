// Items/QR Codes Routes
const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const { deleteFile } = require('../../config/storage');
const { authenticateToken } = require('../middleware/auth');

// Get all items for user's organization
router.get('/', authenticateToken, async (req, res) => {
  try {
    const organizationId = req.user.organizationId;

    const result = await db.query(
      `SELECT
        uf.id, uf.title, uf.description, uf.type_category as type,
        uf.storage_url as "fileUrl", uf.slug, uf.created_at as "createdAt",
        uf.embed_url as "embedUrl", uf.content_text as "contentText",
        q.id as "qrCodeId",
        COALESCE(q.total_scans, 0) as views
       FROM uploaded_files uf
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1
       ORDER BY uf.created_at DESC`,
      [organizationId]
    );

    // Add QR code URLs
    const items = result.rows.map(item => ({
      ...item,
      viewUrl: `${process.env.PUBLIC_URL || 'https://outboundimpact.net'}/view/${item.slug}`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${process.env.PUBLIC_URL || 'https://outboundimpact.net'}/view/${item.slug}`)}`
    }));

    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// Get single item by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    const result = await db.query(
      `SELECT
        uf.*, q.total_scans as views,
        q.id as "qrCodeId"
       FROM uploaded_files uf
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.id = $1 AND uf.organization_id = $2`,
      [id, organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const item = result.rows[0];
    item.viewUrl = `${process.env.PUBLIC_URL || 'https://outboundimpact.net'}/view/${item.slug}`;
    item.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(item.viewUrl)}`;

    res.json(item);
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Get public item by slug (no auth required)
router.get('/public/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const result = await db.query(
      `SELECT
        uf.id, uf.title, uf.description, uf.type_category as type,
        uf.storage_url as "fileUrl", uf.slug, uf.created_at as "createdAt",
        uf.embed_url as "embedUrl", uf.content_text as "contentText",
        o.company_name as "organizationName"
       FROM uploaded_files uf
       JOIN organizations o ON uf.organization_id = o.id
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.slug = $1 AND q.status = 'active'`,
      [slug]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Record the view/scan
    await db.query(
      `UPDATE qr_codes SET total_scans = total_scans + 1 WHERE slug = $1`,
      [slug]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get public item error:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

// Update item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const organizationId = req.user.organizationId;

    const result = await db.query(
      `UPDATE uploaded_files
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           updated_at = NOW()
       WHERE id = $3 AND organization_id = $4
       RETURNING *`,
      [title, description, id, organizationId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const organizationId = req.user.organizationId;

    // Get item to check ownership and get storage key
    const item = await db.query(
      'SELECT * FROM uploaded_files WHERE id = $1 AND organization_id = $2',
      [id, organizationId]
    );

    if (item.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete from storage if it has a file
    if (item.rows[0].storage_key) {
      try {
        await deleteFile(item.rows[0].storage_key);
      } catch (e) {
        console.error('Failed to delete file from storage:', e);
      }
    }

    // Delete QR code
    await db.query('DELETE FROM qr_codes WHERE uploaded_file_id = $1', [id]);

    // Delete item
    await db.query('DELETE FROM uploaded_files WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;

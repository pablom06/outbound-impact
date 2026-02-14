// Upload Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('../../config/database');
const { uploadFile } = require('../../config/storage');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed'), false);
    }
  }
});

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 50) + '-' + Math.random().toString(36).slice(2, 8);
}

// Upload file
router.post('/file', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { title, description } = req.body;
    const file = req.file;
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    // Generate unique filename
    const ext = path.extname(file.originalname);
    const key = `uploads/${organizationId}/${uuidv4()}${ext}`;

    // Upload to S3-compatible storage
    const uploadResult = await uploadFile(file.buffer, key, file.mimetype);

    // Generate slug for QR code
    const slug = generateSlug(title || file.originalname);

    // Get file type category
    const typeCategory = file.mimetype.split('/')[0]; // image, video, audio, etc.

    // Save to database
    const result = await db.query(
      `INSERT INTO uploaded_files
       (organization_id, user_id, title, description, file_name, file_size_bytes,
        mime_type, storage_key, storage_url, slug, type_category)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        organizationId,
        userId,
        title || file.originalname,
        description || '',
        file.originalname,
        file.size,
        file.mimetype,
        key,
        uploadResult.url,
        slug,
        typeCategory
      ]
    );

    const uploadedFile = result.rows[0];

    // Create QR code entry
    const qrResult = await db.query(
      `INSERT INTO qr_codes (organization_id, uploaded_file_id, slug, status)
       VALUES ($1, $2, $3, 'active')
       RETURNING *`,
      [organizationId, uploadedFile.id, slug]
    );

    // Generate QR code URL using public API
    const viewUrl = `${process.env.PUBLIC_URL || 'https://outboundimpact.net'}/view/${slug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(viewUrl)}`;

    res.status(201).json({
      id: uploadedFile.id,
      slug,
      title: uploadedFile.title,
      description: uploadedFile.description,
      type: typeCategory,
      fileUrl: uploadResult.url,
      qrCodeUrl,
      viewUrl,
      createdAt: uploadedFile.created_at
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Create text post
router.post('/text', authenticateToken, async (req, res) => {
  try {
    const { title, content, description } = req.body;
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const slug = generateSlug(title);

    // Save to database
    const result = await db.query(
      `INSERT INTO uploaded_files
       (organization_id, user_id, title, description, content_text, type_category, slug)
       VALUES ($1, $2, $3, $4, $5, 'text', $6)
       RETURNING *`,
      [organizationId, userId, title, description || '', content, slug]
    );

    const textPost = result.rows[0];

    // Create QR code entry
    await db.query(
      `INSERT INTO qr_codes (organization_id, uploaded_file_id, slug, status)
       VALUES ($1, $2, $3, 'active')`,
      [organizationId, textPost.id, slug]
    );

    const viewUrl = `${process.env.PUBLIC_URL || 'https://outboundimpact.net'}/view/${slug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(viewUrl)}`;

    res.status(201).json({
      id: textPost.id,
      slug,
      title: textPost.title,
      description: textPost.description,
      type: 'text',
      qrCodeUrl,
      viewUrl,
      createdAt: textPost.created_at
    });
  } catch (error) {
    console.error('Create text post error:', error);
    res.status(500).json({ error: 'Failed to create text post' });
  }
});

// Create embed post
router.post('/embed', authenticateToken, async (req, res) => {
  try {
    const { title, url, description } = req.body;
    const userId = req.user.userId;
    const organizationId = req.user.organizationId;

    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const slug = generateSlug(title || 'embed');

    // Save to database
    const result = await db.query(
      `INSERT INTO uploaded_files
       (organization_id, user_id, title, description, embed_url, type_category, slug)
       VALUES ($1, $2, $3, $4, $5, 'embed', $6)
       RETURNING *`,
      [organizationId, userId, title || 'Embedded Content', description || '', url, slug]
    );

    const embedPost = result.rows[0];

    // Create QR code entry
    await db.query(
      `INSERT INTO qr_codes (organization_id, uploaded_file_id, slug, status)
       VALUES ($1, $2, $3, 'active')`,
      [organizationId, embedPost.id, slug]
    );

    const viewUrl = `${process.env.PUBLIC_URL || 'https://outboundimpact.net'}/view/${slug}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(viewUrl)}`;

    res.status(201).json({
      id: embedPost.id,
      slug,
      title: embedPost.title,
      description: embedPost.description,
      type: 'embed',
      embedUrl: url,
      qrCodeUrl,
      viewUrl,
      createdAt: embedPost.created_at
    });
  } catch (error) {
    console.error('Create embed post error:', error);
    res.status(500).json({ error: 'Failed to create embed post' });
  }
});

module.exports = router;

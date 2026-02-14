// Vercel Serverless Function - Self-contained Express App
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sgMail = require('@sendgrid/mail');
const multer = require('multer');
const https = require('https');

// Multer for parsing SendGrid Inbound Parse webhook (multipart form data)
const upload = multer();

// ============================================
// BUNNY.NET STORAGE HELPER
// Uploads files to Bunny Storage and serves via Bunny CDN
// ============================================
const BUNNY_STORAGE_ZONE = process.env.BUNNY_STORAGE_ZONE || '';
const BUNNY_API_KEY = process.env.BUNNY_API_KEY || '';
const BUNNY_CDN_URL = process.env.BUNNY_CDN_URL || ''; // e.g. https://yourzone.b-cdn.net
const BUNNY_STORAGE_REGION = process.env.BUNNY_STORAGE_REGION || ''; // empty = Falkenstein, ny/la/sg/etc

function getBunnyStorageHost() {
  const region = BUNNY_STORAGE_REGION;
  if (!region || region === 'de') return 'storage.bunnycdn.com';
  return `${region}.storage.bunnycdn.com`;
}

function uploadToBunny(filePath, fileBuffer) {
  return new Promise((resolve, reject) => {
    const hostname = getBunnyStorageHost();
    const fullPath = `/${BUNNY_STORAGE_ZONE}/${filePath}`;

    const options = {
      hostname,
      port: 443,
      path: fullPath,
      method: 'PUT',
      headers: {
        'AccessKey': BUNNY_API_KEY,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 201 || res.statusCode === 200) {
          const cdnUrl = `${BUNNY_CDN_URL}/${filePath}`;
          resolve(cdnUrl);
        } else {
          reject(new Error(`Bunny upload failed: ${res.statusCode} ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(fileBuffer);
    req.end();
  });
}

function deleteFromBunny(filePath) {
  return new Promise((resolve, reject) => {
    const hostname = getBunnyStorageHost();
    const fullPath = `/${BUNNY_STORAGE_ZONE}/${filePath}`;

    const options = {
      hostname,
      port: 443,
      path: fullPath,
      method: 'DELETE',
      headers: { 'AccessKey': BUNNY_API_KEY }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.end();
  });
}

const bunnyEnabled = () => BUNNY_STORAGE_ZONE && BUNNY_API_KEY && BUNNY_CDN_URL;

const app = express();

// Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// SendGrid Configuration
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@outboundimpact.com';

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json({ limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// One-time migration endpoint - adds BYTEA columns for file storage
// Call this once after deploying: GET /run-migration
app.get('/run-migration', async (req, res) => {
  try {
    // Add file_data BYTEA column if not exists
    await pool.query(`
      ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS file_data BYTEA;
    `);

    // Add thumbnail_data BYTEA column if not exists
    await pool.query(`
      ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS thumbnail_data BYTEA;
    `);

    res.json({
      success: true,
      message: 'Migration completed - BYTEA columns added to uploaded_files table'
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Migration failed', details: error.message });
  }
});

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Optional auth middleware - uses demo user if no token provided
const optionalAuthMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (error) {
      // Invalid token, use demo user
      req.user = { userId: 'demo', email: 'demo@outboundimpact.com', organizationId: 'demo-org' };
    }
  } else {
    // No token, use demo user
    req.user = { userId: 'demo', email: 'demo@outboundimpact.com', organizationId: 'demo-org' };
  }
  next();
};

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const orgResult = await pool.query(
      `INSERT INTO organizations (company_name, company_email, plan_type, status)
       VALUES ($1, $2, 'personal', 'active') RETURNING id`,
      [fullName || email.split('@')[0], email.toLowerCase()]
    );
    const userResult = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, organization_id, role, status)
       VALUES ($1, $2, $3, $4, 'owner', 'active') RETURNING id, email, full_name, role`,
      [email.toLowerCase(), passwordHash, fullName || '', orgResult.rows[0].id]
    );
    const token = jwt.sign(
      { userId: userResult.rows[0].id, email, organizationId: orgResult.rows[0].id },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.status(201).json({ token, user: userResult.rows[0] });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email already registered' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, organizationId: user.organization_id },
      JWT_SECRET, { expiresIn: '7d' }
    );
    res.json({ token, user: { id: user.id, email: user.email, fullName: user.full_name, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, o.plan_type
       FROM users u JOIN organizations o ON u.organization_id = o.id WHERE u.id = $1`,
      [req.user.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Dashboard stats
app.get('/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const stats = await pool.query(
      `SELECT COUNT(DISTINCT uf.id) as uploads, COALESCE(SUM(q.total_scans), 0) as views,
       COUNT(DISTINCT q.id) as qr_codes, COALESCE(SUM(uf.file_size_bytes), 0) as storage_used
       FROM uploaded_files uf LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1`, [orgId]
    );
    res.json({
      uploads: parseInt(stats.rows[0].uploads) || 0,
      views: parseInt(stats.rows[0].views) || 0,
      qrCodes: parseInt(stats.rows[0].qr_codes) || 0,
      storageUsed: parseInt(stats.rows[0].storage_used) || 0,
      storageLimit: 1073741824,
      uploadLimit: 3
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// Items
app.get('/items', authMiddleware, async (req, res) => {
  try {
    const baseUrl = process.env.API_BASE_URL || 'https://outbound-impact-backend-eight.vercel.app';
    const result = await pool.query(
      `SELECT uf.id, uf.title, uf.description, uf.type_category as type,
       uf.storage_url, (uf.file_data IS NOT NULL) as has_file,
       uf.slug, uf.created_at as "createdAt", COALESCE(q.total_scans, 0) as views
       FROM uploaded_files uf LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1 ORDER BY uf.created_at DESC`,
      [req.user.organizationId]
    );
    const items = result.rows.map(item => ({
      ...item,
      fileUrl: item.storage_url || (item.has_file ? `${baseUrl}/files/${item.id}` : null),
      viewUrl: `https://outboundimpact.net/view/${item.slug}`,
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://outboundimpact.net/view/${item.slug}`)}`
    }));
    res.json(items);
  } catch (error) {
    console.error('Items error:', error);
    res.status(500).json({ error: 'Failed to get items' });
  }
});

// Chat (simple in-memory for demo)
const conversations = new Map();

app.post('/chat/conversations', (req, res) => {
  const id = uuidv4();
  conversations.set(id, { id, messages: [] });
  res.status(201).json({ id, conversation: { id } });
});

app.post('/chat/conversations/:id/messages', (req, res) => {
  const { content } = req.body;
  const responses = [
    "To create a QR code, upload content from your dashboard and a QR code will be generated automatically!",
    "You can view your analytics in the Analytics tab to see how your QR codes are performing.",
    "Need help? Check out our documentation or contact support@outboundimpact.com"
  ];
  res.json({
    userMessage: { id: uuidv4(), role: 'user', content, createdAt: new Date().toISOString() },
    aiMessage: { id: uuidv4(), role: 'assistant', content: responses[Math.floor(Math.random() * responses.length)], createdAt: new Date().toISOString() }
  });
});

// Messages (in-memory for demo, would use database in production)
const messagesStore = new Map();

// Get messages for organization
app.get('/messages', optionalAuthMiddleware, (req, res) => {
  const orgId = req.user.organizationId;
  const type = req.query.type || 'all'; // 'internal', 'external', or 'all'

  const orgMessages = messagesStore.get(orgId) || [];
  const filtered = type === 'all'
    ? orgMessages
    : orgMessages.filter(m => m.type === type);

  res.json(filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

// Send internal team message
app.post('/messages/internal', optionalAuthMiddleware, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const orgId = req.user.organizationId;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'To, subject, and body are required' });
    }

    const message = {
      id: uuidv4(),
      type: 'internal',
      from: req.user.email,
      to,
      subject,
      body,
      read: false,
      createdAt: new Date().toISOString()
    };

    const orgMessages = messagesStore.get(orgId) || [];
    orgMessages.push(message);
    messagesStore.set(orgId, orgMessages);

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error('Send internal message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Send external email via SendGrid
app.post('/messages/external', optionalAuthMiddleware, async (req, res) => {
  try {
    const { to, subject, body } = req.body;
    const orgId = req.user.organizationId;

    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'To, subject, and body are required' });
    }

    let emailStatus = 'pending';
    let sendGridResponse = null;

    // Actually send email via SendGrid if configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        const msg = {
          to: to,
          from: SENDGRID_FROM_EMAIL,
          replyTo: req.user.email,
          subject: subject,
          text: body,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(to right, #7c3aed, #2563eb); padding: 20px; border-radius: 8px 8px 0 0;">
                <h2 style="color: white; margin: 0;">Message from Outbound Impact</h2>
              </div>
              <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none;">
                <p style="color: #475569; white-space: pre-wrap;">${body}</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 12px;">
                  Sent via <a href="https://outboundimpact.com" style="color: #7c3aed;">Outbound Impact</a><br/>
                  Reply to: ${req.user.email}
                </p>
              </div>
            </div>
          `
        };

        sendGridResponse = await sgMail.send(msg);
        emailStatus = 'sent';
        console.log('Email sent successfully to:', to);
      } catch (sgError) {
        console.error('SendGrid error:', sgError.response?.body || sgError.message);
        emailStatus = 'failed';
      }
    } else {
      // Demo mode - no SendGrid configured
      emailStatus = 'demo';
      console.log('Demo mode: Would send email to:', to);
    }

    const message = {
      id: uuidv4(),
      type: 'external',
      from: req.user.email,
      to,
      subject,
      body,
      status: emailStatus,
      createdAt: new Date().toISOString()
    };

    const orgMessages = messagesStore.get(orgId) || [];
    orgMessages.push(message);
    messagesStore.set(orgId, orgMessages);

    if (emailStatus === 'failed') {
      res.status(500).json({
        success: false,
        message,
        error: 'Failed to send email. Please check SendGrid configuration.'
      });
    } else {
      res.status(201).json({
        success: true,
        message,
        mode: emailStatus === 'demo' ? 'demo' : 'live'
      });
    }
  } catch (error) {
    console.error('Send external email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Mark message as read
app.patch('/messages/:messageId/read', optionalAuthMiddleware, (req, res) => {
  const orgId = req.user.organizationId;
  const { messageId } = req.params;

  const orgMessages = messagesStore.get(orgId) || [];
  const message = orgMessages.find(m => m.id === messageId);

  if (!message) {
    return res.status(404).json({ error: 'Message not found' });
  }

  message.read = true;
  res.json({ success: true, message });
});

// ============================================
// SENDGRID INBOUND PARSE WEBHOOK
// Receives email replies and stores them in messages
// ============================================

// Store for tracking outbound emails to match replies
const outboundEmailsStore = new Map(); // key: messageId, value: { to, subject, orgId }

// SendGrid Inbound Parse webhook endpoint
// Configure in SendGrid: Settings > Inbound Parse > Add Host & URL
// URL: https://outbound-impact-backend-eight.vercel.app/webhooks/inbound-email
app.post('/webhooks/inbound-email', upload.none(), (req, res) => {
  try {
    console.log('Inbound email received:', JSON.stringify(req.body, null, 2));

    // SendGrid sends these fields:
    // - from: sender email
    // - to: recipient email (your inbound address)
    // - subject: email subject
    // - text: plain text body
    // - html: HTML body
    // - envelope: JSON string with from/to
    // - headers: email headers

    const {
      from,
      to,
      subject,
      text,
      html
    } = req.body;

    // Extract email address from "Name <email@example.com>" format
    const extractEmail = (emailStr) => {
      if (!emailStr) return '';
      const match = emailStr.match(/<([^>]+)>/);
      return match ? match[1].toLowerCase() : emailStr.toLowerCase().trim();
    };

    const senderEmail = extractEmail(from);
    const recipientEmail = extractEmail(to);

    console.log('Parsed inbound email:', { senderEmail, recipientEmail, subject });

    // Find which organization this reply belongs to
    // Look through all sent messages to find a match
    let matchedOrgId = 'demo-org'; // Default to demo org
    let isReply = false;
    let originalSubject = subject;

    // Check if this is a reply (subject starts with Re:)
    if (subject && subject.toLowerCase().startsWith('re:')) {
      isReply = true;
      originalSubject = subject.replace(/^re:\s*/i, '');
    }

    // Try to find the original message this is replying to
    for (const [orgId, messages] of messagesStore.entries()) {
      const originalMessage = messages.find(m =>
        m.type === 'external' &&
        m.to.toLowerCase() === senderEmail &&
        (m.subject === originalSubject || m.subject === subject)
      );
      if (originalMessage) {
        matchedOrgId = orgId;
        console.log('Matched reply to org:', orgId, 'original message:', originalMessage.id);
        break;
      }
    }

    // Create the inbound message
    const inboundMessage = {
      id: uuidv4(),
      type: 'external',
      direction: 'inbound', // Mark as incoming reply
      from: senderEmail,
      to: recipientEmail,
      subject: subject || '(No subject)',
      body: text || html?.replace(/<[^>]*>/g, '') || '(No content)',
      preview: (text || '').substring(0, 100),
      read: false,
      unread: true,
      time: 'Just now',
      status: 'Received',
      createdAt: new Date().toISOString()
    };

    // Add to the matched organization's messages
    const orgMessages = messagesStore.get(matchedOrgId) || [];
    orgMessages.push(inboundMessage);
    messagesStore.set(matchedOrgId, orgMessages);

    console.log('Stored inbound message:', inboundMessage.id, 'for org:', matchedOrgId);

    // SendGrid expects a 200 response
    res.status(200).json({ success: true, messageId: inboundMessage.id });

  } catch (error) {
    console.error('Inbound email webhook error:', error);
    // Still return 200 to prevent SendGrid from retrying
    res.status(200).json({ success: false, error: error.message });
  }
});

// Health check for inbound webhook
app.get('/webhooks/inbound-email', (req, res) => {
  res.json({
    status: 'ok',
    message: 'SendGrid Inbound Parse webhook is ready',
    instructions: 'Configure in SendGrid Dashboard: Settings > Inbound Parse'
  });
});

// ============================================
// UPLOAD ENDPOINTS
// Save uploads to PostgreSQL database
// ============================================

// Configure multer for file uploads (memory storage for base64 encoding)
const fileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Generate unique slug
const generateSlug = (title) => {
  const base = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 30);
  return `${base}-${Date.now().toString(36)}`;
};

// Upload file endpoint - uploads to Bunny.net CDN, stores URL in database
app.post('/upload/file', optionalAuthMiddleware, fileUpload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { title, description } = req.body;
    const orgId = req.user.organizationId;
    const userId = req.user.userId === 'demo' ? null : req.user.userId;

    // Determine type category
    let typeCategory = 'file';
    if (file.mimetype.startsWith('image/')) typeCategory = 'image';
    else if (file.mimetype.startsWith('video/')) typeCategory = 'video';
    else if (file.mimetype.startsWith('audio/')) typeCategory = 'audio';
    else if (file.mimetype.includes('pdf')) typeCategory = 'pdf';

    // Generate slug
    const slug = generateSlug(title || file.originalname);

    // Generate unique file path for Bunny storage
    const fileExt = file.originalname.split('.').pop();
    const storagePath = `uploads/${orgId}/${Date.now()}-${uuidv4().slice(0, 8)}.${fileExt}`;

    let storageUrl = null;
    let thumbnailUrl = null;
    let fileData = null;
    let thumbnailData = null;

    if (bunnyEnabled()) {
      // Upload to Bunny.net CDN
      storageUrl = await uploadToBunny(storagePath, file.buffer);

      // Upload thumbnail for images
      if (typeCategory === 'image' && file.size <= 5 * 1024 * 1024) {
        const thumbPath = `uploads/${orgId}/thumbs/${Date.now()}-${uuidv4().slice(0, 8)}.${fileExt}`;
        thumbnailUrl = await uploadToBunny(thumbPath, file.buffer);
      }
    } else {
      // Fallback: store in database as BYTEA (for local dev without Bunny)
      fileData = file.buffer;
      thumbnailData = (typeCategory === 'image' && file.size <= 5 * 1024 * 1024) ? file.buffer : null;
    }

    // Insert into database - store URLs (Bunny) or binary data (fallback)
    const result = await pool.query(
      `INSERT INTO uploaded_files
       (organization_id, user_id, title, description, file_name, file_size_bytes, mime_type, slug, type_category, storage_url, thumbnail_url, file_data, thumbnail_data)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING id, title, description, slug, type_category as type, created_at`,
      [orgId === 'demo-org' ? 1 : orgId, userId, title || file.originalname, description || '', file.originalname, file.size, file.mimetype, slug, typeCategory, storageUrl, thumbnailUrl, fileData, thumbnailData]
    );

    // Create QR code entry
    await pool.query(
      `INSERT INTO qr_codes (organization_id, uploaded_file_id, slug, status)
       VALUES ($1, $2, $3, 'active')`,
      [orgId === 'demo-org' ? 1 : orgId, result.rows[0].id, slug]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (organization_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, 'upload', 'file', $3, $4)`,
      [orgId === 'demo-org' ? 1 : orgId, userId, result.rows[0].id, JSON.stringify({ fileName: file.originalname, fileSize: file.size })]
    );

    const item = result.rows[0];
    const baseUrl = process.env.API_BASE_URL || 'https://outbound-impact-backend-eight.vercel.app';

    res.json({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      type: item.type,
      fileName: file.originalname,
      fileSize: file.size,
      fileType: file.mimetype,
      fileUrl: storageUrl || `${baseUrl}/files/${item.id}`,
      thumbnail: thumbnailUrl || (thumbnailData ? `${baseUrl}/files/${item.id}/thumbnail` : null),
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://outboundimpact.net/view/${item.slug}`)}`,
      viewUrl: `https://outboundimpact.net/view/${item.slug}`,
      createdAt: item.created_at,
      isDemo: false
    });

  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Serve file by ID - redirects to Bunny CDN or falls back to BYTEA
app.get('/files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT storage_url, file_data, mime_type, file_name FROM uploaded_files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const { storage_url, file_data, mime_type, file_name } = result.rows[0];

    // If file is on Bunny CDN, redirect to it
    if (storage_url) {
      return res.redirect(301, storage_url);
    }

    // Fallback: serve from database BYTEA
    if (!file_data) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.set({
      'Content-Type': mime_type,
      'Content-Length': file_data.length,
      'Content-Disposition': `inline; filename="${file_name}"`,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(file_data);
  } catch (error) {
    console.error('File serve error:', error);
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// Serve thumbnail by ID - redirects to Bunny CDN or falls back to BYTEA
app.get('/files/:id/thumbnail', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT thumbnail_url, thumbnail_data, mime_type FROM uploaded_files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    const { thumbnail_url, thumbnail_data, mime_type } = result.rows[0];

    // If thumbnail is on Bunny CDN, redirect to it
    if (thumbnail_url) {
      return res.redirect(301, thumbnail_url);
    }

    // Fallback: serve from database BYTEA
    if (!thumbnail_data) {
      return res.status(404).json({ error: 'Thumbnail not found' });
    }

    res.set({
      'Content-Type': mime_type,
      'Content-Length': thumbnail_data.length,
      'Cache-Control': 'public, max-age=31536000'
    });

    res.send(thumbnail_data);
  } catch (error) {
    console.error('Thumbnail serve error:', error);
    res.status(500).json({ error: 'Failed to serve thumbnail' });
  }
});

// Upload text post endpoint
app.post('/upload/text', optionalAuthMiddleware, async (req, res) => {
  try {
    const { title, content, description } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const orgId = req.user.organizationId;
    const userId = req.user.userId === 'demo' ? null : req.user.userId;
    const slug = generateSlug(title);

    // Insert into database
    const result = await pool.query(
      `INSERT INTO uploaded_files
       (organization_id, user_id, title, description, slug, type_category, content_text)
       VALUES ($1, $2, $3, $4, $5, 'text', $6)
       RETURNING id, title, description, slug, type_category as type, created_at`,
      [orgId === 'demo-org' ? 1 : orgId, userId, title, description || '', slug, content]
    );

    // Create QR code entry
    await pool.query(
      `INSERT INTO qr_codes (organization_id, uploaded_file_id, slug, status)
       VALUES ($1, $2, $3, 'active')`,
      [orgId === 'demo-org' ? 1 : orgId, result.rows[0].id, slug]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (organization_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, 'upload', 'text', $3, $4)`,
      [orgId === 'demo-org' ? 1 : orgId, userId, result.rows[0].id, JSON.stringify({ title })]
    );

    const item = result.rows[0];
    res.json({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      type: 'text',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://outboundimpact.net/view/${item.slug}`)}`,
      viewUrl: `https://outboundimpact.net/view/${item.slug}`,
      createdAt: item.created_at,
      isDemo: false
    });

  } catch (error) {
    console.error('Text upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Upload embed link endpoint
app.post('/upload/embed', optionalAuthMiddleware, async (req, res) => {
  try {
    const { title, url, description } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL required' });
    }

    const orgId = req.user.organizationId;
    const userId = req.user.userId === 'demo' ? null : req.user.userId;
    const slug = generateSlug(title || 'embed');

    // Insert into database
    const result = await pool.query(
      `INSERT INTO uploaded_files
       (organization_id, user_id, title, description, slug, type_category, embed_url)
       VALUES ($1, $2, $3, $4, $5, 'embed', $6)
       RETURNING id, title, description, slug, type_category as type, created_at`,
      [orgId === 'demo-org' ? 1 : orgId, userId, title || 'Embedded Content', description || '', slug, url]
    );

    // Create QR code entry
    await pool.query(
      `INSERT INTO qr_codes (organization_id, uploaded_file_id, slug, status)
       VALUES ($1, $2, $3, 'active')`,
      [orgId === 'demo-org' ? 1 : orgId, result.rows[0].id, slug]
    );

    // Log activity
    await pool.query(
      `INSERT INTO activity_log (organization_id, user_id, action, entity_type, entity_id, metadata)
       VALUES ($1, $2, 'upload', 'embed', $3, $4)`,
      [orgId === 'demo-org' ? 1 : orgId, userId, result.rows[0].id, JSON.stringify({ title, url })]
    );

    const item = result.rows[0];
    res.json({
      id: item.id,
      slug: item.slug,
      title: item.title,
      description: item.description,
      type: 'embed',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://outboundimpact.net/view/${item.slug}`)}`,
      viewUrl: `https://outboundimpact.net/view/${item.slug}`,
      createdAt: item.created_at,
      isDemo: false
    });

  } catch (error) {
    console.error('Embed upload error:', error);
    res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

// Get activity feed from database
app.get('/activity', optionalAuthMiddleware, async (req, res) => {
  try {
    const orgId = req.user.organizationId;
    const baseUrl = process.env.API_BASE_URL || 'https://outbound-impact-backend-eight.vercel.app';

    const result = await pool.query(
      `SELECT uf.id, uf.title as name, uf.type_category as type, uf.file_size_bytes as size,
              uf.storage_url, uf.thumbnail_url,
              (uf.thumbnail_data IS NOT NULL) as has_thumbnail,
              (uf.file_data IS NOT NULL) as has_file,
              uf.slug, uf.created_at as uploaded,
              COALESCE(q.total_scans, 0) as views
       FROM uploaded_files uf
       LEFT JOIN qr_codes q ON q.uploaded_file_id = uf.id
       WHERE uf.organization_id = $1
       ORDER BY uf.created_at DESC
       LIMIT 50`,
      [orgId === 'demo-org' ? 1 : orgId]
    );

    const activities = result.rows.map(item => ({
      id: item.id,
      name: item.name,
      type: item.type?.charAt(0).toUpperCase() + item.type?.slice(1) || 'File',
      size: item.size ? `${(item.size / 1024 / 1024).toFixed(1)} MB` : 'N/A',
      views: item.views,
      uploaded: new Date(item.uploaded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: getRelativeTime(new Date(item.uploaded)),
      thumbnail: item.thumbnail_url || (item.has_thumbnail ? `${baseUrl}/files/${item.id}/thumbnail` : null),
      fileUrl: item.storage_url || (item.has_file ? `${baseUrl}/files/${item.id}` : null),
      viewUrl: `https://outboundimpact.net/view/${item.slug}`,
      campaign: null
    }));

    res.json(activities);
  } catch (error) {
    console.error('Activity fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch activity' });
  }
});

// Helper function for relative time
function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ============================================
// OI ADMIN ENDPOINTS
// Internal routes for Outbound Impact administrators
// Accesses ALL customer data across organizations
// ============================================

const OI_ADMIN_SECRET = process.env.OI_ADMIN_SECRET || JWT_SECRET;

// Admin auth middleware - verifies admin JWT and checks oi_admin_users table
const adminAuthMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Admin access token required' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, OI_ADMIN_SECRET);

    const result = await pool.query(
      'SELECT id, email, full_name, role FROM oi_admin_users WHERE id = $1 AND status = $2',
      [decoded.adminId, 'active']
    );

    if (result.rows.length === 0) {
      return res.status(403).json({ error: 'Admin access denied' });
    }

    req.admin = result.rows[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Admin token expired' });
    }
    return res.status(403).json({ error: 'Invalid admin token' });
  }
};

// Admin login
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await pool.query(
      'SELECT * FROM oi_admin_users WHERE email = $1 AND status = $2',
      [email.toLowerCase(), 'active']
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await pool.query('UPDATE oi_admin_users SET last_login_at = NOW() WHERE id = $1', [admin.id]);

    const token = jwt.sign(
      { adminId: admin.id, email: admin.email, role: admin.role, isAdmin: true },
      OI_ADMIN_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      token,
      admin: { id: admin.id, email: admin.email, fullName: admin.full_name, role: admin.role }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Admin overview stats
app.get('/admin/overview', adminAuthMiddleware, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT
        COUNT(DISTINCT o.id) as total_customers,
        COUNT(DISTINCT CASE WHEN o.status = 'active' THEN o.id END) as active_customers,
        COUNT(DISTINCT CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN o.id END) as new_customers_this_month,
        SUM(CASE WHEN o.status = 'active' THEN o.monthly_price ELSE 0 END) as total_mrr,
        SUM(o.total_qr_scans) as total_qr_scans,
        SUM(o.total_uploads) as total_uploads,
        AVG(CASE WHEN o.status = 'active' THEN o.monthly_price END) as avg_mrr_per_customer
      FROM organizations o
    `);

    const churnQuery = await pool.query(`
      SELECT
        COUNT(DISTINCT CASE WHEN status = 'cancelled' AND updated_at >= NOW() - INTERVAL '30 days' THEN id END)::numeric /
        NULLIF(COUNT(DISTINCT CASE WHEN updated_at >= NOW() - INTERVAL '60 days' THEN id END), 0) * 100 as churn_rate
      FROM organizations
    `);

    res.json({
      ...stats.rows[0],
      churn_rate: parseFloat(churnQuery.rows[0].churn_rate || 0).toFixed(2)
    });
  } catch (error) {
    console.error('Admin overview error:', error);
    res.status(500).json({ error: 'Failed to fetch overview' });
  }
});

// Admin plan breakdown
app.get('/admin/plan-breakdown', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT plan_type, COUNT(*) as customer_count,
        SUM(CASE WHEN status = 'active' THEN monthly_price ELSE 0 END) as total_mrr,
        AVG(total_qr_scans) as avg_scans, SUM(total_qr_scans) as total_scans,
        AVG(total_uploads) as avg_uploads
      FROM organizations GROUP BY plan_type ORDER BY total_mrr DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Plan breakdown error:', error);
    res.status(500).json({ error: 'Failed to fetch plan breakdown' });
  }
});

// Admin customers list
app.get('/admin/customers', adminAuthMiddleware, async (req, res) => {
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

    queryParams.push(parseInt(limit), parseInt(offset));

    const result = await pool.query(`
      SELECT o.id, o.company_name, o.company_email, o.plan_type, o.status,
        o.monthly_price, o.created_at, o.total_qr_scans, o.total_uploads,
        COUNT(DISTINCT u.id) as total_users, o.max_contributors as user_limit,
        COUNT(DISTINCT q.id) as total_qr_codes, o.max_qr_codes as qr_limit,
        COALESCE(SUM(uf.file_size_bytes) / 1073741824.0, 0) as storage_used_gb,
        o.storage_limit_gb, COUNT(DISTINCT c.id) as total_campaigns,
        MAX(al.created_at) as last_activity_at
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
      LEFT JOIN uploaded_files uf ON uf.organization_id = o.id
      LEFT JOIN campaigns c ON c.organization_id = o.id
      LEFT JOIN activity_log al ON al.organization_id = o.id
      WHERE ${whereConditions.join(' AND ')}
      GROUP BY o.id ORDER BY o.created_at DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `, queryParams);

    const countResult = await pool.query(`
      SELECT COUNT(DISTINCT o.id) as total FROM organizations o
      WHERE ${whereConditions.join(' AND ')}
    `, queryParams.slice(0, -2));

    res.json({
      customers: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Admin customers error:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Admin customer detail
app.get('/admin/customers/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const customerQuery = await pool.query(`
      SELECT o.*, COUNT(DISTINCT u.id) as total_users,
        COUNT(DISTINCT q.id) as total_qr_codes,
        COUNT(DISTINCT c.id) as total_campaigns,
        COALESCE(SUM(uf.file_size_bytes), 0) as storage_used_bytes
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id
      LEFT JOIN campaigns c ON c.organization_id = o.id
      LEFT JOIN uploaded_files uf ON uf.organization_id = o.id
      WHERE o.id = $1 GROUP BY o.id
    `, [id]);

    if (customerQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const activityQuery = await pool.query(`
      SELECT al.action, al.entity_type, al.created_at, u.full_name as user_name
      FROM activity_log al LEFT JOIN users u ON al.user_id = u.id
      WHERE al.organization_id = $1 ORDER BY al.created_at DESC LIMIT 20
    `, [id]);

    res.json({ customer: customerQuery.rows[0], recent_activity: activityQuery.rows });
  } catch (error) {
    console.error('Customer detail error:', error);
    res.status(500).json({ error: 'Failed to fetch customer details' });
  }
});

// Admin upgrade opportunities
app.get('/admin/opportunities/upgrades', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.company_name, o.company_email, o.plan_type, o.monthly_price,
        o.created_at as customer_since,
        COUNT(DISTINCT u.id) as current_users, o.max_contributors as user_limit,
        COUNT(DISTINCT q.id) as current_qr_codes, o.max_qr_codes as qr_limit,
        o.total_qr_scans, COUNT(DISTINCT al.id) as activities_last_30_days
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
      LEFT JOIN activity_log al ON al.organization_id = o.id AND al.created_at >= NOW() - INTERVAL '30 days'
      WHERE o.status = 'active' AND o.plan_type IN ('personal', 'small_business', 'medium_business')
      GROUP BY o.id
      HAVING (COUNT(DISTINCT u.id)::numeric / NULLIF(o.max_contributors, 0)) >= 0.6
        OR (COUNT(DISTINCT q.id)::numeric / NULLIF(o.max_qr_codes, 0)) >= 0.6
        OR COUNT(DISTINCT al.id) > 50
      ORDER BY o.total_qr_scans DESC LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Upgrade opportunities error:', error);
    res.status(500).json({ error: 'Failed to fetch upgrade opportunities' });
  }
});

// Admin churn risk
app.get('/admin/opportunities/churn-risk', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.company_name, o.company_email, o.plan_type, o.monthly_price,
        o.created_at as customer_since,
        MAX(al.created_at) as last_activity,
        EXTRACT(DAY FROM NOW() - MAX(al.created_at))::int as days_inactive,
        o.total_qr_scans,
        CASE
          WHEN MAX(al.created_at) < NOW() - INTERVAL '30 days' THEN 'HIGH'
          WHEN MAX(al.created_at) < NOW() - INTERVAL '14 days' THEN 'MEDIUM'
          ELSE 'LOW'
        END as churn_risk
      FROM organizations o
      LEFT JOIN activity_log al ON al.organization_id = o.id
      WHERE o.status = 'active'
      GROUP BY o.id
      HAVING MAX(al.created_at) < NOW() - INTERVAL '7 days' OR MAX(al.created_at) IS NULL
      ORDER BY MAX(al.created_at) ASC NULLS FIRST LIMIT 50
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Churn risk error:', error);
    res.status(500).json({ error: 'Failed to fetch churn risk data' });
  }
});

// Admin top performers
app.get('/admin/opportunities/top-performers', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.company_name, o.company_email, o.plan_type,
        o.created_at as customer_since,
        COUNT(DISTINCT u.id) as team_size,
        COUNT(DISTINCT q.id) as qr_codes,
        o.total_qr_scans,
        COUNT(DISTINCT c.id) as campaigns,
        COUNT(DISTINCT qse.country) as countries_reached
      FROM organizations o
      LEFT JOIN users u ON u.organization_id = o.id AND u.status = 'active'
      LEFT JOIN qr_codes q ON q.organization_id = o.id AND q.status = 'active'
      LEFT JOIN campaigns c ON c.organization_id = o.id
      LEFT JOIN qr_scan_events qse ON qse.organization_id = o.id
      WHERE o.status = 'active'
      GROUP BY o.id
      HAVING o.total_qr_scans > 100
      ORDER BY o.total_qr_scans DESC LIMIT 20
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Top performers error:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
});

// Admin geographic analytics
app.get('/admin/geography/top-locations', adminAuthMiddleware, async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const result = await pool.query(`
      SELECT country, country_code, city, state,
        COUNT(*) as scan_count,
        COUNT(DISTINCT qr_code_id) as unique_qr_codes,
        COUNT(DISTINCT organization_id) as unique_customers,
        AVG(latitude) as avg_latitude, AVG(longitude) as avg_longitude,
        SUM(CASE WHEN device_type = 'mobile' THEN 1 ELSE 0 END) as mobile_scans,
        SUM(CASE WHEN device_type = 'desktop' THEN 1 ELSE 0 END) as desktop_scans
      FROM qr_scan_events
      WHERE scanned_at >= NOW() - INTERVAL '30 days' AND country IS NOT NULL
      GROUP BY country, country_code, city, state
      ORDER BY scan_count DESC LIMIT $1
    `, [parseInt(limit)]);
    res.json(result.rows);
  } catch (error) {
    console.error('Top locations error:', error);
    res.status(500).json({ error: 'Failed to fetch location data' });
  }
});

// Admin device stats
app.get('/admin/geography/device-stats', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT device_type, os, browser, COUNT(*) as scan_count
      FROM qr_scan_events
      WHERE scanned_at >= NOW() - INTERVAL '30 days'
      GROUP BY device_type, os, browser ORDER BY scan_count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Device stats error:', error);
    res.status(500).json({ error: 'Failed to fetch device stats' });
  }
});

// Admin revenue MRR
app.get('/admin/revenue/mrr', adminAuthMiddleware, async (req, res) => {
  try {
    const byPlan = await pool.query(`
      SELECT plan_type, COUNT(*) as customer_count,
        SUM(monthly_price) as total_mrr, AVG(monthly_price) as avg_price
      FROM organizations WHERE status = 'active'
      GROUP BY plan_type ORDER BY total_mrr DESC
    `);
    const totals = await pool.query(`
      SELECT SUM(monthly_price) as total_mrr, COUNT(*) as total_active_customers,
        SUM(monthly_price) * 12 as annual_run_rate
      FROM organizations WHERE status = 'active'
    `);
    res.json({ by_plan: byPlan.rows, totals: totals.rows[0] });
  } catch (error) {
    console.error('MRR error:', error);
    res.status(500).json({ error: 'Failed to fetch MRR data' });
  }
});

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

// Update customer plan
app.patch('/admin/customers/:id/plan', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { plan_type } = req.body;

    const planLimits = {
      personal: { max_qr_codes: 3, max_contributors: 1, storage_limit_gb: 5, monthly_price: 0 },
      small_business: { max_qr_codes: 5, max_contributors: 3, storage_limit_gb: 250, monthly_price: 0 },
      medium_business: { max_qr_codes: 999999, max_contributors: 999999, storage_limit_gb: 500, monthly_price: 29 },
      enterprise: { max_qr_codes: 999999, max_contributors: 999999, storage_limit_gb: 1000, monthly_price: 99 }
    };

    if (!planLimits[plan_type]) {
      return res.status(400).json({ error: 'Invalid plan type. Must be: personal, small_business, medium_business, enterprise' });
    }

    const limits = planLimits[plan_type];

    const result = await pool.query(`
      UPDATE organizations SET plan_type = $1, max_qr_codes = $2, max_contributors = $3,
        storage_limit_gb = $4, monthly_price = $5, updated_at = NOW()
      WHERE id = $6
      RETURNING id, company_name, plan_type, monthly_price
    `, [plan_type, limits.max_qr_codes, limits.max_contributors, limits.storage_limit_gb, limits.monthly_price, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ success: true, customer: result.rows[0] });
  } catch (error) {
    console.error('Update plan error:', error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Update customer status (activate, suspend, cancel)
app.patch('/admin/customers/:id/status', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['active', 'suspended', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be: ${validStatuses.join(', ')}` });
    }

    const result = await pool.query(
      'UPDATE organizations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, company_name, status',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ success: true, customer: result.rows[0] });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ============================================
// DISCOUNT CODES
// ============================================

// List discount codes
app.get('/admin/discount-codes', adminAuthMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dc.*, COUNT(dcu.id) as times_used,
        COALESCE(SUM(dcu.discount_amount), 0) as total_discounted
      FROM discount_codes dc
      LEFT JOIN discount_code_usage dcu ON dcu.discount_code_id = dc.id
      GROUP BY dc.id ORDER BY dc.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('List discount codes error:', error);
    res.status(500).json({ error: 'Failed to fetch discount codes' });
  }
});

// Create discount code
app.post('/admin/discount-codes', adminAuthMiddleware, async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, applicable_plans, max_uses, reseller_email, reseller_commission, expires_at } = req.body;

    if (!code || !discount_value) {
      return res.status(400).json({ error: 'Code and discount_value are required' });
    }

    const result = await pool.query(`
      INSERT INTO discount_codes (code, description, discount_type, discount_value, applicable_plans, max_uses, reseller_email, reseller_commission, expires_at, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      code.toUpperCase(),
      description || '',
      discount_type || 'percentage',
      discount_value,
      applicable_plans || '{}',
      max_uses || null,
      reseller_email || null,
      reseller_commission || 0,
      expires_at || null,
      req.admin.email
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Discount code already exists' });
    }
    console.error('Create discount code error:', error);
    res.status(500).json({ error: 'Failed to create discount code' });
  }
});

// Update discount code
app.patch('/admin/discount-codes/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { description, discount_type, discount_value, applicable_plans, max_uses, status, expires_at } = req.body;

    const result = await pool.query(`
      UPDATE discount_codes SET
        description = COALESCE($1, description),
        discount_type = COALESCE($2, discount_type),
        discount_value = COALESCE($3, discount_value),
        applicable_plans = COALESCE($4, applicable_plans),
        max_uses = COALESCE($5, max_uses),
        status = COALESCE($6, status),
        expires_at = COALESCE($7, expires_at),
        updated_at = NOW()
      WHERE id = $8 RETURNING *
    `, [description, discount_type, discount_value, applicable_plans, max_uses, status, expires_at, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount code not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update discount code error:', error);
    res.status(500).json({ error: 'Failed to update discount code' });
  }
});

// Delete discount code
app.delete('/admin/discount-codes/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM discount_codes WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Discount code not found' });
    }

    res.json({ success: true, deleted: id });
  } catch (error) {
    console.error('Delete discount code error:', error);
    res.status(500).json({ error: 'Failed to delete discount code' });
  }
});

// ============================================
// RETENTION ACTIONS
// ============================================

// Send retention email to at-risk customer
app.post('/admin/retention/send-email', adminAuthMiddleware, async (req, res) => {
  try {
    const { customer_id, subject, body, offer_discount_code } = req.body;

    // Get customer info
    const customer = await pool.query(
      'SELECT company_name, company_email FROM organizations WHERE id = $1',
      [customer_id]
    );

    if (customer.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const { company_email, company_name } = customer.rows[0];

    // Send via SendGrid if configured
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: company_email,
        from: SENDGRID_FROM_EMAIL,
        subject: subject || `We miss you, ${company_name}!`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #7c3aed, #2563eb); padding: 20px; border-radius: 8px 8px 0 0;">
              <h2 style="color: white; margin: 0;">Outbound Impact</h2>
            </div>
            <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-top: none;">
              <p style="color: #475569; white-space: pre-wrap;">${body}</p>
              ${offer_discount_code ? `<p style="background: #f0fdf4; padding: 12px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; color: #16a34a;">Use code: ${offer_discount_code}</p>` : ''}
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
              <p style="color: #94a3b8; font-size: 12px;">
                Sent by the Outbound Impact team
              </p>
            </div>
          </div>
        `
      };
      await sgMail.send(msg);
    }

    // Log the retention action
    await pool.query(
      `INSERT INTO activity_log (organization_id, action, entity_type, metadata)
       VALUES ($1, 'retention_email', 'organization', $2)`,
      [customer_id, JSON.stringify({ subject, sent_by: req.admin.email, offer_discount_code })]
    );

    res.json({
      success: true,
      sent_to: company_email,
      mode: process.env.SENDGRID_API_KEY ? 'live' : 'demo'
    });
  } catch (error) {
    console.error('Retention email error:', error);
    res.status(500).json({ error: 'Failed to send retention email' });
  }
});

// Schedule callback for at-risk customer
app.post('/admin/retention/schedule-call', adminAuthMiddleware, async (req, res) => {
  try {
    const { customer_id, scheduled_date, notes } = req.body;

    // Log the scheduled call
    await pool.query(
      `INSERT INTO activity_log (organization_id, action, entity_type, metadata)
       VALUES ($1, 'retention_call_scheduled', 'organization', $2)`,
      [customer_id, JSON.stringify({ scheduled_date, notes, scheduled_by: req.admin.email })]
    );

    res.json({ success: true, customer_id, scheduled_date });
  } catch (error) {
    console.error('Schedule call error:', error);
    res.status(500).json({ error: 'Failed to schedule call' });
  }
});

// ============================================
// ADMIN MIGRATION - Run once to add admin tables
// ============================================
app.get('/run-admin-migration', async (req, res) => {
  try {
    // Create oi_admin_users table
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

    // Create admin_access_log table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admin_access_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        admin_user_id UUID REFERENCES oi_admin_users(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        endpoint VARCHAR(500),
        method VARCHAR(10),
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create discount_codes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discount_codes (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        description TEXT,
        discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage',
        discount_value DECIMAL(10,2) NOT NULL,
        applicable_plans TEXT[] DEFAULT '{}',
        max_uses INTEGER,
        current_uses INTEGER DEFAULT 0,
        reseller_email VARCHAR(255),
        reseller_commission DECIMAL(5,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        starts_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP,
        created_by VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create discount_code_usage table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discount_code_usage (
        id SERIAL PRIMARY KEY,
        discount_code_id INTEGER REFERENCES discount_codes(id) ON DELETE CASCADE,
        organization_id INTEGER REFERENCES organizations(id) ON DELETE CASCADE,
        applied_at TIMESTAMP DEFAULT NOW(),
        plan_type VARCHAR(50),
        discount_amount DECIMAL(10,2)
      );
    `);

    res.json({ success: true, message: 'Admin migration completed - oi_admin_users, admin_access_log, discount_codes, discount_code_usage tables created' });
  } catch (error) {
    console.error('Admin migration error:', error);
    res.status(500).json({ error: 'Admin migration failed', details: error.message });
  }
});

// ============================================
// ADMIN - Create first admin user (run once, then remove or protect)
// ============================================
app.post('/admin/setup', async (req, res) => {
  try {
    // Check if any admin exists
    const existing = await pool.query('SELECT COUNT(*) as count FROM oi_admin_users');
    if (parseInt(existing.rows[0].count) > 0) {
      return res.status(403).json({ error: 'Admin already exists. Use /admin/login instead.' });
    }

    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'email, password, and full_name are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO oi_admin_users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'super_admin') RETURNING id, email, full_name, role`,
      [email.toLowerCase(), passwordHash, full_name]
    );

    res.status(201).json({ success: true, admin: result.rows[0], message: 'Super admin created. Use /admin/login to sign in.' });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ error: 'Failed to create admin' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

module.exports = app;

-- Add BYTEA columns for efficient binary file storage
-- Run this migration to switch from base64 TEXT to raw binary BYTEA

-- Add file_data column for storing raw binary data
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS file_data BYTEA;

-- Add thumbnail_data column for storing thumbnail binary data
ALTER TABLE uploaded_files ADD COLUMN IF NOT EXISTS thumbnail_data BYTEA;

-- Note: After migration, the storage_url and thumbnail_url columns can still be used
-- for external URLs (S3, Cloudinary, etc.) while file_data/thumbnail_data store local files

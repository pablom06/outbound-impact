// S3-Compatible Storage Configuration
// Connects to Railway Buckets (S3-compatible)

const AWS = require('aws-sdk');

// Configure S3 client for Railway Buckets
const s3 = new AWS.S3({
  endpoint: process.env.BUCKET_ENDPOINT,
  region: process.env.BUCKET_REGION || 'auto',
  accessKeyId: process.env.BUCKET_ACCESS_KEY_ID,
  secretAccessKey: process.env.BUCKET_SECRET_ACCESS_KEY,
  s3ForcePathStyle: true, // Required for S3-compatible services
  signatureVersion: 'v4'
});

const BUCKET_NAME = process.env.BUCKET_NAME;

// Upload file to bucket
async function uploadFile(fileBuffer, key, contentType) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
    ACL: 'public-read'
  };

  const result = await s3.upload(params).promise();
  return {
    url: result.Location || `${process.env.BUCKET_ENDPOINT}/${BUCKET_NAME}/${key}`,
    key: result.Key
  };
}

// Delete file from bucket
async function deleteFile(key) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key
  };

  await s3.deleteObject(params).promise();
  return true;
}

// Get signed URL for private file
async function getSignedUrl(key, expiresIn = 3600) {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    Expires: expiresIn
  };

  return s3.getSignedUrlPromise('getObject', params);
}

// List files in bucket
async function listFiles(prefix = '') {
  const params = {
    Bucket: BUCKET_NAME,
    Prefix: prefix
  };

  const result = await s3.listObjectsV2(params).promise();
  return result.Contents || [];
}

module.exports = {
  s3,
  BUCKET_NAME,
  uploadFile,
  deleteFile,
  getSignedUrl,
  listFiles
};

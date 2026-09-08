const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

/**
 * Upload general files (e.g. CIGI result images and PDFs) to Cloudinary
 */
const uploadToCloudinary = (fileBuffer, folder = 'cigi_results') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    Readable.from(fileBuffer).pipe(stream);
  });
};

/**
 * Upload private files (e.g. Worksheets) that shouldn't be publicly accessible
 */
const uploadPrivateToCloudinary = (fileBuffer, folder = 'worksheets') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
        type: 'private' // Ensures the file isn't publicly accessible via standard URL
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    Readable.from(fileBuffer).pipe(stream);
  });
};

/**
 * Generate a secure backend-signed download URL for private files.
 * Typically valid for a short time or used for proxying.
 */
const getPrivateDownloadUrl = (publicId, format = 'pdf') => {
  return cloudinary.utils.private_download_url(publicId, format, {
    resource_type: 'raw',
    expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
  });
};


/**
 * Upload and compress profile pictures to Cloudinary
 * Targets 400x400 filled square focusing on faces, auto WebP/AVIF formatting, and auto quality compression.
 */
const uploadProfilePicToCloudinary = (fileBuffer, folder = 'profile_pics') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 400, height: 400, crop: 'fill', gravity: 'face' },
          { quality: 'auto:good' }, // good balance between size and quality
          { fetch_format: 'auto' } // converts to optimized format like WebP/AVIF
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );
    Readable.from(fileBuffer).pipe(stream);
  });
};

module.exports = {
  uploadToCloudinary,
  uploadPrivateToCloudinary,
  getPrivateDownloadUrl,
  uploadProfilePicToCloudinary
};

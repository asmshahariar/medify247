import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file to Cloudinary
 * @param {Buffer} fileBuffer - File buffer
 * @param {String} folder - Cloudinary folder path
 * @param {String} resourceType - 'image' or 'raw' (for PDFs/documents)
 * @returns {Promise} Cloudinary upload result
 */
export const uploadToCloudinary = async (fileBuffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `medify247/${folder}`,
        resource_type: resourceType === 'auto' ? 'auto' : resourceType,
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload file from local path to Cloudinary
 * @param {String} filePath - Local file path
 * @param {String} folder - Cloudinary folder path
 * @param {String} resourceType - 'image' or 'raw'
 * @returns {Promise} Cloudinary upload result
 */
export const uploadFileFromPath = async (filePath, folder, resourceType = 'auto') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `medify247/${folder}`,
      resource_type: resourceType === 'auto' ? 'auto' : resourceType,
      use_filename: true,
      unique_filename: true,
      overwrite: false
    });
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - 'image' or 'raw'
 * @returns {Promise} Deletion result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Get Cloudinary URL from public ID
 * @param {String} publicId - Cloudinary public ID
 * @param {Object} options - Transform options
 * @returns {String} Cloudinary URL
 */
export const getCloudinaryUrl = (publicId, options = {}) => {
  if (!publicId) return null;
  
  // If it's already a full URL, return as is
  if (publicId.startsWith('http')) {
    return publicId;
  }
  
  return cloudinary.url(publicId, {
    secure: true,
    ...options
  });
};

export default cloudinary;


import multer from 'multer';
import path from 'path';
import { uploadToCloudinary } from '../utils/cloudinary.util.js';

// Memory storage for Cloudinary upload
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedDocTypes = /pdf|doc|docx/;
  const extname = path.extname(file.originalname).toLowerCase();

  if (file.fieldname === 'profileImage' || file.fieldname === 'banner') {
    if (allowedImageTypes.test(extname)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed'));
    }
  } else if (file.fieldname === 'documents' || file.fieldname === 'degrees' || file.fieldname === 'certificates' || file.fieldname === 'bmdcProof') {
    if (allowedDocTypes.test(extname)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files (pdf, doc, docx) are allowed'));
    }
  } else if (file.fieldname === 'report') {
    if (allowedDocTypes.test(extname)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for reports'));
    }
  } else {
    cb(null, true);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB default
  },
  fileFilter: fileFilter
});

// Middleware to upload files to Cloudinary after multer processing
export const uploadToCloudinaryMiddleware = async (req, res, next) => {
  try {
    if (!req.files && !req.file) {
      return next();
    }

    // Handle single file
    if (req.file) {
      const folder = getFolderFromFieldName(req.file.fieldname);
      const resourceType = getResourceType(req.file.mimetype);
      
      const result = await uploadToCloudinary(
        req.file.buffer,
        folder,
        resourceType
      );
      
      req.file.cloudinaryUrl = result.secure_url;
      req.file.cloudinaryPublicId = result.public_id;
      req.file.path = result.secure_url; // For backward compatibility
    }

    // Handle multiple files
    if (req.files) {
      for (const fieldName in req.files) {
        const files = Array.isArray(req.files[fieldName]) 
          ? req.files[fieldName] 
          : [req.files[fieldName]];
        
        const folder = getFolderFromFieldName(fieldName);
        
        req.files[fieldName] = await Promise.all(
          files.map(async (file) => {
            const resourceType = getResourceType(file.mimetype);
            const result = await uploadToCloudinary(
              file.buffer,
              folder,
              resourceType
            );
            
            return {
              ...file,
              cloudinaryUrl: result.secure_url,
              cloudinaryPublicId: result.public_id,
              path: result.secure_url, // For backward compatibility
              filename: result.original_filename || file.originalname
            };
          })
        );
      }
    }

    next();
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// Helper function to determine folder based on field name
const getFolderFromFieldName = (fieldName) => {
  if (fieldName === 'profileImage' || fieldName === 'banner') {
    return 'images';
  } else if (fieldName === 'documents' || fieldName === 'degrees' || fieldName === 'certificates' || fieldName === 'bmdcProof') {
    return 'documents';
  } else if (fieldName === 'report') {
    return 'reports';
  } else {
    return 'uploads';
  }
};

// Helper function to determine resource type
const getResourceType = (mimetype) => {
  if (mimetype.startsWith('image/')) {
    return 'image';
  } else if (mimetype === 'application/pdf' || mimetype.includes('document') || mimetype.includes('msword')) {
    return 'raw';
  } else {
    return 'auto';
  }
};

export default upload;
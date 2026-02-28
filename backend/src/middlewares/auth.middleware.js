import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import Doctor from '../models/Doctor.model.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Access denied.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // First check if it's a doctor (doctors are stored ONLY in doctors table)
    const doctor = await Doctor.findById(decoded.id).select('-password');
    
    if (doctor) {
      // It's a doctor - check if approved
      if (doctor.status !== 'approved') {
        return res.status(403).json({
          success: false,
          message: `Doctor not approved. Current status: ${doctor.status}.`
        });
      }
      
      // Attach doctor as user object with role
      req.user = {
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        role: 'doctor',
        profileImage: doctor.profilePhotoUrl
      };
      req.doctor = doctor; // Also attach full doctor object
      return next();
    }
    
    // Not a doctor - check User table (for patients, hospital admins, super admins)
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Access denied.'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Access denied.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Authentication error',
      error: error.message
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`
      });
    }

    next();
  };
};

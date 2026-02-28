import User from '../models/User.model.js';
import Doctor from '../models/Doctor.model.js';
import Hospital from '../models/Hospital.model.js';
import DiagnosticCenter from '../models/DiagnosticCenter.model.js';

/**
 * GET /api/users/:id
 * Retrieve user profile (role aware)
 */
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    // Users can only view their own profile unless they're super admin
    if (req.user.role !== 'super_admin' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own profile.'
      });
    }

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    let roleData = null;

    // Get role-specific data
    if (user.role === 'doctor') {
      roleData = await Doctor.findOne({ userId: user._id })
        .populate('hospitalId', 'name status');
    } else if (user.role === 'hospital_admin') {
      roleData = await Hospital.findOne({ userId: user._id });
    } else if (user.role === 'diagnostic_center_admin') {
      roleData = await DiagnosticCenter.findOne({ userId: user._id });
    }

    res.json({
      success: true,
      data: {
        user,
        roleData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};


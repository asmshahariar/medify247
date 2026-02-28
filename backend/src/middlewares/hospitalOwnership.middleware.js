import Hospital from '../models/Hospital.model.js';

/**
 * Middleware to check if user is hospital admin of the specified hospital
 * Use after authenticate middleware
 */
export const checkHospitalOwnership = async (req, res, next) => {
  try {
    const { hospitalId } = req.params;

    if (!hospitalId) {
      return res.status(400).json({
        success: false,
        message: 'Hospital ID is required'
      });
    }

    const hospital = await Hospital.findById(hospitalId);

    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    // Super admin can access any hospital
    if (req.user.role === 'super_admin') {
      req.hospital = hospital;
      return next();
    }

    // Check if user is hospital admin of this hospital
    if (req.user.role !== 'hospital_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Hospital admin role required.'
      });
    }

    if (!hospital.admins || !hospital.admins.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not an admin of this hospital.'
      });
    }

    // Check if hospital is approved
    if (hospital.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Hospital must be approved to perform this action'
      });
    }

    req.hospital = hospital;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error checking hospital ownership',
      error: error.message
    });
  }
};


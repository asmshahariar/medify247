import DiagnosticCenter from '../models/DiagnosticCenter.model.js';

/**
 * Middleware to check if the authenticated user is an admin of the diagnostic center
 * Must be used after authenticate and authorize middleware
 */
export const checkDiagnosticCenterOwnership = async (req, res, next) => {
  try {
    const { centerId } = req.params;

    if (!centerId) {
      return res.status(400).json({
        success: false,
        message: 'Diagnostic center ID is required'
      });
    }

    // Super admin can access any diagnostic center
    if (req.user.role === 'super_admin') {
      return next();
    }

    // Check if diagnostic center exists
    const diagnosticCenter = await DiagnosticCenter.findById(centerId);
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic center not found'
      });
    }

    // Check if user is a diagnostic center admin
    if (req.user.role !== 'diagnostic_center_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Diagnostic center admin role required.'
      });
    }

    // Check if user is an admin of this diagnostic center
    // Convert both to strings for comparison
    const userIdString = req.user._id.toString();
    const adminIds = (diagnosticCenter.admins || []).map(adminId => adminId.toString());
    
    console.log('Ownership check:', {
      userId: userIdString,
      adminIds: adminIds,
      centerId: centerId,
      userRole: req.user.role
    });
    
    if (!adminIds.includes(userIdString)) {
      console.error('User not in admins list:', {
        userId: userIdString,
        adminIds: adminIds,
        centerName: diagnosticCenter.name
      });
      return res.status(403).json({
        success: false,
        message: 'Access denied. You are not an admin of this diagnostic center.'
      });
    }

    // Attach diagnostic center to request for use in controllers
    req.diagnosticCenter = diagnosticCenter;
    next();
  } catch (error) {
    console.error('Diagnostic center ownership check error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      centerId: req.params.centerId,
      userId: req.user?._id
    });
    res.status(500).json({
      success: false,
      message: 'Failed to verify diagnostic center ownership',
      error: error.message
    });
  }
};


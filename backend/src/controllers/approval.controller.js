import Doctor from '../models/Doctor.model.js';
import Hospital from '../models/Hospital.model.js';
import DiagnosticCenter from '../models/DiagnosticCenter.model.js';
import Approval from '../models/Approval.model.js';
import User from '../models/User.model.js';
import { logApproval, notifyEmail } from './doctor.controller.js';
import { validationResult } from 'express-validator';

/**
 * POST /api/admin/approve/doctor/:doctorId
 * Super admin approves standalone doctor
 */
export const approveDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Only approve if status is pending_super_admin or pending_hospital_and_super_admin
    if (!['pending_super_admin', 'pending_hospital_and_super_admin'].includes(doctor.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve doctor with status: ${doctor.status}`
      });
    }

    const previousStatus = doctor.status;

    // If doctor has hospitalId and status is pending_hospital_and_super_admin,
    // approve super admin part but keep as pending_hospital for hospital admin approval
    if (doctor.hospitalId && doctor.status === 'pending_hospital_and_super_admin') {
      doctor.status = 'pending_hospital';
    } else {
      // Standalone doctor or hospital already approved
      doctor.status = 'approved';
    }

    await doctor.save();

    // Log approval action
    await logApproval(
      req.user._id,
      'super_admin',
      'doctor',
      doctor._id,
      'approve',
      reason || 'Approved by super admin',
      previousStatus,
      doctor.status
    );

    // Send notification (stub)
    if (doctor.email) {
      await notifyEmail(
        doctor.email,
        'Doctor Approval',
        doctor.status === 'approved' 
          ? 'Your doctor account has been approved. You can now login.'
          : 'Super admin has approved your registration. Hospital admin approval pending.'
      );
    }

    res.json({
      success: true,
      message: `Doctor ${doctor.status === 'approved' ? 'approved' : 'partially approved'}`,
      data: {
        doctor: {
          id: doctor._id,
          status: doctor.status,
          previousStatus
        }
      }
    });
  } catch (error) {
    console.error('Approve doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve doctor',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/reject/doctor/:doctorId
 * Super admin rejects doctor
 */
export const rejectDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const previousStatus = doctor.status;
    doctor.status = 'rejected';
    doctor.rejectionReason = reason;
    await doctor.save();

    // Log rejection action
    await logApproval(
      req.user._id,
      'super_admin',
      'doctor',
      doctor._id,
      'reject',
      reason,
      previousStatus,
      'rejected'
    );

    // Send notification (stub)
    if (doctor.email) {
      await notifyEmail(
        doctor.email,
        'Doctor Registration Rejected',
        `Your doctor registration has been rejected. Reason: ${reason}`
      );
    }

    res.json({
      success: true,
      message: 'Doctor rejected successfully',
      data: {
        doctor: {
          id: doctor._id,
          status: doctor.status,
          rejectionReason: reason
        }
      }
    });
  } catch (error) {
    console.error('Reject doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject doctor',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/approve/hospital/:hospitalId
 * Super admin approves hospital
 */
export const approveHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { reason } = req.body;

    const hospital = await Hospital.findById(hospitalId).populate('userId');
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    if (hospital.status !== 'pending_super_admin') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve hospital with status: ${hospital.status}`
      });
    }

    const previousStatus = hospital.status;
    hospital.status = 'approved';
    hospital.verifiedAt = new Date();
    hospital.verifiedBy = req.user._id;
    await hospital.save();

    // Activate hospital admin accounts
    if (hospital.admins && hospital.admins.length > 0) {
      await User.updateMany(
        { _id: { $in: hospital.admins } },
        { isActive: true }
      );
    }

    // Log approval action
    await logApproval(
      req.user._id,
      'super_admin',
      'hospital',
      hospital._id,
      'approve',
      reason || 'Approved by super admin',
      previousStatus,
      'approved'
    );

    // Send notification (stub)
    if (hospital.userId?.email) {
      await notifyEmail(
        hospital.userId.email,
        'Hospital Approval',
        'Your hospital has been approved. You can now manage your hospital dashboard.'
      );
    }

    res.json({
      success: true,
      message: 'Hospital approved successfully',
      data: {
        hospital: {
          id: hospital._id,
          status: hospital.status,
          name: hospital.name
        }
      }
    });
  } catch (error) {
    console.error('Approve hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve hospital',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/reject/hospital/:hospitalId
 * Super admin rejects hospital
 */
export const rejectHospital = async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const hospital = await Hospital.findById(hospitalId).populate('userId');
    if (!hospital) {
      return res.status(404).json({
        success: false,
        message: 'Hospital not found'
      });
    }

    const previousStatus = hospital.status;
    hospital.status = 'rejected';
    hospital.rejectionReason = reason;
    await hospital.save();

    // Log rejection action
    await logApproval(
      req.user._id,
      'super_admin',
      'hospital',
      hospital._id,
      'reject',
      reason,
      previousStatus,
      'rejected'
    );

    // Send notification (stub)
    if (hospital.userId?.email) {
      await notifyEmail(
        hospital.userId.email,
        'Hospital Registration Rejected',
        `Your hospital registration has been rejected. Reason: ${reason}`
      );
    }

    res.json({
      success: true,
      message: 'Hospital rejected successfully',
      data: {
        hospital: {
          id: hospital._id,
          status: hospital.status,
          rejectionReason: reason
        }
      }
    });
  } catch (error) {
    console.error('Reject hospital error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject hospital',
      error: error.message
    });
  }
};

/**
 * GET /api/admin/pending
 * Super admin lists pending hospitals & doctors
 */
export const getPendingItems = async (req, res) => {
  try {
    const     pendingDoctors = await Doctor.find({
      status: { $in: ['pending_super_admin', 'pending_hospital_and_super_admin'] }
    })
      .populate('hospitalId', 'name status')
      .sort({ createdAt: -1 });

    const pendingHospitals = await Hospital.find({
      status: 'pending_super_admin'
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    const pendingDiagnosticCenters = await DiagnosticCenter.find({
      status: 'pending_super_admin'
    })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        pendingDoctors,
        pendingHospitals,
        pendingDiagnosticCenters,
        counts: {
          doctors: pendingDoctors.length,
          hospitals: pendingHospitals.length,
          diagnosticCenters: pendingDiagnosticCenters.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending items',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/approve/diagnostic-center/:centerId
 * Super admin approves diagnostic center
 */
export const approveDiagnosticCenter = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { reason } = req.body;

    const diagnosticCenter = await DiagnosticCenter.findById(centerId).populate('userId');
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic center not found'
      });
    }

    if (diagnosticCenter.status !== 'pending_super_admin') {
      return res.status(400).json({
        success: false,
        message: `Cannot approve diagnostic center with status: ${diagnosticCenter.status}`
      });
    }

    const previousStatus = diagnosticCenter.status;
    diagnosticCenter.status = 'approved';
    diagnosticCenter.verifiedAt = new Date();
    diagnosticCenter.verifiedBy = req.user._id;
    await diagnosticCenter.save();

    // Activate diagnostic center admin accounts
    if (diagnosticCenter.admins && diagnosticCenter.admins.length > 0) {
      await User.updateMany(
        { _id: { $in: diagnosticCenter.admins } },
        { isActive: true }
      );
    }

    // Log approval action
    await logApproval(
      req.user._id,
      'super_admin',
      'diagnostic_center',
      diagnosticCenter._id,
      'approve',
      reason || 'Approved by super admin',
      previousStatus,
      'approved'
    );

    // Send notification (stub)
    if (diagnosticCenter.userId?.email) {
      await notifyEmail(
        diagnosticCenter.userId.email,
        'Diagnostic Center Approval',
        'Your diagnostic center has been approved. You can now complete your profile and manage your dashboard.'
      );
    }

    res.json({
      success: true,
      message: 'Diagnostic center approved successfully',
      data: {
        diagnosticCenter: {
          id: diagnosticCenter._id,
          status: diagnosticCenter.status,
          name: diagnosticCenter.name
        }
      }
    });
  } catch (error) {
    console.error('Approve diagnostic center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve diagnostic center',
      error: error.message
    });
  }
};

/**
 * POST /api/admin/reject/diagnostic-center/:centerId
 * Super admin rejects diagnostic center
 */
export const rejectDiagnosticCenter = async (req, res) => {
  try {
    const { centerId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const diagnosticCenter = await DiagnosticCenter.findById(centerId).populate('userId');
    if (!diagnosticCenter) {
      return res.status(404).json({
        success: false,
        message: 'Diagnostic center not found'
      });
    }

    if (diagnosticCenter.status !== 'pending_super_admin') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject diagnostic center with status: ${diagnosticCenter.status}`
      });
    }

    const previousStatus = diagnosticCenter.status;
    diagnosticCenter.status = 'rejected';
    diagnosticCenter.rejectionReason = reason;
    await diagnosticCenter.save();

    // Log rejection action
    await logApproval(
      req.user._id,
      'super_admin',
      'diagnostic_center',
      diagnosticCenter._id,
      'reject',
      reason,
      previousStatus,
      'rejected'
    );

    // Send notification (stub)
    if (diagnosticCenter.userId?.email) {
      await notifyEmail(
        diagnosticCenter.userId.email,
        'Diagnostic Center Registration Rejected',
        `Your diagnostic center registration has been rejected. Reason: ${reason}`
      );
    }

    res.json({
      success: true,
      message: 'Diagnostic center rejected successfully',
      data: {
        diagnosticCenter: {
          id: diagnosticCenter._id,
          status: diagnosticCenter.status,
          rejectionReason: reason
        }
      }
    });
  } catch (error) {
    console.error('Reject diagnostic center error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject diagnostic center',
      error: error.message
    });
  }
};

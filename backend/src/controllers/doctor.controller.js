import User from '../models/User.model.js';
import Doctor from '../models/Doctor.model.js';
import Hospital from '../models/Hospital.model.js';
import Approval from '../models/Approval.model.js';
import { validationResult } from 'express-validator';

// Helper function to log approval action
const logApproval = async (actorId, actorRole, targetType, targetId, action, reason, previousStatus, newStatus) => {
  try {
    await Approval.create({
      actorId,
      actorRole,
      targetType,
      targetId,
      action,
      reason,
      previousStatus,
      newStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error logging approval:', error);
  }
};

// Helper function to notify (stub for email integration)
const notifyEmail = async (userEmail, subject, body) => {
  // TODO: Integrate with SMTP or 3rd-party notification service
  console.log(`[NOTIFICATION] To: ${userEmail}, Subject: ${subject}, Body: ${body}`);
};

/**
 * POST /api/doctors/register
 * Register a new doctor (standalone or with hospitalId)
 * Approval flow:
 * - Standalone (no hospitalId) → status: pending_super_admin
 * - With hospitalId + hospital approved → status: pending_hospital
 * - With hospitalId + hospital not approved → status: pending_hospital_and_super_admin
 */
export const registerDoctor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      name,
      email,
      phone,
      password,
      medicalLicenseNumber,
      licenseDocumentUrl,
      specialization,
      experienceYears,
      consultationFee,
      chamberId,
      hospitalId,
      schedule // Array of schedule objects with dayOfWeek and timeSlots
    } = req.body;

    // Check if doctor already exists (email or phone)
    const existingDoctorByEmail = await Doctor.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingDoctorByEmail) {
      return res.status(400).json({
        success: false,
        message: 'Doctor already exists with this email or phone'
      });
    }

    // Check if medical license number already exists
    const existingDoctorByLicense = await Doctor.findOne({ medicalLicenseNumber });
    if (existingDoctorByLicense) {
      return res.status(400).json({
        success: false,
        message: 'Medical license number already exists'
      });
    }

    // Also check User table to prevent conflicts
    const existingUser = await User.findOne({
      $or: [{ email }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email or phone already registered as a user'
      });
    }

    // Determine initial status based on hospitalId and hospital status
    let initialStatus = 'pending_super_admin'; // Default: standalone doctor

    if (hospitalId) {
      const hospital = await Hospital.findById(hospitalId);
      
      if (!hospital) {
        return res.status(404).json({
          success: false,
          message: 'Hospital not found'
        });
      }

      if (hospital.status === 'approved') {
        // Hospital is approved → doctor needs hospital admin approval only
        initialStatus = 'pending_hospital';
      } else {
        // Hospital is not approved → needs both super admin and hospital admin approval
        initialStatus = 'pending_hospital_and_super_admin';
      }
    }

    // Create doctor record directly in doctors table (NO user record created)
    // Set bmdcNo to medicalLicenseNumber for backward compatibility (prevents null duplicate key error)
    // DO NOT set userId at all - leave it undefined to avoid index conflicts
    const doctorData = {
      name,
      email,
      phone,
      password, // Will be hashed by pre-save hook
      bmdcNo: medicalLicenseNumber, // Set to medicalLicenseNumber to avoid null duplicate key error
      medicalLicenseNumber,
      licenseDocumentUrl: licenseDocumentUrl || '', // Make optional for now, can be uploaded later
      specialization: Array.isArray(specialization) ? specialization : [specialization],
      experienceYears: parseInt(experienceYears),
      consultationFee: parseFloat(consultationFee) || 0,
      hospitalId: hospitalId || null,
      status: initialStatus
      // userId is NOT set - leave it undefined (not null) to avoid sparse index conflicts
      // Profile fields (description, qualifications, holidays, etc.) will be added after approval
    };
    
    const doctor = await Doctor.create(doctorData);

    // Create initial schedule if provided
    try {
      if (schedule && Array.isArray(schedule) && schedule.length > 0) {
        const Schedule = (await import('../models/Schedule.model.js')).default;
        const Chamber = (await import('../models/Chamber.model.js')).default;
        
        // Create or find chamber if chamberId provided
        let chamber = null;
        if (chamberId) {
          chamber = await Chamber.findById(chamberId);
          if (!chamber || chamber.doctorId.toString() !== doctor._id.toString()) {
            // Create chamber if it doesn't exist or doesn't belong to this doctor
            chamber = await Chamber.create({
              doctorId: doctor._id,
              name: `Chamber for ${doctor.name}`,
              hospitalId: hospitalId || null,
              consultationFee: parseFloat(consultationFee) || 0
            });
          }
        } else if (hospitalId) {
          // Create default chamber for hospital
          chamber = await Chamber.create({
            doctorId: doctor._id,
            name: `Hospital Chamber for ${doctor.name}`,
            hospitalId: hospitalId,
            consultationFee: parseFloat(consultationFee) || 0
          });
        } else {
          // Create default standalone chamber
          chamber = await Chamber.create({
            doctorId: doctor._id,
            name: `Chamber for ${doctor.name}`,
            consultationFee: parseFloat(consultationFee) || 0
          });
        }

        // Create schedules
        for (const scheduleItem of schedule) {
          if (scheduleItem.dayOfWeek !== undefined && scheduleItem.timeSlots) {
            await Schedule.create({
              doctorId: doctor._id,
              chamberId: chamber._id,
              dayOfWeek: parseInt(scheduleItem.dayOfWeek),
              timeSlots: Array.isArray(scheduleItem.timeSlots) ? scheduleItem.timeSlots.map(slot => ({
                startTime: slot.startTime || '09:00',
                endTime: slot.endTime || '17:00',
                sessionDuration: parseInt(slot.sessionDuration) || 15,
                maxPatients: slot.maxPatients || 1
              })) : [],
              isActive: true
            });
          }
        }
      }
    } catch (scheduleError) {
      // Log schedule creation error but don't fail registration
      console.error('Error creating schedule:', scheduleError);
      // Doctor is already created, schedule can be added later
    }

    // Log registration event (use doctor._id as actorId since no user record)
    await logApproval(
      doctor._id, // Use doctor ID since no user record exists
      'doctor', // actorRole for self-registration
      'doctor',
      doctor._id,
      'register',
      null,
      null,
      initialStatus
    );

    // Send notification (stub)
    await notifyEmail(
      email,
      'Doctor Registration Submitted',
      `Your doctor registration has been submitted with status: ${initialStatus}. You will be notified once approved.`
    );

    res.status(201).json({
      success: true,
      message: `Doctor registration successful. Status: ${initialStatus}`,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          status: doctor.status,
          medicalLicenseNumber: doctor.medicalLicenseNumber
        }
      }
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Doctor registration failed',
      error: error.message
    });
  }
};

/**
 * GET /api/doctors/:id/status
 * Get doctor approval status
 */
export const getDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findById(id)
      .populate('hospitalId', 'name status');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      data: {
        doctor: {
          id: doctor._id,
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          status: doctor.status,
          medicalLicenseNumber: doctor.medicalLicenseNumber,
          hospitalId: doctor.hospitalId,
          hospitalStatus: doctor.hospitalId?.status
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor status',
      error: error.message
    });
  }
};

export { logApproval, notifyEmail };
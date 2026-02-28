import express from 'express';
import { body } from 'express-validator';
import {
  registerHospital,
  addDoctorByHospital,
  getHospitalDoctors,
  approveDoctorByHospital,
  getHospitalProfile,
  updateHospitalProfile,
  searchVerifiedDoctors,
  linkDoctorToHospital,
  updateDoctorByHospital,
  removeDoctorFromHospital,
  getHospitalAppointments,
  updateHospitalAppointmentStatus,
  getHospitalDashboard,
  createHomeService,
  getHomeServices,
  getHomeService,
  updateHomeService,
  deleteHomeService,
  createOrUpdateSerialSettings,
  getSerialSettings,
  getSerialStats,
  createOrUpdateDateSerialSettings,
  getDateSerialSettings,
  deleteDateSerialSettings,
  getHomeServiceRequests,
  getHomeServiceRequest,
  acceptHomeServiceRequest,
  rejectHomeServiceRequest,
  addTest,
  getTests,
  updateTest,
  deleteTest,
  createOrUpdateTestSerialSettings,
  getTestSerialSettings,
  getTestSerialStats,
  getTestSerialBookings
} from '../controllers/hospital.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { checkHospitalOwnership } from '../middlewares/hospitalOwnership.middleware.js';

const router = express.Router();

// Hospital registration (public - no auth required)
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Hospital name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('address').notEmpty().withMessage('Address is required'),
  body('registrationNumber').notEmpty().withMessage('Registration number is required'),
  body('documents').notEmpty().withMessage('Documents are required')
], registerHospital);

// Hospital admin routes (require authentication and hospital admin role)
router.use(authenticate);
router.use(authorize('hospital_admin', 'super_admin'));

// Add doctor directly (auto-approved)
router.post('/:hospitalId/doctors', checkHospitalOwnership, [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('medicalLicenseNumber').notEmpty().withMessage('Medical license number is required'),
  body('licenseDocumentUrl').optional().isString().withMessage('License document URL must be a string'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('experienceYears').isInt({ min: 0 }).withMessage('Experience years must be a valid number')
], addDoctorByHospital);

// Get hospital doctors
router.get('/:hospitalId/doctors', checkHospitalOwnership, getHospitalDoctors);

// Approve doctor registered under hospital
router.post('/:hospitalId/approve/doctor/:doctorId', checkHospitalOwnership, approveDoctorByHospital);

// Hospital Profile Management
router.get('/:hospitalId/profile', checkHospitalOwnership, getHospitalProfile);
router.put('/:hospitalId/profile', checkHospitalOwnership, [
  body('name').optional().trim().notEmpty(),
  body('address').optional().trim().notEmpty(),
  body('contactInfo').optional().isObject(),
  body('departments').optional().isArray(),
  body('logo').optional().isString(),
  body('facilities').optional().isArray(),
  body('services').optional().isArray()
], updateHospitalProfile);

// Search and Link Verified Doctors
router.get('/:hospitalId/doctors/search', checkHospitalOwnership, searchVerifiedDoctors);
router.post('/:hospitalId/doctors/link', checkHospitalOwnership, [
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('designation').optional().trim(),
  body('department').optional().trim()
], linkDoctorToHospital);

// Update doctor
router.put('/:hospitalId/doctors/:doctorId', checkHospitalOwnership, [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('phone').optional().trim().matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number is required'),
  body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('specialization').optional(),
  body('qualifications').optional().trim(),
  body('experienceYears').optional().isInt({ min: 0 }).withMessage('Experience years must be a valid number'),
  body('licenseDocumentUrl').optional().isString().withMessage('License document URL must be a string'),
  body('profilePhotoUrl').optional().isString().withMessage('Profile photo URL must be a string')
], updateDoctorByHospital);

router.delete('/:hospitalId/doctors/:doctorId', checkHospitalOwnership, removeDoctorFromHospital);

// Hospital Appointments
router.get('/:hospitalId/appointments', checkHospitalOwnership, getHospitalAppointments);
router.put('/:hospitalId/appointments/:appointmentId/status', checkHospitalOwnership, [
  body('status').isIn(['accepted', 'rejected', 'completed', 'cancelled']).withMessage('Invalid status'),
  body('notes').optional().trim()
], updateHospitalAppointmentStatus);

// Hospital Dashboard
router.get('/:hospitalId/dashboard', checkHospitalOwnership, getHospitalDashboard);

// Home Services Management
router.post('/:hospitalId/home-services', checkHospitalOwnership, [
  body('serviceType').trim().notEmpty().withMessage('Service type is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('note').optional().trim(),
  body('availableTime.startTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
  body('availableTime.endTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
  body('offDays').optional().isArray().withMessage('Off days must be an array'),
  body('offDays.*').optional().isInt({ min: 0, max: 6 }).withMessage('Each off day must be between 0 (Sunday) and 6 (Saturday)')
], createHomeService);

router.get('/:hospitalId/home-services', checkHospitalOwnership, getHomeServices);
router.get('/:hospitalId/home-services/:serviceId', checkHospitalOwnership, getHomeService);

router.put('/:hospitalId/home-services/:serviceId', checkHospitalOwnership, [
  body('serviceType').optional().trim().notEmpty(),
  body('price').optional().isFloat({ min: 0 }),
  body('note').optional().trim(),
  body('availableTime.startTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
  body('availableTime.endTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
  body('offDays').optional().isArray().withMessage('Off days must be an array'),
  body('offDays.*').optional().isInt({ min: 0, max: 6 }).withMessage('Each off day must be between 0 (Sunday) and 6 (Saturday)'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], updateHomeService);

router.delete('/:hospitalId/home-services/:serviceId', checkHospitalOwnership, deleteHomeService);

// Serial Settings Management for Hospital Doctors
router.post('/:hospitalId/doctors/:doctorId/serial-settings', checkHospitalOwnership, [
  body('totalSerialsPerDay').isInt({ min: 1 }).withMessage('Total serials per day must be a positive integer'),
  body('serialTimeRange.startTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
  body('serialTimeRange.endTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
  body('appointmentPrice').isFloat({ min: 0 }).withMessage('Appointment price must be a positive number'),
  body('availableDays').optional().isArray().withMessage('Available days must be an array'),
  body('availableDays.*').optional().isInt({ min: 0, max: 6 }).withMessage('Each day must be between 0 (Sunday) and 6 (Saturday)'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], createOrUpdateSerialSettings);

router.get('/:hospitalId/doctors/:doctorId/serial-settings', checkHospitalOwnership, getSerialSettings);
router.get('/:hospitalId/doctors/:doctorId/serial-stats', checkHospitalOwnership, getSerialStats);

// Date-Specific Serial Settings Management
router.post('/:hospitalId/doctors/:doctorId/date-serial-settings', checkHospitalOwnership, [
  body('date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('totalSerialsPerDay').isInt({ min: 1 }).withMessage('Total serials per day must be a positive integer'),
  body('adminNote').optional().trim().isLength({ max: 500 }).withMessage('Admin note must be less than 500 characters'),
  body('isEnabled').optional().isBoolean().withMessage('isEnabled must be a boolean'),
  body('serialTimeRange.startTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
  body('serialTimeRange.endTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
  body('appointmentPrice').optional().isFloat({ min: 0 }).withMessage('Appointment price must be a positive number')
], createOrUpdateDateSerialSettings);

router.get('/:hospitalId/doctors/:doctorId/date-serial-settings', checkHospitalOwnership, getDateSerialSettings);
router.delete('/:hospitalId/doctors/:doctorId/date-serial-settings/:dateSettingsId', checkHospitalOwnership, deleteDateSerialSettings);

// Home Service Requests Management
router.get('/:hospitalId/home-service-requests', checkHospitalOwnership, getHomeServiceRequests);
router.get('/:hospitalId/home-service-requests/:requestId', checkHospitalOwnership, getHomeServiceRequest);
router.put('/:hospitalId/home-service-requests/:requestId/accept', checkHospitalOwnership, acceptHomeServiceRequest);
router.put('/:hospitalId/home-service-requests/:requestId/reject', checkHospitalOwnership, [
  body('rejectionReason').trim().notEmpty().withMessage('Rejection reason is required')
], rejectHomeServiceRequest);

// Test Management
router.post('/:hospitalId/tests', checkHospitalOwnership, [
  body('name').trim().notEmpty().withMessage('Test name is required'),
  body('code').optional().trim(),
  body('category').optional().isIn(['pathology', 'radiology', 'cardiology', 'other']),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('duration').optional().isInt({ min: 0 }),
  body('isPackage').optional().isBoolean()
], addTest);

router.get('/:hospitalId/tests', checkHospitalOwnership, getTests);

router.put('/:hospitalId/tests/:testId', checkHospitalOwnership, [
  body('name').optional().trim().notEmpty(),
  body('code').optional().trim(),
  body('category').optional().isIn(['pathology', 'radiology', 'cardiology', 'other']),
  body('price').optional().isFloat({ min: 0 }),
  body('duration').optional().isInt({ min: 0 }),
  body('isPackage').optional().isBoolean()
], updateTest);

router.delete('/:hospitalId/tests/:testId', checkHospitalOwnership, deleteTest);

// Test Serial Settings Management
router.post('/:hospitalId/tests/:testId/serial-settings', checkHospitalOwnership, [
  body('totalSerialsPerDay').isInt({ min: 1 }).withMessage('Total serials per day must be a positive integer'),
  body('serialTimeRange.startTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
  body('serialTimeRange.endTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
  body('testPrice').isFloat({ min: 0 }).withMessage('Test price must be a positive number'),
  body('availableDays').optional().isArray().withMessage('Available days must be an array'),
  body('availableDays.*').optional().isInt({ min: 0, max: 6 }).withMessage('Each day must be between 0 (Sunday) and 6 (Saturday)'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], createOrUpdateTestSerialSettings);

router.get('/:hospitalId/tests/:testId/serial-settings', checkHospitalOwnership, getTestSerialSettings);

router.get('/:hospitalId/tests/:testId/serial-stats', checkHospitalOwnership, getTestSerialStats);

// Test Serial Bookings
router.get('/:hospitalId/test-serial-bookings', checkHospitalOwnership, getTestSerialBookings);

export default router;
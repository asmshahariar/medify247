import express from 'express';
import { body } from 'express-validator';
import {
  getProfile,
  onboardDoctor,
  updateProfile,
  upsertSchedule,
  getSchedules,
  getAppointments,
  updateAppointmentStatus,
  createPrescription,
  getPatientHistory,
  getEarnings,
  generateSerialList,
  createOrUpdateMySerialSettings,
  getMySerialSettings,
  getMySerialStats,
  createOrUpdateMyDateSerialSettings,
  getMyDateSerialSettings
} from '../controllers/doctor.portal.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import upload, { uploadToCloudinaryMiddleware } from '../middlewares/upload.middleware.js';

const router = express.Router();

// All routes require authentication and doctor role
router.use(authenticate);
router.use(authorize('doctor'));

// Profile routes
router.get('/profile', getProfile);
router.post('/onboard', [
  upload.fields([
    { name: 'bmdcProof', maxCount: 1 },
    { name: 'degrees', maxCount: 10 },
    { name: 'certificates', maxCount: 10 }
  ]),
  uploadToCloudinaryMiddleware,
  body('bmdcNo').notEmpty().withMessage('BMDC number is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('consultationFee').isNumeric().withMessage('Consultation fee must be a number')
], onboardDoctor);
router.put('/profile', upload.single('profilePhoto'), uploadToCloudinaryMiddleware, updateProfile);

// Schedule routes
router.post('/schedules', [
  body('chamberId').notEmpty().withMessage('Chamber ID is required'),
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('timeSlots').isArray().withMessage('Time slots must be an array')
], upsertSchedule);
router.get('/schedules', getSchedules);

// Appointment routes
router.get('/appointments', getAppointments);
router.put('/appointments/:appointmentId/status', [
  body('status').isIn(['pending', 'accepted', 'rejected', 'cancelled', 'no_show'])
    .withMessage('Invalid status. Allowed values: pending, accepted, rejected, cancelled, no_show')
], updateAppointmentStatus);

// Prescription routes
router.post('/prescriptions', [
  body('appointmentId').notEmpty().withMessage('Appointment ID is required'),
  body('medicines').isArray().withMessage('Medicines must be an array')
], createPrescription);

// Patient history
router.get('/patients/:patientId/history', getPatientHistory);

// Earnings
router.get('/earnings', getEarnings);

// Serial list
router.get('/serial-list', generateSerialList);

// Serial Settings Management (for individual doctors only)
router.post('/serial-settings', [
  body('totalSerialsPerDay').isInt({ min: 1 }).withMessage('Total serials per day must be a positive integer'),
  body('serialTimeRange.startTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
  body('serialTimeRange.endTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
  body('appointmentPrice').isFloat({ min: 0 }).withMessage('Appointment price must be a positive number'),
  body('availableDays').optional().isArray().withMessage('Available days must be an array'),
  body('availableDays.*').optional().isInt({ min: 0, max: 6 }).withMessage('Each day must be between 0 (Sunday) and 6 (Saturday)'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean')
], createOrUpdateMySerialSettings);

router.get('/serial-settings', getMySerialSettings);
router.get('/serial-stats', getMySerialStats);

// Date-Specific Serial Settings Management (for individual doctors only)
// GET route must come before POST to avoid conflicts
router.get('/date-serial-settings', getMyDateSerialSettings);

router.post('/date-serial-settings', [
  body('date').isISO8601().withMessage('Valid date is required (YYYY-MM-DD)'),
  body('totalSerialsPerDay').isInt({ min: 1 }).withMessage('Total serials per day must be a positive integer'),
  body('adminNote').optional().trim().isLength({ max: 500 }).withMessage('Admin note must be less than 500 characters'),
  body('isEnabled').optional().isBoolean().withMessage('isEnabled must be a boolean'),
  body('serialTimeRange.startTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:mm format'),
  body('serialTimeRange.endTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:mm format'),
  body('appointmentPrice').optional().isFloat({ min: 0 }).withMessage('Appointment price must be a positive number')
], createOrUpdateMyDateSerialSettings);

// Test route to verify routes are loading
router.get('/test-date-routes', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Date serial settings routes are loaded',
    routes: ['POST /api/doctor/date-serial-settings', 'GET /api/doctor/date-serial-settings']
  });
});

export default router;


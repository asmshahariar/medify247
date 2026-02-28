import express from 'express';
import { body } from 'express-validator';
import { registerDoctor, getDoctorStatus } from '../controllers/doctor.controller.js';

const router = express.Router();

// Doctor registration (public - no auth required)
// Required fields: name, phone, email, medicalLicenseNumber, specialization, experienceYears, consultationFee, schedule, password
router.post('/register', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('medicalLicenseNumber').notEmpty().withMessage('Medical license number is required'),
  body('specialization').notEmpty().withMessage('Specialization is required'),
  body('experienceYears').isInt({ min: 0 }).withMessage('Experience years must be a valid number'),
  body('consultationFee').isFloat({ min: 0 }).withMessage('Consultation fee must be a valid number'),
  body('schedule').isArray().withMessage('Schedule must be an array'),
  body('schedule.*.dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be 0-6'),
  body('schedule.*.timeSlots').isArray().withMessage('Time slots must be an array'),
  body('chamberId').optional().isMongoId().withMessage('Invalid chamber ID'),
  body('hospitalId').optional().isMongoId().withMessage('Invalid hospital ID'),
  body('licenseDocumentUrl').optional().isString().withMessage('License document URL must be a string')
], registerDoctor);

// Get doctor status (public)
router.get('/:id/status', getDoctorStatus);

export default router;
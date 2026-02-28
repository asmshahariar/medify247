import express from 'express';
import { body } from 'express-validator';
import { register, login, verifyPhoneOTP, resendOTP, getMe } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Validation rules - Patient registration only (default role: patient)
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Valid phone number is required (international format: +1234567890)')
    .isLength({ min: 10, max: 15 }).withMessage('Phone number must be between 10 and 15 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  // Note: role is automatically set to 'patient' - no role field in registration
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/verify-otp', verifyPhoneOTP);
router.post('/resend-otp', resendOTP);
router.get('/me', authenticate, getMe);

export default router;

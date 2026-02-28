import express from 'express';
import { body } from 'express-validator';
import {
  getDashboardStats,
  createBanner,
  getBanners,
  updateBanner,
  broadcastNotification,
  exportData,
  createHospital,
  getAllHospitals,
  updateHospital,
  deleteHospital,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllDoctors,
  updateDoctor,
  deleteDoctor,
  getAllDiagnosticCenters,
  createDiagnosticCenter,
  updateDiagnosticCenter,
  deleteDiagnosticCenter,
  getActivityLogs,
  getUserGrowth,
  getRecentRegistrations
} from '../controllers/admin.controller.js';
import {
  approveDoctor,
  rejectDoctor,
  approveHospital,
  rejectHospital,
  approveDiagnosticCenter,
  rejectDiagnosticCenter,
  getPendingItems
} from '../controllers/approval.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import upload, { uploadToCloudinaryMiddleware } from '../middlewares/upload.middleware.js';

const router = express.Router();

// All routes require authentication and super_admin role
router.use(authenticate);
router.use(authorize('super_admin'));

// Test route to verify routing works
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Admin routes are working' });
});

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

// Approval endpoints
router.get('/pending', getPendingItems);

// Doctor approval/rejection
router.post('/approve/doctor/:doctorId', [
  body('reason').optional().trim()
], approveDoctor);
router.post('/reject/doctor/:doctorId', [
  body('reason').notEmpty().withMessage('Rejection reason is required')
], rejectDoctor);

// Hospital approval/rejection
router.post('/approve/hospital/:hospitalId', [
  body('reason').optional().trim()
], approveHospital);
router.post('/reject/hospital/:hospitalId', [
  body('reason').notEmpty().withMessage('Rejection reason is required')
], rejectHospital);

// Diagnostic Center approval/rejection
router.post('/approve/diagnostic-center/:centerId', [
  body('reason').optional().trim()
], approveDiagnosticCenter);
router.post('/reject/diagnostic-center/:centerId', [
  body('reason').notEmpty().withMessage('Rejection reason is required')
], rejectDiagnosticCenter);

// Banner management
router.post('/banners', upload.single('banner'), uploadToCloudinaryMiddleware, [
  body('title').notEmpty().withMessage('Title is required')
], createBanner);
router.get('/banners', getBanners);
router.put('/banners/:bannerId', upload.single('banner'), uploadToCloudinaryMiddleware, updateBanner);

// Broadcast notification
router.post('/notifications/broadcast', [
  body('title').notEmpty().withMessage('Title is required'),
  body('message').notEmpty().withMessage('Message is required')
], broadcastNotification);

// Data export
router.get('/export', exportData);

// User Management
router.get('/users', getAllUsers);
router.put('/users/:userId', updateUser);
router.delete('/users/:userId', deleteUser);

// Doctor Management
router.get('/doctors', getAllDoctors);
router.put('/doctors/:doctorId', updateDoctor);
router.delete('/doctors/:doctorId', deleteDoctor);

// Hospital Management
router.get('/hospitals', getAllHospitals);
router.post('/hospitals', [
  body('name').trim().notEmpty().withMessage('Hospital name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('address').notEmpty().withMessage('Address is required'),
  body('registrationNumber').notEmpty().withMessage('Registration number is required')
], createHospital);
router.put('/hospitals/:hospitalId', updateHospital);
router.delete('/hospitals/:hospitalId', deleteHospital);

// Diagnostic Center Management
router.get('/diagnostic-centers', getAllDiagnosticCenters);
router.post('/diagnostic-centers', [
  body('name').trim().notEmpty().withMessage('Diagnostic center name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('address').notEmpty().withMessage('Address is required'),
  body('ownerName').trim().notEmpty().withMessage('Owner name is required'),
  body('ownerPhone').trim().notEmpty().withMessage('Owner phone is required'),
  body('tradeLicenseNumber').notEmpty().withMessage('Trade license number is required')
], createDiagnosticCenter);
router.put('/diagnostic-centers/:centerId', updateDiagnosticCenter);
router.delete('/diagnostic-centers/:centerId', deleteDiagnosticCenter);

// Analytics & Reports
router.get('/user-growth', getUserGrowth);
router.get('/recent-registrations', getRecentRegistrations);

// Activity Logs
router.get('/activity-logs', getActivityLogs);

export default router;

import express from 'express';
import { getUserProfile } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user profile
router.get('/:id', getUserProfile);

export default router;


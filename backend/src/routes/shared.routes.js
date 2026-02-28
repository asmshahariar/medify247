import express from 'express';
import Banner from '../models/Banner.model.js';
import Specialization from '../models/Specialization.model.js';
import Hospital from '../models/Hospital.model.js';
import { searchDoctors, getDoctorDetails, getAllHomeServices, getHomeServiceDetails } from '../controllers/patient.controller.js';
import moment from 'moment';

const router = express.Router();

// Get active banners (public)
router.get('/banners', async (req, res) => {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      startDate: { $lte: now },
      $or: [
        { endDate: { $gte: now } },
        { endDate: null }
      ]
    }).sort({ order: 1 });

    res.json({
      success: true,
      data: { banners }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners',
      error: error.message
    });
  }
});

// Get specializations (public)
router.get('/specializations', async (req, res) => {
  try {
    const specializations = await Specialization.find({ isActive: true })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { specializations }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch specializations',
      error: error.message
    });
  }
});

// Get approved hospitals (public)
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await Hospital.find({ status: 'approved' })
      .select('name address registrationNumber')
      .sort({ name: 1 });

    res.json({
      success: true,
      data: { hospitals }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hospitals',
      error: error.message
    });
  }
});

// Public doctor search (no authentication required)
router.get('/doctors/search', searchDoctors);

// Public doctor details (no authentication required)
router.get('/doctors/:doctorId', getDoctorDetails);

// Public home services (no authentication required)
router.get('/home-services', getAllHomeServices);
router.get('/home-services/:serviceId', getHomeServiceDetails);

export default router;


import mongoose from 'mongoose';

const diagnosticCenterSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Registration fields (required during registration)
  name: {
    type: String,
    required: [true, 'Diagnostic center name is required'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Physical address is required'],
    trim: true
  },
  ownerName: {
    type: String,
    required: [true, 'Owner/Admin name is required'],
    trim: true
  },
  ownerPhone: {
    type: String,
    required: [true, 'Owner/Admin phone number is required'],
    trim: true
  },
  tradeLicenseNumber: {
    type: String,
    required: [true, 'Trade license/Registration document number is required'],
    trim: true
  },
  tradeLicenseDocument: {
    type: String, // URL to uploaded document
    default: ''
  },
  // Post-approval profile fields (can be completed after approval)
  governmentRegistrationCertificate: {
    type: String, // URL to uploaded document
    default: ''
  },
  // List of available tests with prices (will be managed separately via Test model)
  // departments: Array of department names
  departments: [{
    type: String,
    trim: true
  }],
  // Operating hours
  operatingHours: {
    openingTime: {
      type: String,
      // Format: "HH:mm" (e.g., "09:00")
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Opening time must be in HH:mm format']
    },
    closingTime: {
      type: String,
      // Format: "HH:mm" (e.g., "17:00")
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Closing time must be in HH:mm format']
    }
  },
  // Services
  homeSampleCollection: {
    type: Boolean,
    default: false
  },
  emergencyService: {
    type: Boolean,
    default: false
  },
  ambulanceService: {
    available: {
      type: Boolean,
      default: false
    },
    contactNumber: {
      type: String,
      trim: true,
      default: ''
    }
  },
  // Staff information
  numberOfLabTechnicians: {
    type: Number,
    default: 0,
    min: 0
  },
  numberOfStaff: {
    type: Number,
    default: 0,
    min: 0
  },
  // Reporting time
  reportingTime: {
    type: String,
    enum: ['same_day', '24_hours', 'depends_on_test'],
    default: 'depends_on_test'
  },
  // Report delivery options
  reportDeliveryOptions: {
    email: {
      type: Boolean,
      default: true
    },
    onlinePortal: {
      type: Boolean,
      default: true
    }
  },
  // Additional fields
  logo: {
    type: String // Logo URL
  },
  contactInfo: {
    phone: [String],
    email: String,
    website: String
  },
  // Approval status
  status: {
    type: String,
    enum: [
      'pending_super_admin',
      'approved',
      'rejected',
      'suspended'
    ],
    default: 'pending_super_admin'
  },
  // Admin users
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Verification
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String
  },
  associatedDoctors: [{
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor'
    },
    designation: String,
    department: String,
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Rating
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Validate that closing time is after opening time
diagnosticCenterSchema.pre('save', function(next) {
  if (this.operatingHours && this.operatingHours.openingTime && this.operatingHours.closingTime) {
    const [openHour, openMin] = this.operatingHours.openingTime.split(':').map(Number);
    const [closeHour, closeMin] = this.operatingHours.closingTime.split(':').map(Number);
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    if (closeMinutes <= openMinutes) {
      return next(new Error('Closing time must be after opening time'));
    }
  }
  next();
});

// Indexes for efficient queries
diagnosticCenterSchema.index({ status: 1 });
diagnosticCenterSchema.index({ tradeLicenseNumber: 1 }, { unique: true });
diagnosticCenterSchema.index({ email: 1 });
diagnosticCenterSchema.index({ phone: 1 });

const DiagnosticCenter = mongoose.model('DiagnosticCenter', diagnosticCenterSchema);

export default DiagnosticCenter;


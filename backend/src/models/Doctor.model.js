import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const doctorSchema = new mongoose.Schema({
  // Authentication fields - doctors are stored ONLY in doctors table
  name: {
    type: String,
    required: [true, 'Name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 8,
    select: false // Don't return password by default
  },
  // Legacy userId field - optional for backward compatibility
  // No unique constraint in field definition - using sparse index instead
  // No default value - leave undefined to avoid sparse index conflicts
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
    // No default - leave undefined (not null) for sparse index compatibility
  },
  // Legacy field - kept for backward compatibility
  bmdcNo: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  description: {
    type: String,
    maxlength: 2000
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    default: 0
  },
  followUpFee: {
    type: Number,
    default: 0
  },
  reportFee: {
    type: Number,
    default: 0
  },
  holidays: [{
    date: {
      type: Date,
      required: true
    },
    reason: {
      type: String
    }
  }],
  emergencyAvailability: {
    available: {
      type: Boolean,
      default: false
    },
    contactNumber: {
      type: String
    },
    notes: {
      type: String
    }
  },
  socialLinks: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    website: String
  },
  status: {
    type: String,
    enum: [
      'pending_super_admin',
      'pending_hospital',
      'pending_hospital_and_super_admin',
      'approved',
      'rejected',
      'suspended'
    ],
    default: 'pending_super_admin'
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  },
  diagnosticCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    default: null
  },
  medicalLicenseNumber: {
    type: String,
    required: [true, 'Medical license number is required'],
    unique: true
  },
  licenseDocumentUrl: {
    type: String,
    default: '' // Optional - can be uploaded later or provided during registration
  },
  specialization: {
    type: [String],
    required: [true, 'Specialization is required']
  },
  qualifications: {
    type: String
  },
  // Visiting days and times (can be updated after approval)
  visitingDays: [{
    dayOfWeek: {
      type: Number, // 0 = Sunday, 6 = Saturday
      min: 0,
      max: 6
    },
    startTime: {
      type: String // e.g., "09:00"
    },
    endTime: {
      type: String // e.g., "17:00"
    }
  }],
  experienceYears: {
    type: Number,
    required: [true, 'Experience years is required']
  },
  chamber: {
    name: String,
    address: String,
    daysOpen: [String],
    hours: String
  },
  profilePhotoUrl: {
    type: String
  },
  verificationDocuments: {
    bmdcProof: String,
    degrees: [String],
    certificates: [String]
  },
  rejectionReason: {
    type: String
  },
  verifiedAt: {
    type: Date
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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

// Hash password before saving
doctorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
doctorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove old unique index on bmdcNo (if exists) and create sparse index instead
// Sparse index only indexes documents that have the field, allowing multiple nulls
doctorSchema.index({ bmdcNo: 1 }, { unique: true, sparse: true });

// Remove unique constraint on userId - make it sparse so multiple nulls are allowed
// Doctors are stored directly in doctors table, userId is optional for backward compatibility
doctorSchema.index({ userId: 1 }, { unique: true, sparse: true });

const Doctor = mongoose.model('Doctor', doctorSchema);

export default Doctor;

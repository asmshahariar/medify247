import mongoose from 'mongoose';

const hospitalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  // Legacy fields - kept for backward compatibility
  facilityName: {
    type: String
  },
  facilityType: {
    type: String,
    enum: ['hospital', 'diagnostic']
  },
  licenseNumber: {
    type: String
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  contactInfo: {
    phone: [String],
    email: String,
    website: String
  },
  facilities: [String],
  services: [String],
  departments: [String], // Hospital departments
  logo: {
    type: String // Logo URL
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
  name: {
    type: String,
    required: [true, 'Hospital name is required']
  },
  registrationNumber: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true
  },
  documents: [{
    type: String
  }],
  admins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  verificationDocuments: {
    license: String,
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

const Hospital = mongoose.model('Hospital', hospitalSchema);

export default Hospital;

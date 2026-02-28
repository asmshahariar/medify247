import mongoose from 'mongoose';

const homeServiceRequestSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null,
    index: true
  },
  diagnosticCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    default: null,
    index: true
  },
  homeServiceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'HomeService',
    required: true
  },
  requestNumber: {
    type: String,
    required: true,
    unique: true
  },
  // Patient information provided during request
  patientName: {
    type: String,
    required: true,
    trim: true
  },
  patientAge: {
    type: Number,
    required: true,
    min: 0
  },
  patientGender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  homeAddress: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    zipCode: {
      type: String,
      trim: true
    },
    country: {
      type: String,
      trim: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  // Service details (snapshot at time of request)
  serviceType: {
    type: String,
    required: true
  },
  servicePrice: {
    type: Number,
    required: true
  },
  serviceNote: {
    type: String,
    default: ''
  },
  // Request status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  // Admin actions
  acceptedAt: {
    type: Date
  },
  acceptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectedAt: {
    type: Date
  },
  rejectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  // Additional notes
  notes: {
    type: String,
    trim: true
  },
  // Requested date/time (optional)
  requestedDate: {
    type: Date
  },
  requestedTime: {
    type: String // Format: "HH:mm"
  },
  // Completion
  completedAt: {
    type: Date
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

// Validation: Either hospitalId or diagnosticCenterId must be provided
homeServiceRequestSchema.pre('save', function(next) {
  if (!this.hospitalId && !this.diagnosticCenterId) {
    return next(new Error('Either hospitalId or diagnosticCenterId must be provided'));
  }
  if (this.hospitalId && this.diagnosticCenterId) {
    return next(new Error('Home service request cannot belong to both hospital and diagnostic center'));
  }
  next();
});

// Indexes for efficient queries
homeServiceRequestSchema.index({ patientId: 1, createdAt: -1 });
homeServiceRequestSchema.index({ hospitalId: 1, status: 1 });
homeServiceRequestSchema.index({ diagnosticCenterId: 1, status: 1 });
homeServiceRequestSchema.index({ hospitalId: 1, createdAt: -1 });
homeServiceRequestSchema.index({ diagnosticCenterId: 1, createdAt: -1 });
homeServiceRequestSchema.index({ status: 1, createdAt: -1 });

const HomeServiceRequest = mongoose.model('HomeServiceRequest', homeServiceRequestSchema);

export default HomeServiceRequest;


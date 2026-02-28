import mongoose from 'mongoose';

const homeServiceSchema = new mongoose.Schema({
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
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    trim: true
    // Examples: 'home_doctor_visit', 'home_nursing', 'sample_collection', etc.
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive number']
  },
  note: {
    type: String,
    trim: true,
    default: ''
    // Optional short note/description for the service
  },
  availableTime: {
    startTime: {
      type: String,
      required: [true, 'Start time is required'],
      // Format: "HH:mm" (e.g., "09:00")
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format']
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
      // Format: "HH:mm" (e.g., "17:00")
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format']
    }
  },
  offDays: [{
    type: Number,
    // 0 = Sunday, 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday, 6 = Saturday
    min: 0,
    max: 6
  }],
  isActive: {
    type: Boolean,
    default: true
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
homeServiceSchema.pre('save', function(next) {
  if (!this.hospitalId && !this.diagnosticCenterId) {
    return next(new Error('Either hospitalId or diagnosticCenterId must be provided'));
  }
  if (this.hospitalId && this.diagnosticCenterId) {
    return next(new Error('Home service cannot belong to both hospital and diagnostic center'));
  }
  next();
});

// Index for efficient queries
homeServiceSchema.index({ hospitalId: 1, isActive: 1 });
homeServiceSchema.index({ diagnosticCenterId: 1, isActive: 1 });
homeServiceSchema.index({ hospitalId: 1, serviceType: 1 });
homeServiceSchema.index({ diagnosticCenterId: 1, serviceType: 1 });

// Validate that endTime is after startTime
homeServiceSchema.pre('save', function(next) {
  if (this.availableTime && this.availableTime.startTime && this.availableTime.endTime) {
    const [startHour, startMin] = this.availableTime.startTime.split(':').map(Number);
    const [endHour, endMin] = this.availableTime.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }
  next();
});

const HomeService = mongoose.model('HomeService', homeServiceSchema);

export default HomeService;


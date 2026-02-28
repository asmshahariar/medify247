import mongoose from 'mongoose';

const serialSettingsSchema = new mongoose.Schema({
  // For hospital-based doctors
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  },
  // For diagnostic center-based doctors
  diagnosticCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    default: null
  },
  // For individual doctors (not under hospital or diagnostic center)
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  // Chamber ID (optional, for hospital doctors with specific chambers)
  chamberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chamber',
    default: null
  },
  // Total number of online serials available per day
  totalSerialsPerDay: {
    type: Number,
    required: true,
    min: 1,
    default: 20
  },
  // Serial time range
  serialTimeRange: {
    startTime: {
      type: String,
      required: true,
      // Format: "HH:mm" (e.g., "09:00")
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format']
    },
    endTime: {
      type: String,
      required: true,
      // Format: "HH:mm" (e.g., "17:00")
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format']
    }
  },
  // Appointment price
  appointmentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  // Whether online serials are enabled
  isActive: {
    type: Boolean,
    default: true
  },
  // Days when serials are available (0 = Sunday, 6 = Saturday)
  availableDays: [{
    type: Number,
    min: 0,
    max: 6
  }],
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

// Validate that endTime is after startTime
serialSettingsSchema.pre('save', function(next) {
  if (this.serialTimeRange && this.serialTimeRange.startTime && this.serialTimeRange.endTime) {
    const [startHour, startMin] = this.serialTimeRange.startTime.split(':').map(Number);
    const [endHour, endMin] = this.serialTimeRange.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }
  // Note: A doctor can have multiple SerialSettings - one per hospital, one per diagnostic center, and one for individual practice
  // This validation is removed to allow multiple associations
  next();
});

// Indexes for efficient queries
serialSettingsSchema.index({ doctorId: 1, isActive: 1 });
serialSettingsSchema.index({ hospitalId: 1, doctorId: 1 });
serialSettingsSchema.index({ diagnosticCenterId: 1, doctorId: 1 });

// Compound unique index: one setting per doctor per hospital
serialSettingsSchema.index(
  { doctorId: 1, hospitalId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { hospitalId: { $ne: null }, diagnosticCenterId: null } }
);

// Compound unique index: one setting per doctor per diagnostic center
serialSettingsSchema.index(
  { doctorId: 1, diagnosticCenterId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { diagnosticCenterId: { $ne: null }, hospitalId: null } }
);

// Unique index for individual doctors (no hospital or diagnostic center)
serialSettingsSchema.index(
  { doctorId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { hospitalId: null, diagnosticCenterId: null } }
);

const SerialSettings = mongoose.model('SerialSettings', serialSettingsSchema);

export default SerialSettings;


import mongoose from 'mongoose';

const testSerialSettingsSchema = new mongoose.Schema({
  // For hospital tests
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null
  },
  // For diagnostic center tests
  diagnosticCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    default: null
  },
  // Test ID
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true
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
  // Test price (can override test default price)
  testPrice: {
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
testSerialSettingsSchema.pre('save', function(next) {
  if (this.serialTimeRange && this.serialTimeRange.startTime && this.serialTimeRange.endTime) {
    const [startHour, startMin] = this.serialTimeRange.startTime.split(':').map(Number);
    const [endHour, endMin] = this.serialTimeRange.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    if (endMinutes <= startMinutes) {
      return next(new Error('End time must be after start time'));
    }
  }
  next();
});

// Validation: Either hospitalId or diagnosticCenterId must be provided
testSerialSettingsSchema.pre('save', function(next) {
  if (!this.hospitalId && !this.diagnosticCenterId) {
    return next(new Error('Either hospitalId or diagnosticCenterId must be provided'));
  }
  if (this.hospitalId && this.diagnosticCenterId) {
    return next(new Error('Test serial settings cannot belong to both hospital and diagnostic center'));
  }
  next();
});

// Indexes for efficient queries
testSerialSettingsSchema.index({ testId: 1, hospitalId: 1 });
testSerialSettingsSchema.index({ testId: 1, diagnosticCenterId: 1 });
testSerialSettingsSchema.index({ testId: 1, isActive: 1 });
testSerialSettingsSchema.index({ hospitalId: 1, testId: 1 });
testSerialSettingsSchema.index({ diagnosticCenterId: 1, testId: 1 });

// Compound unique index: one setting per test per hospital
testSerialSettingsSchema.index(
  { testId: 1, hospitalId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { hospitalId: { $ne: null }, diagnosticCenterId: null } }
);

// Compound unique index: one setting per test per diagnostic center
testSerialSettingsSchema.index(
  { testId: 1, diagnosticCenterId: 1 },
  { unique: true, sparse: true, partialFilterExpression: { diagnosticCenterId: { $ne: null }, hospitalId: null } }
);

const TestSerialSettings = mongoose.model('TestSerialSettings', testSerialSettingsSchema);

export default TestSerialSettings;


import mongoose from 'mongoose';

const testSerialBookingSchema = new mongoose.Schema({
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
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test',
    required: true,
    index: true
  },
  bookingNumber: {
    type: String,
    required: true,
    unique: true
    // Note: unique: true automatically creates an index, so we don't need explicit index() call
  },
  serialNumber: {
    type: Number,
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true,
    index: true
  },
  timeSlot: {
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    }
  },
  testPrice: {
    type: Number,
    required: true
  },
  testName: {
    type: String,
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending',
    index: true
  },
  notes: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'hospital', 'diagnostic_center', 'system']
  },
  cancellationReason: {
    type: String
  },
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
testSerialBookingSchema.pre('save', function(next) {
  if (!this.hospitalId && !this.diagnosticCenterId) {
    return next(new Error('Either hospitalId or diagnosticCenterId must be provided'));
  }
  if (this.hospitalId && this.diagnosticCenterId) {
    return next(new Error('Test serial booking cannot belong to both hospital and diagnostic center'));
  }
  next();
});

// Indexes for efficient queries
testSerialBookingSchema.index({ patientId: 1, createdAt: -1 });
testSerialBookingSchema.index({ hospitalId: 1, appointmentDate: 1, status: 1 });
testSerialBookingSchema.index({ diagnosticCenterId: 1, appointmentDate: 1, status: 1 });
testSerialBookingSchema.index({ testId: 1, appointmentDate: 1, serialNumber: 1 });
// bookingNumber already has unique index from unique: true
testSerialBookingSchema.index({ appointmentDate: 1, serialNumber: 1, testId: 1 });
// Compound index for hospital test serial bookings
testSerialBookingSchema.index({ hospitalId: 1, testId: 1, appointmentDate: 1, serialNumber: 1 }, { unique: true, sparse: true, partialFilterExpression: { hospitalId: { $ne: null } } });
// Compound index for diagnostic center test serial bookings
testSerialBookingSchema.index({ diagnosticCenterId: 1, testId: 1, appointmentDate: 1, serialNumber: 1 }, { unique: true, sparse: true, partialFilterExpression: { diagnosticCenterId: { $ne: null } } });

const TestSerialBooking = mongoose.model('TestSerialBooking', testSerialBookingSchema);

export default TestSerialBooking;


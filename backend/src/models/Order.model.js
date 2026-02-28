import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  orderNumber: {
    type: String,
    required: true
  },
  tests: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test',
      required: true
    },
    testName: String,
    price: Number,
    quantity: {
      type: Number,
      default: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  finalAmount: {
    type: Number,
    required: true
  },
  collectionType: {
    type: String,
    enum: ['walk_in', 'home_collection'],
    required: true
  },
  appointmentDate: {
    type: Date
  },
  appointmentTime: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    contactPhone: String
  },
  status: {
    type: String,
    enum: ['pending', 'sample_collected', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online']
  },
  reports: [{
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Test'
    },
    reportPath: String,
    uploadedAt: Date,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  notes: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: String,
    enum: ['patient', 'hospital', 'system']
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
orderSchema.pre('save', function(next) {
  if (!this.hospitalId && !this.diagnosticCenterId) {
    return next(new Error('Either hospitalId or diagnosticCenterId must be provided'));
  }
  if (this.hospitalId && this.diagnosticCenterId) {
    return next(new Error('Order cannot belong to both hospital and diagnostic center'));
  }
  next();
});

// Indexes
orderSchema.index({ patientId: 1, createdAt: -1 });
orderSchema.index({ hospitalId: 1, status: 1 });
orderSchema.index({ diagnosticCenterId: 1, status: 1 });
orderSchema.index({ orderNumber: 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;

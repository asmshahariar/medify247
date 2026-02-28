import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    unique: true
  },
  category: {
    type: String,
    enum: ['pathology', 'radiology', 'cardiology', 'other']
  },
  description: {
    type: String
  },
  price: {
    type: Number,
    required: true
  },
  duration: {
    type: Number, // in hours
    default: 24
  },
  preparation: {
    type: String
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
  isActive: {
    type: Boolean,
    default: true
  },
  isPackage: {
    type: Boolean,
    default: false
  },
  packageTests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
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

// Validation: Either hospitalId or diagnosticCenterId must be provided
testSchema.pre('save', function(next) {
  if (!this.hospitalId && !this.diagnosticCenterId) {
    return next(new Error('Either hospitalId or diagnosticCenterId must be provided'));
  }
  if (this.hospitalId && this.diagnosticCenterId) {
    return next(new Error('Test cannot belong to both hospital and diagnostic center'));
  }
  next();
});

// Indexes
testSchema.index({ hospitalId: 1, isActive: 1 });
testSchema.index({ diagnosticCenterId: 1, isActive: 1 });

const Test = mongoose.model('Test', testSchema);

export default Test;


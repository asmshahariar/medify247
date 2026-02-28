import mongoose from 'mongoose';

const earningSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Doctor ID is required']
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: [true, 'Appointment ID is required']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 2020
  },
  consultationFee: {
    type: Number,
    required: [true, 'Consultation fee is required'],
    default: 0
  },
  platformFee: {
    type: Number,
    default: 0,
    min: 0
  },
  netAmount: {
    type: Number,
    required: [true, 'Net amount is required'],
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'cancelled'],
    default: 'pending'
  },
  paidAt: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'mobile_banking', 'cash', 'other']
  },
  transactionId: {
    type: String
  },
  notes: {
    type: String
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

// Index for efficient queries
earningSchema.index({ doctorId: 1, year: 1, month: 1 });
earningSchema.index({ appointmentId: 1 }, { unique: true }); // One earning per appointment

const Earning = mongoose.model('Earning', earningSchema);

export default Earning;


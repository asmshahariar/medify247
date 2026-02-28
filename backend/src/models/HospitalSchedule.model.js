import mongoose from 'mongoose';

/**
 * Hospital-specific schedule override for doctors
 * This overrides the doctor's global schedule ONLY when appointments are booked through this hospital
 */
const hospitalScheduleSchema = new mongoose.Schema({
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  chamberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chamber',
    required: true
  },
  availableDays: [{
    type: Number, // 0 = Sunday, 6 = Saturday
    min: 0,
    max: 6
  }],
  timeBlocks: [{
    startTime: {
      type: String, // "09:00"
      required: true
    },
    endTime: {
      type: String, // "17:00"
      required: true
    },
    sessionDuration: {
      type: Number, // minutes
      default: 15
    },
    maxPatients: {
      type: Number,
      default: 1
    }
  }],
  slotDuration: {
    type: Number, // minutes
    default: 15
  },
  isActive: {
    type: Boolean,
    default: true
  },
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
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

// Indexes for efficient queries
hospitalScheduleSchema.index({ hospitalId: 1, doctorId: 1 });
hospitalScheduleSchema.index({ hospitalId: 1, isActive: 1 });
hospitalScheduleSchema.index({ doctorId: 1, isActive: 1 });

// Prevent duplicate hospital-doctor-chamber schedule
hospitalScheduleSchema.index({ hospitalId: 1, doctorId: 1, chamberId: 1 }, { unique: true });

const HospitalSchedule = mongoose.model('HospitalSchedule', hospitalScheduleSchema);

export default HospitalSchedule;


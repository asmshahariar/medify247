import mongoose from 'mongoose';
import moment from 'moment';

const dateSerialSettingsSchema = new mongoose.Schema({
  // Reference to the base serial settings
  serialSettingsId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SerialSettings',
    required: true,
    index: true
  },
  // Doctor ID for quick lookup
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
    index: true
  },
  // Hospital ID (if hospital-based doctor)
  hospitalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    default: null,
    index: true
  },
  // Diagnostic Center ID (if diagnostic center-based doctor)
  diagnosticCenterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DiagnosticCenter',
    default: null,
    index: true
  },
  // Specific date for this configuration (stored as date only, no time)
  date: {
    type: Date,
    required: true,
    index: true
  },
  // Total serials available for this specific date (overrides base settings)
  totalSerialsPerDay: {
    type: Number,
    required: true,
    min: 1
  },
  // Admin note/message for this date
  adminNote: {
    type: String,
    default: null,
    maxlength: 500
  },
  // Whether this date is enabled for booking
  isEnabled: {
    type: Boolean,
    default: true,
    index: true
  },
  // Time range override (optional, uses base settings if not provided)
  serialTimeRange: {
    startTime: {
      type: String,
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:mm format']
    },
    endTime: {
      type: String,
      match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:mm format']
    }
  },
  // Price override (optional, uses base settings if not provided)
  appointmentPrice: {
    type: Number,
    min: 0
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

// Ensure date is stored as date only (no time component) in UTC
dateSerialSettingsSchema.pre('save', function(next) {
  if (this.date) {
    // If it's a string, parse it with format to avoid timezone shifts
    // If it's already a Date, convert it properly
    if (typeof this.date === 'string') {
      const dateMoment = moment.utc(this.date, 'YYYY-MM-DD', true);
      if (dateMoment.isValid()) {
        this.date = dateMoment.startOf('day').toDate();
      }
    } else if (this.date instanceof Date) {
      // If it's already a Date object, ensure it's at start of day in UTC
      this.date = moment.utc(this.date).startOf('day').toDate();
    }
  }
  next();
});

// Compound unique index: one setting per date per serial settings
dateSerialSettingsSchema.index(
  { serialSettingsId: 1, date: 1 },
  { unique: true }
);

// Index for efficient date range queries
dateSerialSettingsSchema.index({ doctorId: 1, date: 1, isEnabled: 1 });
dateSerialSettingsSchema.index({ hospitalId: 1, date: 1, isEnabled: 1 });
dateSerialSettingsSchema.index({ diagnosticCenterId: 1, date: 1, isEnabled: 1 });

const DateSerialSettings = mongoose.model('DateSerialSettings', dateSerialSettingsSchema);

export default DateSerialSettings;


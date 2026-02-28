import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'appointment_created',
      'appointment_accepted',
      'appointment_rejected',
      'appointment_cancelled',
      'appointment_rescheduled',
      'appointment_reminder_24h',
      'appointment_reminder_1h',
      'prescription_ready',
      'order_created',
      'order_status_update',
      'report_ready',
      'verification_approved',
      'verification_rejected',
      'test_serial_booking',
      'broadcast'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId
  },
  relatedType: {
    type: String,
    enum: ['appointment', 'order', 'prescription', 'user', 'test_booking', 'none']
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;


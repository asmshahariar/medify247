import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actorRole: {
    type: String,
    enum: ['super_admin', 'hospital_admin'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['doctor', 'hospital', 'diagnostic_center', 'user'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },
  action: {
    type: String,
    enum: ['approve', 'reject', 'suspend', 'create', 'update', 'delete', 'activate', 'deactivate', 'block'],
    required: true
  },
  reason: {
    type: String
  },
  previousStatus: {
    type: String
  },
  newStatus: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
approvalSchema.index({ targetType: 1, targetId: 1 });
approvalSchema.index({ actorId: 1, timestamp: -1 });
approvalSchema.index({ timestamp: -1 });

const Approval = mongoose.model('Approval', approvalSchema);

export default Approval;


import mongoose from 'mongoose';

const accessRequestSchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'expired', 'revoked'],
      default: 'pending',
      index: true,
    },
    requested_at: {
      type: Date,
      default: Date.now,
    },
    approved_at: {
      type: Date,
      default: null,
    },
    expires_at: {
      type: Date,
      default: null,
      index: true,
    },
    duration_days: {
      type: Number,
      default: 7,
    },
    admin_notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound index for finding active requests quickly
accessRequestSchema.index({ customer_id: 1, status: 1, expires_at: 1 });

export const AccessRequest = mongoose.model('AccessRequest', accessRequestSchema);

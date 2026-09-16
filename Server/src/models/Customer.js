import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'expired', 'rejected', 'blocked'],
      default: 'pending',
    },
    access_token: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

customerSchema.index({ status: 1 });

export const Customer = mongoose.model('Customer', customerSchema);

import mongoose from 'mongoose';

const enquirySchema = new mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    customer_name: {
      type: String,
      required: true,
      trim: true,
    },
    customer_mobile: {
      type: String,
      required: true,
      trim: true,
    },
    product_name: {
      type: String,
      required: true,
      trim: true,
    },
    product_code: {
      type: String,
      default: '',
      trim: true,
    },
    product_image: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: 'I am interested in this product and would like to receive pricing and availability details.',
      trim: true,
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'converted', 'closed'],
      default: 'new',
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

enquirySchema.index({ customer_id: 1, created_at: -1 });

export const Enquiry = mongoose.model('Enquiry', enquirySchema);

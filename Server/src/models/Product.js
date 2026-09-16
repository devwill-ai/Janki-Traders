import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    product_code: {
      type: String,
      required: [true, 'Product code is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    visibility: {
      type: String,
      enum: ['public', 'restricted'],
      default: 'public',
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Compound indexes for optimal retrieval speed
productSchema.index({ visibility: 1, status: 1 });
productSchema.index({ category_id: 1, visibility: 1, status: 1 });
productSchema.index({ featured: 1, visibility: 1, status: 1 });
productSchema.index({ name: 'text', description: 'text', product_code: 'text' });

export const Product = mongoose.model('Product', productSchema);

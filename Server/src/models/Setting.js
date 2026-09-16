import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    company_name: {
      type: String,
      default: 'Janki Traders',
      trim: true,
    },
    tagline: {
      type: String,
      default: 'Premium Architectural & Waterproof Doors',
      trim: true,
    },
    default_access_duration_days: {
      type: Number,
      default: 7,
      min: 1,
      max: 90,
    },
    whatsapp_number: {
      type: String,
      default: '+919876543210',
      trim: true,
    },
    contact_number: {
      type: String,
      default: '+919876543210',
      trim: true,
    },
    email: {
      type: String,
      default: 'info@jankitraders.com',
      trim: true,
    },
    address: {
      type: String,
      default: 'Plot No. 42, Timber & Architectural Market, Ring Road, Ahmedabad, Gujarat 380001',
      trim: true,
    },
    google_maps_url: {
      type: String,
      default: 'https://maps.google.com/?q=Janki+Traders+Ahmedabad',
      trim: true,
    },
    business_hours: {
      type: String,
      default: 'Monday - Saturday: 9:30 AM to 8:00 PM (Sunday Closed)',
      trim: true,
    },
    about_text: {
      type: String,
      default: 'Janki Traders is a leading distributor and wholesaler of high-end architectural doors. From 100% waterproof FRP & WPC doors to artisanal solid teak and contemporary frosted glass doors, we provide high-grade doors for residences, commercial spaces, and builders.',
      trim: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

export const Setting = mongoose.model('Setting', settingSchema);

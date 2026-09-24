import express from 'express';
import { Setting } from '../models/Setting.js';

const router = express.Router();

// Public store settings
router.get('/', async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting();
      await settings.save();
    }

    res.json({
      success: true,
      data: {
        company_name: settings.company_name,
        tagline: settings.tagline,
        whatsapp_number: settings.whatsapp_number,
        contact_number: settings.contact_number,
        email: settings.email,
        address: settings.address,
        gst_number: settings.gst_number || '24QRCPS1308N1ZA',
        google_maps_url: settings.google_maps_url,
        business_hours: settings.business_hours,
        about_text: settings.about_text,
        default_access_duration_days: settings.default_access_duration_days,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

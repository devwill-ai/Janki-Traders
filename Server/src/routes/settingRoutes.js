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
    } else {
      let modified = false;
      if (!settings.address || settings.address.includes('Plot No. 42')) {
        settings.address = 'Plot no. 5205, Trapaj Road, b/h Honda Showroom, Alang, Bhavnagar, Gujarat';
        modified = true;
      }
      if (!settings.email || settings.email === 'info@jankitraders.com') {
        settings.email = 'parthsabhadiya80@gmail.com';
        modified = true;
      }
      if (!settings.gst_number) {
        settings.gst_number = '24QRCPS1308N1ZA';
        modified = true;
      }
      if (modified) {
        await settings.save();
      }
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

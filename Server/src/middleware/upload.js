import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Store files temporarily in memory for Sharp processing
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/avif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WEBP, AVIF) are allowed.'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit (Sharp will compress to ~100KB)
  },
});

/**
 * Middleware: Process uploaded image(s) with Sharp
 * - Auto-rotates based on EXIF data
 * - Resizes to max 1600x1600 (aspect ratio preserved, no upscaling)
 * - Converts to optimized .webp format with quality 80
 * - Saves directly to Server/uploads/
 * - Sets file.filename for backward compatibility with controllers
 */
export const optimizeImages = async (req, res, next) => {
  try {
    const processFile = async (file) => {
      if (!file || !file.buffer) return;

      const ext = path.extname(file.originalname).toLowerCase();
      const safeBaseName =
        path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30) || 'img';
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
      const filename = `${safeBaseName}-${uniqueSuffix}.webp`;
      const outputPath = path.join(uploadDir, filename);

      await sharp(file.buffer)
        .rotate()
        .resize({
          width: 1600,
          height: 1600,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80, effort: 4 })
        .toFile(outputPath);

      file.filename = filename;
      file.path = outputPath;
      file.mimetype = 'image/webp';
    };

    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      await Promise.all(req.files.map(processFile));
    } else if (req.file) {
      await processFile(req.file);
    }

    next();
  } catch (error) {
    next(error);
  }
};


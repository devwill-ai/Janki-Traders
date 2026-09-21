import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '../../uploads');

/**
 * Safely delete an uploaded file from Server/uploads/
 * Protects against path traversal by ensuring target path is strictly within uploadsDir.
 * Silently ignores external URLs (e.g. unsplash) or missing files.
 * @param {string} fileUrl - Relative URL like "/uploads/filename.webp"
 */
export const deleteUploadedFile = (fileUrl) => {
  if (!fileUrl || typeof fileUrl !== 'string') return;

  // Only process local /uploads/ files
  if (!fileUrl.startsWith('/uploads/')) return;

  const filename = path.basename(fileUrl);
  // Do not delete hidden/system files like .gitkeep
  if (!filename || filename.startsWith('.')) return;

  const targetPath = path.resolve(uploadsDir, filename);

  // Path traversal guard: ensure resolved path is strictly inside uploadsDir
  if (!targetPath.startsWith(uploadsDir)) {
    console.warn(`[File Safety] Blocked path traversal attempt: ${fileUrl}`);
    return;
  }

  fs.unlink(targetPath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.warn(`[File Cleanup Warning] Could not remove old file: ${targetPath}`, err.message);
    }
  });
};

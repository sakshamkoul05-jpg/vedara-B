import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { authenticate, authorize } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import { validateFileType } from '../utils/security';
import { AppError } from '../middleware/errorHandler';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!validateFileType(file.mimetype)) {
      cb(new AppError('Invalid file type. Allowed: JPEG, PNG, WebP, AVIF, PDF', 400));
      return;
    }
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.pdf'];
    if (!allowedExts.includes(ext)) {
      cb(new AppError('Invalid file extension', 400));
      return;
    }
    cb(null, true);
  },
});

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const router = Router();

router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'MANAGER'),
  (req: any, res: any, next: any) => {
    upload.single('file')(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ success: false, error: 'File too large. Maximum 5MB.' });
          }
          if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ success: false, error: 'Only one file allowed.' });
          }
        }
        return next(err);
      }
      next();
    });
  },
  async (req: any, res: any, next: any) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded.' });
      }

      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'vedara',
        resource_type: 'auto',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'pdf'],
      });

      await fs.unlink(req.file.path).catch(() => {});

      res.json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        },
      });
    } catch (error) {
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  },
);

router.delete(
  '/:publicId',
  authenticate,
  authorize('SUPER_ADMIN', 'MANAGER'),
  async (req: any, res: any, next: any) => {
    try {
      const result = await cloudinary.uploader.destroy(req.params.publicId);
      if (result.result === 'not found') {
        return res.status(404).json({ success: false, error: 'File not found.' });
      }
      res.json({ success: true, message: 'File deleted.' });
    } catch (error) {
      next(error);
    }
  },
);

export default router;

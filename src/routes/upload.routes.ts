import { Router } from 'express';
import multer from 'multer';
import { authenticate, authorize } from '../middleware/auth';
import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';

const upload = multer({ dest: 'uploads/', limits: { fileSize: 5 * 1024 * 1024 } });

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

const router = Router();

router.post('/', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), upload.single('file'), async (req: any, res: any, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'vedara',
      resource_type: 'auto',
    });

    res.json({
      success: true,
      data: { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height },
    });
  } catch (error) { next(error); }
});

router.delete('/:publicId', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: any, res: any, next) => {
  try {
    await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

export default router;

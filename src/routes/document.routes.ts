import { Router } from 'express';
import { documentService } from '../services/document.service';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const docs = await documentService.getAll(req.query.category as string);
    res.json({ success: true, data: docs });
  } catch (error) { next(error); }
});

router.get('/categories', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const categories = await documentService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
});

router.get('/expiring', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const docs = await documentService.getExpiring(days);
    res.json({ success: true, data: docs });
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const doc = await documentService.create({ ...req.body, uploadedBy: req.user?.userId });
    res.status(201).json({ success: true, data: doc });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const doc = await documentService.update(req.params.id, req.body);
    res.json({ success: true, data: doc });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req: AuthRequest, res, next) => {
  try {
    await documentService.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

export default router;

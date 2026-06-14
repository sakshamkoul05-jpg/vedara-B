import { Router } from 'express';
import { cafeInventoryService } from '../services/cafeInventory.service';
import { authenticate, authorize } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), async (req: AuthRequest, res, next) => {
  try {
    const items = await cafeInventoryService.getAll(req.query.category as string);
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

router.get('/low-stock', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), async (req: AuthRequest, res, next) => {
  try {
    const items = await cafeInventoryService.getLowStock();
    res.json({ success: true, data: items });
  } catch (error) { next(error); }
});

router.get('/categories', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const categories = await cafeInventoryService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const item = await cafeInventoryService.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const item = await cafeInventoryService.update(req.params.id, req.body);
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.post('/:id/restock', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), async (req: AuthRequest, res, next) => {
  try {
    const { quantity } = req.body;
    const item = await cafeInventoryService.restock(req.params.id, quantity, req.user?.userId);
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.post('/:id/deduct', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), async (req: AuthRequest, res, next) => {
  try {
    const { quantity, reason } = req.body;
    const item = await cafeInventoryService.deduct(req.params.id, quantity, reason, req.user?.userId);
    res.json({ success: true, data: item });
  } catch (error) { next(error); }
});

router.get('/:id/logs', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    const logs = await cafeInventoryService.getLogs(req.params.id);
    res.json({ success: true, data: logs });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req: AuthRequest, res, next) => {
  try {
    await cafeInventoryService.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

export default router;

import { Router } from 'express';
import { propertyService } from '../services/property.service';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const properties = await propertyService.getAll();
    res.json({ success: true, data: properties });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const property = await propertyService.getById(req.params.id);
    res.json({ success: true, data: property });
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const property = await propertyService.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const property = await propertyService.update(req.params.id, req.body);
    res.json({ success: true, data: property });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    await propertyService.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

export default router;

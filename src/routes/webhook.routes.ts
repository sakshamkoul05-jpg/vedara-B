import { Router } from 'express';
import { webhookService } from '../services/webhook.service';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const webhooks = await webhookService.getAll();
    res.json({ success: true, data: webhooks });
  } catch (error) { next(error); }
});

router.post('/', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const webhook = await webhookService.create(req.body);
    res.status(201).json({ success: true, data: webhook });
  } catch (error) { next(error); }
});

router.put('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const webhook = await webhookService.update(req.params.id, req.body);
    res.json({ success: true, data: webhook });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    await webhookService.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

router.get('/:id/deliveries', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const deliveries = await webhookService.getDeliveries(req.params.id);
    res.json({ success: true, data: deliveries });
  } catch (error) { next(error); }
});

router.post('/test', authenticate, authorize('SUPER_ADMIN'), async (req, res, next) => {
  try {
    const { event, payload } = req.body;
    const deliveries = await webhookService.trigger(event, payload || { test: true });
    res.json({ success: true, data: deliveries });
  } catch (error) { next(error); }
});

export default router;

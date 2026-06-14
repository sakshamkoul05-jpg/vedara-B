import { Router } from 'express';
import { dynamicPricingService } from '../services/dynamicPricing.service';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/rules', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const rules = await dynamicPricingService.getRules();
    res.json({ success: true, data: rules });
  } catch (error) { next(error); }
});

router.post('/rules', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const rule = await dynamicPricingService.createRule(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) { next(error); }
});

router.put('/rules/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const rule = await dynamicPricingService.updateRule(req.params.id, req.body);
    res.json({ success: true, data: rule });
  } catch (error) { next(error); }
});

router.delete('/rules/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    await dynamicPricingService.deleteRule(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

router.post('/calculate', async (req, res, next) => {
  try {
    const { basePrice, checkIn, checkOut, nights } = req.body;
    const result = await dynamicPricingService.calculatePrice(basePrice, new Date(checkIn), new Date(checkOut), nights);
    res.json({ success: true, data: result });
  } catch (error) { next(error); }
});

export default router;

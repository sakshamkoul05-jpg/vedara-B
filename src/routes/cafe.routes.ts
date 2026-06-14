import { Router } from 'express';
import { cafeController } from '../controllers/cafe.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCafeOrderSchema, updateOrderStatusSchema, addCategorySchema, addItemSchema } from '../validators/cafe.validator';
import { bookingLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/menu', cafeController.getMenu);
router.post('/orders', bookingLimiter, validate(createCafeOrderSchema), cafeController.createOrder);
router.get('/orders', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.getOrders);
router.get('/kitchen', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.getKitchenOrders);
router.put('/orders/:id/status', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), validate(updateOrderStatusSchema), cafeController.updateOrderStatus);

router.post('/categories', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), validate(addCategorySchema), cafeController.addCategory);
router.post('/items', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), validate(addItemSchema), cafeController.addItem);
router.put('/items/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.updateItem);

router.get('/analytics/daily', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.getDailySales);
router.get('/analytics/monthly', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.getMonthlySales);
router.get('/analytics/top-items', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.getTopItems);
router.get('/analytics/sales-chart', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.getSalesChart);

export default router;

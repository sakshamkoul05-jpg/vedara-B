import { Router } from 'express';
import { cafeController } from '../controllers/cafe.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/menu', cafeController.getMenu);
router.post('/orders', cafeController.createOrder);
router.get('/orders', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.getOrders);
router.get('/kitchen', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.getKitchenOrders);
router.put('/orders/:id/status', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'CAFE_STAFF'), cafeController.updateOrderStatus);

router.post('/categories', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), cafeController.addCategory);
router.post('/items', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), cafeController.addItem);
router.put('/items/:id', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), cafeController.updateItem);

export default router;

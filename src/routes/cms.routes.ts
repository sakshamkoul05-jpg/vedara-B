import { Router } from 'express';
import { cmsController } from '../controllers/cms.controller';
import { authenticate, authorize } from '../middleware/auth';
import { contactController } from '../controllers/contact.controller';

const router = Router();

router.use(authenticate, authorize('SUPER_ADMIN', 'MANAGER'));

router.get('/dashboard', cmsController.getDashboard);

router.get('/settings', cmsController.getSettings);
router.put('/settings', cmsController.updateSetting);

router.get('/cottages', cmsController.getCottages);
router.put('/cottages/:id', cmsController.updateCottage);

router.get('/gallery', cmsController.getGallery);
router.post('/gallery', cmsController.addGalleryItem);
router.delete('/gallery/:id', cmsController.deleteGalleryItem);

router.get('/testimonials', cmsController.getTestimonials);
router.post('/testimonials', cmsController.addTestimonial);

router.get('/faqs', cmsController.getFAQs);
router.post('/faqs', cmsController.addFAQ);

router.get('/messages', cmsController.getContactMessages);
router.put('/messages/:id/read', contactController.markRead);

router.get('/coupons', cmsController.getCoupons);
router.post('/coupons', cmsController.createCoupon);

router.get('/activity-logs', cmsController.getActivityLogs);

router.get('/users', cmsController.getUsers);

export default router;

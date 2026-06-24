import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { cmsController } from '../controllers/cms.controller';
import { authenticate, authorize } from '../middleware/auth';
import { contactController } from '../controllers/contact.controller';
import { validate } from '../middleware/validate';
import { updateSettingSchema, addGallerySchema, addTestimonialSchema, addFAQSchema, createCouponSchema } from '../validators/cms.validator';

const prisma = new PrismaClient();
const router = Router();

router.get('/coupons/active', cmsController.getActiveCoupons);
router.post('/coupons/validate', cmsController.validateCouponCode);

router.get('/public-settings', async (_req, res) => {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { key: { in: ['aiPlannerEnabled', 'chatbotEnabled'] } },
    });
    const result = settings.reduce((acc: Record<string, string>, s: any) => ({ ...acc, [s.key]: s.value }), {});
    res.json({ success: true, data: result });
  } catch {
    res.json({ success: true, data: {} });
  }
});

router.get('/faqs/public', async (_req, res) => {
  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { order: 'asc' } });
    res.json({ success: true, data: faqs });
  } catch {
    res.json({ success: true, data: [] });
  }
});

router.use(authenticate, authorize('SUPER_ADMIN', 'MANAGER'));

router.get('/dashboard', cmsController.getDashboard);

router.get('/settings', cmsController.getSettings);
router.put('/settings', validate(updateSettingSchema), cmsController.updateSetting);

router.get('/cottages', cmsController.getCottages);
router.post('/cottages', cmsController.createCottage);
router.put('/cottages/:id', cmsController.updateCottage);
router.delete('/cottages/:id', cmsController.deleteCottage);

router.get('/gallery', cmsController.getGallery);
router.post('/gallery', validate(addGallerySchema), cmsController.addGalleryItem);
router.delete('/gallery/:id', cmsController.deleteGalleryItem);

router.get('/testimonials', cmsController.getTestimonials);
router.post('/testimonials', validate(addTestimonialSchema), cmsController.addTestimonial);
router.put('/testimonials/:id', cmsController.updateTestimonial);
router.delete('/testimonials/:id', cmsController.deleteTestimonial);

router.get('/faqs', cmsController.getFAQs);
router.post('/faqs', validate(addFAQSchema), cmsController.addFAQ);
router.put('/faqs/:id', cmsController.updateFAQ);
router.delete('/faqs/:id', cmsController.deleteFAQ);

router.get('/messages', cmsController.getContactMessages);
router.put('/messages/:id/read', contactController.markRead);

router.get('/coupons', cmsController.getCoupons);
router.post('/coupons', validate(createCouponSchema), cmsController.createCoupon);
router.put('/coupons/:id', cmsController.updateCoupon);
router.delete('/coupons/:id', cmsController.deleteCoupon);

router.get('/activity-logs', cmsController.getActivityLogs);

router.get('/users', cmsController.getUsers);

router.get('/staff', cmsController.getStaff);
router.post('/staff', cmsController.createStaff);
router.put('/staff/:id', cmsController.updateStaff);
router.post('/staff/:id/fire', cmsController.fireStaff);
router.post('/staff/:id/hire', cmsController.hireStaff);
router.delete('/staff/:id', cmsController.deleteStaff);

router.get('/packages', cmsController.getPackages);
router.post('/packages', cmsController.createPackage);
router.put('/packages/:id', cmsController.updatePackage);
router.delete('/packages/:id', cmsController.deletePackage);

export default router;

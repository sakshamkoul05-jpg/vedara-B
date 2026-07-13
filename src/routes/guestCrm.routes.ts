import { Router } from 'express';
import { guestCrmService } from '../services/guestCrm.service';
import { authenticate, authorize } from '../middleware/auth';
import { contactLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/stats', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const stats = await guestCrmService.getGuestStats();
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
});

router.get('/leaderboard', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const leaderboard = await guestCrmService.getLeaderboard(limit);
    res.json({ success: true, data: leaderboard });
  } catch (error) { next(error); }
});

router.get('/:guestId', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const profile = await guestCrmService.getProfile(req.params.guestId);
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
});

router.put('/:guestId', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const profile = await guestCrmService.updateProfile(req.params.guestId, req.body);
    res.json({ success: true, data: profile });
  } catch (error) { next(error); }
});

router.post('/:guestId/loyalty/add', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { points, type, description, bookingId } = req.body;
    const transaction = await guestCrmService.addLoyaltyPoints(req.params.guestId, points, type, description, bookingId);
    res.json({ success: true, data: transaction });
  } catch (error) { next(error); }
});

router.post('/:guestId/loyalty/redeem', authenticate, authorize('SUPER_ADMIN', 'MANAGER'), async (req, res, next) => {
  try {
    const { points, description } = req.body;
    const transaction = await guestCrmService.redeemPoints(req.params.guestId, points, description);
    res.json({ success: true, data: transaction });
  } catch (error) { next(error); }
});

router.post('/referral', contactLimiter, async (req, res, next) => {
  try {
    const { refereeEmail, refereeName, referrerCode } = req.body;
    const result = await guestCrmService.processReferral(refereeEmail, refereeName, referrerCode);
    res.json(result);
  } catch (error) { next(error); }
});

export default router;

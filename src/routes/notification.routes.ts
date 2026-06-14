import { Router } from 'express';
import { notificationService } from '../services/notification.service';
import { authenticate } from '../middleware/auth';
import { AuthRequest } from '../types';

const router = Router();

router.get('/', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await notificationService.getAll(req.user?.userId, unreadOnly);
    res.json({ success: true, data: notifications });
  } catch (error) { next(error); }
});

router.get('/unread-count', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const count = await notificationService.getUnreadCount(req.user?.userId);
    res.json({ success: true, data: { count } });
  } catch (error) { next(error); }
});

router.put('/:id/read', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    res.json({ success: true, data: notification });
  } catch (error) { next(error); }
});

router.put('/read-all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user?.userId);
    res.json({ success: true, message: 'All marked as read' });
  } catch (error) { next(error); }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await notificationService.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

export default router;

import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import prisma from '../config/database';

const router = Router();

router.get('/conversations', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 1 } },
    });
    res.json({ success: true, data: conversations });
  } catch (error) { next(error); }
});

router.get('/conversations/history', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const conversations = await prisma.chatConversation.findMany({
      where: { status: 'CLOSED' },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, data: conversations });
  } catch (error) { next(error); }
});

router.get('/conversations/:id/messages', authenticate, authorize('SUPER_ADMIN', 'MANAGER', 'RECEPTIONIST'), async (req, res, next) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { conversationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ success: true, data: messages });
  } catch (error) { next(error); }
});

export default router;
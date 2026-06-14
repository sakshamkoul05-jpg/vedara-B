import { Router } from 'express';
import { chatbotController } from '../controllers/chatbot.controller';
import { apiLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/chat', apiLimiter, chatbotController.chat);

export default router;

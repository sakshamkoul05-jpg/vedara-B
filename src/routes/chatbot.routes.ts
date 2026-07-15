import { Router } from 'express';
import { chatbotController } from '../controllers/chatbot.controller';
import { chatbotLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/chat', chatbotLimiter, chatbotController.chat);

export default router;

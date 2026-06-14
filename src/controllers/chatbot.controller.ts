import { Request, Response, NextFunction } from 'express';
import { chatbotService } from '../services/chatbot.service';

export const chatbotController = {
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }
      if (message.length > 500) {
        return res.status(400).json({ success: false, error: 'Message too long (max 500 characters)' });
      }
      const sanitizedMessage = message.replace(/[<>]/g, '').trim();
      const safeHistory = Array.isArray(history) ? history.slice(-10) : [];
      const reply = await chatbotService.chat(sanitizedMessage, safeHistory);
      res.json({ success: true, data: { reply } });
    } catch (error) { next(error); }
  },
};

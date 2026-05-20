import { Request, Response, NextFunction } from 'express';
import { chatbotService } from '../services/chatbot.service';

export const chatbotController = {
  async chat(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ success: false, error: 'Message is required' });
      }
      const reply = await chatbotService.chat(message, history || []);
      res.json({ success: true, data: { reply } });
    } catch (error) { next(error); }
  },
};

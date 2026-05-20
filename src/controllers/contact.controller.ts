import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const contactController = {
  async submit(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, phone, subject, message } = req.body;
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Name, email, subject, and message are required' });
      }
      const contact = await prisma.contactMessage.create({
        data: { name, email, phone, subject, message },
      });
      res.status(201).json({ success: true, data: contact });
    } catch (error) { next(error); }
  },

  async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const contact = await prisma.contactMessage.update({
        where: { id: req.params.id },
        data: { isRead: true },
      });
      res.json({ success: true, data: contact });
    } catch (error) { next(error); }
  },

  async deleteMessage(req: Request, res: Response, next: NextFunction) {
    try {
      await prisma.contactMessage.delete({ where: { id: req.params.id } });
      res.json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
  },
};

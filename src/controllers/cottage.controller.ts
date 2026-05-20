import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export const cottageController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const cottages = await prisma.cottage.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      });
      res.json({ success: true, data: cottages });
    } catch (error) { next(error); }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const cottage = await prisma.cottage.findUnique({
        where: { slug: req.params.slug },
        include: {
          seasonalPricings: { where: { isActive: true } },
        },
      });
      if (!cottage) {
        return res.status(404).json({ success: false, error: 'Cottage not found' });
      }
      res.json({ success: true, data: cottage });
    } catch (error) { next(error); }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const cottage = await prisma.cottage.findUnique({
        where: { id: req.params.id },
        include: {
          seasonalPricings: { where: { isActive: true } },
        },
      });
      if (!cottage) {
        return res.status(404).json({ success: false, error: 'Cottage not found' });
      }
      res.json({ success: true, data: cottage });
    } catch (error) { next(error); }
  },
};

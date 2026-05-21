import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { cmsService } from '../services/cms.service';
import prisma from '../config/database';

export const cmsController = {
  async getSettings(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const settings = await prisma.siteSetting.findMany();
      const result = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  async updateSetting(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { key, value } = req.body;
      const setting = await cmsService.upsertSetting(key, value);
      res.json({ success: true, data: setting });
    } catch (error) { next(error); }
  },

  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const stats = await cmsService.getDashboardStats();
      res.json({ success: true, data: stats });
    } catch (error) { next(error); }
  },

  async getGallery(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const gallery = await cmsService.getGallery();
      res.json({ success: true, data: gallery });
    } catch (error) { next(error); }
  },

  async addGalleryItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await cmsService.addGalleryItem(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  },

  async deleteGalleryItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cmsService.deleteGalleryItem(req.params.id as string);
      res.json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
  },

  async getCottages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cottages = await prisma.cottage.findMany({ orderBy: { sortOrder: 'asc' } });
      res.json({ success: true, data: cottages });
    } catch (error) { next(error); }
  },

  async updateCottage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cottage = await prisma.cottage.update({
        where: { id: req.params.id as string },
        data: req.body,
      });
      res.json({ success: true, data: cottage });
    } catch (error) { next(error); }
  },

  async getTestimonials(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
      res.json({ success: true, data: testimonials });
    } catch (error) { next(error); }
  },

  async addTestimonial(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const testimonial = await cmsService.addTestimonial(req.body);
      res.status(201).json({ success: true, data: testimonial });
    } catch (error) { next(error); }
  },

  async updateTestimonial(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const testimonial = await cmsService.updateTestimonial(req.params.id as string, req.body);
      res.json({ success: true, data: testimonial });
    } catch (error) { next(error); }
  },

  async deleteTestimonial(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cmsService.deleteTestimonial(req.params.id as string);
      res.json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
  },

  async getFAQs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: 'asc' } });
      res.json({ success: true, data: faqs });
    } catch (error) { next(error); }
  },

  async addFAQ(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const faq = await cmsService.addFAQ(req.body);
      res.status(201).json({ success: true, data: faq });
    } catch (error) { next(error); }
  },

  async updateFAQ(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const faq = await cmsService.updateFAQ(req.params.id as string, req.body);
      res.json({ success: true, data: faq });
    } catch (error) { next(error); }
  },

  async deleteFAQ(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cmsService.deleteFAQ(req.params.id as string);
      res.json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
  },

  async getContactMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await cmsService.getContactMessages({
        page, limit,
        isRead: req.query.isRead !== undefined ? req.query.isRead === 'true' : undefined,
      });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  async getCoupons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await cmsService.getCoupons();
      res.json({ success: true, data: coupons });
    } catch (error) { next(error); }
  },

  async createCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await cmsService.createCoupon(req.body);
      res.status(201).json({ success: true, data: coupon });
    } catch (error) { next(error); }
  },

  async updateCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupon = await cmsService.updateCoupon(req.params.id as string, req.body);
      res.json({ success: true, data: coupon });
    } catch (error) { next(error); }
  },

  async validateCouponCode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { code, amount } = req.body;
      const result = await cmsService.validateCoupon(code, amount);
      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  },

  async getActivityLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await cmsService.getActivityLogs({ page, limit });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  async getUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: users });
    } catch (error) { next(error); }
  },
};

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
    } catch (error: any) {
      console.error('Dashboard error:', error?.message || error);
      next(error);
    }
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
      const allowedFields = ['name', 'slug', 'description', 'shortDesc', 'pricePerNight', 'capacity', 'bedrooms', 'bathrooms', 'size', 'category', 'amenities', 'images', 'heaterCharge', 'isActive', 'sortOrder'];
      const data: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) {
          if (key === 'amenities' || key === 'images') {
            data[key] = Array.isArray(req.body[key]) ? req.body[key] : [];
          } else {
            data[key] = req.body[key];
          }
        }
      }
      const cottage = await prisma.cottage.update({
        where: { id: req.params.id as string },
        data,
      });
      res.json({ success: true, data: cottage });
    } catch (error: any) {
      console.error('Update cottage error:', error?.message || error);
      next(error);
    }
  },

  async createCottage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { name, slug, description, shortDesc, pricePerNight, capacity, bedrooms, bathrooms, size, category, amenities, images, heaterCharge, sortOrder } = req.body;
      if (!name || !slug || !description || pricePerNight === undefined) {
        return res.status(400).json({ success: false, error: 'Name, slug, description, and price are required' });
      }
      const existing = await prisma.cottage.findUnique({ where: { slug } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'A cottage with this slug already exists' });
      }
      const cottage = await prisma.cottage.create({
        data: {
          name,
          slug,
          description,
          shortDesc: shortDesc || '',
          pricePerNight: parseInt(String(pricePerNight), 10),
          capacity: capacity ? parseInt(String(capacity), 10) : 2,
          bedrooms: bedrooms ? parseInt(String(bedrooms), 10) : 1,
          bathrooms: bathrooms ? parseInt(String(bathrooms), 10) : 1,
          size: size ? parseInt(String(size), 10) : null,
          category: category || null,
          amenities: Array.isArray(amenities) ? amenities : [],
          images: Array.isArray(images) ? images : [],
          heaterCharge: heaterCharge ? parseInt(String(heaterCharge), 10) : 600,
          sortOrder: sortOrder ? parseInt(String(sortOrder), 10) : 0,
        },
      });
      res.status(201).json({ success: true, data: cottage });
    } catch (error: any) {
      console.error('Create cottage error:', error?.message || error);
      next(error);
    }
  },

  async deleteCottage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const cottage = await prisma.cottage.findUnique({ where: { id: req.params.id as string } });
      if (!cottage) {
        return res.status(404).json({ success: false, error: 'Cottage not found' });
      }
      const hasBookings = await prisma.booking.findFirst({
        where: { cottageId: req.params.id, status: { notIn: ['CANCELLED', 'EXPIRED'] } },
      });
      if (hasBookings) {
        return res.status(409).json({ success: false, error: 'Cannot delete cottage with active bookings. Deactivate it instead.' });
      }
      await prisma.cottage.delete({ where: { id: req.params.id as string } });
      res.json({ success: true, message: 'Cottage deleted' });
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
      const allowedFields = ['name', 'content', 'rating', 'image', 'isVisible', 'sortOrder'];
      const data: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
      }
      const testimonial = await cmsService.updateTestimonial(req.params.id as string, data);
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
      const allowedFields = ['question', 'answer', 'category', 'isActive', 'sortOrder'];
      const data: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
      }
      const faq = await cmsService.updateFAQ(req.params.id as string, data);
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

  async getActiveCoupons(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const coupons = await prisma.coupon.findMany({
        where: { isActive: true, OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }] },
        select: { code: true, description: true, discountType: true, discountValue: true, voucherType: true, minAmount: true },
        orderBy: { createdAt: 'desc' },
      });
      res.json({ success: true, data: coupons });
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
      const allowedFields = ['code', 'description', 'discountType', 'discountValue', 'minAmount', 'maxUsage', 'maxUsesPerUser', 'voucherType', 'isActive', 'expiresAt'];
      const data: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
      }
      const coupon = await cmsService.updateCoupon(req.params.id as string, data);
      res.json({ success: true, data: coupon });
    } catch (error) { next(error); }
  },

  async deleteCoupon(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cmsService.deleteCoupon(req.params.id as string);
      res.json({ success: true, message: 'Deleted' });
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

  // Staff
  async getStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status, page, limit } = req.query;
      const result = await cmsService.getStaff({
        status: status as string,
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 50,
      });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  async createStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await cmsService.createStaff(req.body);
      res.status(201).json({ success: true, data: staff });
    } catch (error) { next(error); }
  },

  async updateStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const allowedFields = ['name', 'phone', 'role', 'salary', 'address', 'photo', 'status', 'employeeId'];
      const data: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
      }
      const staff = await cmsService.updateStaff(req.params.id as string, data);
      res.json({ success: true, data: staff });
    } catch (error) { next(error); }
  },

  async fireStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await cmsService.fireStaff(req.params.id as string);
      res.json({ success: true, data: staff });
    } catch (error) { next(error); }
  },

  async hireStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const staff = await cmsService.hireStaff(req.params.id as string);
      res.json({ success: true, data: staff });
    } catch (error) { next(error); }
  },

  async deleteStaff(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cmsService.deleteStaff(req.params.id as string);
      res.json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
  },

  // Packages
  async getPackages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const packages = await cmsService.getPackages();
      res.json({ success: true, data: packages });
    } catch (error) { next(error); }
  },

  async createPackage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const pkg = await cmsService.createPackage(req.body);
      res.status(201).json({ success: true, data: pkg });
    } catch (error) { next(error); }
  },

  async updatePackage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const allowedFields = ['title', 'description', 'image', 'link', 'startDate', 'endDate', 'isActive', 'sortOrder'];
      const data: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
      }
      const pkg = await cmsService.updatePackage(req.params.id as string, data);
      res.json({ success: true, data: pkg });
    } catch (error) { next(error); }
  },

  async deletePackage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await cmsService.deletePackage(req.params.id as string);
      res.json({ success: true, message: 'Deleted' });
    } catch (error) { next(error); }
  },
};

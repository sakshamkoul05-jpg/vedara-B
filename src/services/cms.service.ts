import prisma from '../config/database';

export class CmsService {
  // Site Settings
  async getSetting(key: string) {
    return prisma.siteSetting.findUnique({ where: { key } });
  }

  async upsertSetting(key: string, value: any) {
    return prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  // Gallery
  async getGallery() {
    return prisma.gallery.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  async addGalleryItem(data: { image: string; caption?: string; category?: string }) {
    return prisma.gallery.create({ data });
  }

  async deleteGalleryItem(id: string) {
    return prisma.gallery.delete({ where: { id } });
  }

  // Testimonials
  async getTestimonials() {
    return prisma.testimonial.findMany({ where: { isVisible: true }, orderBy: { sortOrder: 'asc' } });
  }

  async addTestimonial(data: { name: string; content: string; rating?: number; image?: string }) {
    return prisma.testimonial.create({ data });
  }

  async updateTestimonial(id: string, data: Partial<{ name: string; content: string; rating: number; image: string; isVisible: boolean; sortOrder: number }>) {
    return prisma.testimonial.update({ where: { id }, data });
  }

  async deleteTestimonial(id: string) {
    return prisma.testimonial.delete({ where: { id } });
  }

  // FAQs
  async getFAQs() {
    return prisma.fAQ.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });
  }

  async addFAQ(data: { question: string; answer: string; category?: string }) {
    return prisma.fAQ.create({ data });
  }

  async updateFAQ(id: string, data: Partial<{ question: string; answer: string; category: string; isActive: boolean; sortOrder: number }>) {
    return prisma.fAQ.update({ where: { id }, data });
  }

  async deleteFAQ(id: string) {
    return prisma.fAQ.delete({ where: { id } });
  }

  // Contact Messages
  async getContactMessages(params: { page: number; limit: number; isRead?: boolean }) {
    const where: any = {};
    if (params.isRead !== undefined) where.isRead = params.isRead;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.contactMessage.count({ where }),
    ]);

    return { messages, total, page: params.page, totalPages: Math.ceil(total / params.limit) };
  }

  // Coupons
  async getCoupons() {
    return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async createCoupon(data: {
    code: string; description?: string; discountType: string; discountValue: number;
    minAmount?: number; maxUsage?: number; expiresAt?: Date;
  }) {
    return prisma.coupon.create({ data });
  }

  async updateCoupon(id: string, data: Partial<{
    code: string; description: string; discountType: string; discountValue: number;
    minAmount: number; maxUsage: number; usedCount: number; isActive: boolean; expiresAt: Date;
  }>) {
    return prisma.coupon.update({ where: { id }, data });
  }

  async deleteCoupon(id: string) {
    return prisma.coupon.delete({ where: { id } });
  }

  async validateCoupon(code: string, amount: number) {
    const coupon = await prisma.coupon.findUnique({ where: { code } });
    if (!coupon) throw new Error('Invalid coupon code');
    if (!coupon.isActive) throw new Error('Coupon is inactive');
    if (coupon.expiresAt && new Date() > coupon.expiresAt) throw new Error('Coupon has expired');
    if (coupon.maxUsage > 0 && coupon.usedCount >= coupon.maxUsage) throw new Error('Coupon usage limit reached');
    if (amount < coupon.minAmount) throw new Error(`Minimum order amount is ₹${coupon.minAmount}`);

    const discount = coupon.discountType === 'PERCENTAGE'
      ? (amount * coupon.discountValue) / 100
      : coupon.discountValue;

    return { coupon, discount, finalAmount: Math.max(0, amount - discount) };
  }

  // Dashboard Stats
  async getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalBookings, monthlyBookings, yearlyRevenue,
      totalCottages, activeCottages, pendingBookings,
      totalCafeOrders, todayCafeOrders, totalMessages,
      totalGuests
    ] = await Promise.all([
      prisma.booking.count(),
      prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.booking.aggregate({
        where: { status: 'CONFIRMED', createdAt: { gte: startOfYear } },
        _sum: { finalAmount: true },
      }),
      prisma.cottage.count(),
      prisma.cottage.count({ where: { isActive: true } }),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.cafeOrder.count(),
      prisma.cafeOrder.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.contactMessage.count({ where: { isRead: false } }),
      prisma.guest.count(),
    ]);

    return {
      totalBookings,
      monthlyBookings,
      yearlyRevenue: yearlyRevenue._sum.finalAmount || 0,
      totalCottages,
      activeCottages,
      pendingBookings,
      totalCafeOrders,
      todayCafeOrders,
      unreadMessages: totalMessages,
      totalGuests,
    };
  }

  // Activity Log
  async getActivityLogs(params: { page: number; limit: number }) {
    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.activityLog.count(),
    ]);

    return { logs, total, page: params.page, totalPages: Math.ceil(total / params.limit) };
  }

  async logActivity(data: { userId?: string; action: string; entity?: string; entityId?: string; details?: any; ipAddress?: string }) {
    return prisma.activityLog.create({ data });
  }
}

export const cmsService = new CmsService();

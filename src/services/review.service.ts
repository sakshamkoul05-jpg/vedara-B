import prisma from '../config/database';

export class ReviewService {
  async getAll(visibleOnly = true) {
    const where: any = {};
    if (visibleOnly) where.isVisible = true;
    return prisma.review.findMany({
      where,
      include: { guestProfile: { include: { guest: { select: { name: true } } } }, cottage: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: { guestId: string; bookingId?: string; cottageId?: string; rating: number; title?: string; content?: string; pros?: string; cons?: string; source?: string }) {
    return prisma.review.create({ data });
  }

  async reply(id: string, adminReply: string) {
    return prisma.review.update({
      where: { id },
      data: { adminReply, repliedAt: new Date() },
    });
  }

  async toggleVisibility(id: string) {
    const review = await prisma.review.findUnique({ where: { id } });
    return prisma.review.update({
      where: { id },
      data: { isVisible: !review?.isVisible },
    });
  }

  async delete(id: string) {
    return prisma.review.delete({ where: { id } });
  }

  async getStats() {
    const [total, avg, distribution] = await Promise.all([
      prisma.review.count({ where: { isVisible: true } }),
      prisma.review.aggregate({ _avg: { rating: true }, where: { isVisible: true } }),
      prisma.review.groupBy({ by: ['rating'], _count: true, where: { isVisible: true } }),
    ]);
    return { total, average: avg._avg.rating || 0, distribution };
  }
}

export const reviewService = new ReviewService();

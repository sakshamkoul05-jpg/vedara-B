import prisma from '../config/database';

export class DocumentService {
  async getAll(category?: string) {
    const where: any = {};
    if (category) where.category = category;
    return prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  async create(data: { name: string; category: string; fileUrl: string; fileType: string; fileSize?: number; description?: string; expiresAt?: Date; uploadedBy?: string }) {
    return prisma.document.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.document.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.document.delete({ where: { id } });
  }

  async getExpiring(days = 30) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return prisma.document.findMany({
      where: { expiresAt: { lte: cutoff, gte: new Date() } },
      orderBy: { expiresAt: 'asc' },
    });
  }

  async getCategories() {
    const result = await prisma.document.groupBy({ by: ['category'], _count: true });
    return result.map(r => ({ category: r.category, count: r._count }));
  }
}

export const documentService = new DocumentService();

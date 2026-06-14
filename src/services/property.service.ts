import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class PropertyService {
  async getAll() {
    return prisma.property.findMany({
      where: { isActive: true },
      include: { _count: { select: { cottages: true, staff: true, bookings: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async getById(id: string) {
    return prisma.property.findUnique({
      where: { id },
      include: { cottages: { orderBy: { sortOrder: 'asc' } }, _count: { select: { staff: true } } },
    });
  }

  async create(data: { name: string; slug: string; description?: string; address?: string; phone?: string; email?: string }) {
    return prisma.property.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.property.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.property.delete({ where: { id } });
  }
}

export const propertyService = new PropertyService();

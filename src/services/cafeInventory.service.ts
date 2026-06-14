import prisma from '../config/database';

export class CafeInventoryService {
  async getAll(category?: string) {
    const where: any = { isActive: true };
    if (category) where.category = category;
    return prisma.cafeInventory.findMany({ where, orderBy: { name: 'asc' } });
  }

  async getLowStock() {
    return prisma.cafeInventory.findMany({
      where: { isActive: true, quantity: { lte: prisma.cafeInventory.fields.minStock } },
      orderBy: { quantity: 'asc' },
    });
  }

  async create(data: { name: string; category: string; quantity: number; unit?: string; minStock?: number; costPerUnit?: number; supplier?: string }) {
    return prisma.cafeInventory.create({ data });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.cafeInventory.update({ where: { id }, data });
  }

  async restock(id: string, quantity: number, performedBy?: string) {
    const item = await prisma.cafeInventory.update({
      where: { id },
      data: { quantity: { increment: quantity }, lastRestocked: new Date() },
    });
    await prisma.cafeInventoryLog.create({
      data: { inventoryId: id, type: 'RESTOCK', quantity, reason: 'Restocked', performedBy },
    });
    return item;
  }

  async deduct(id: string, quantity: number, reason: string, performedBy?: string) {
    const item = await prisma.cafeInventory.findUnique({ where: { id } });
    if (!item || item.quantity < quantity) throw new Error('Insufficient stock');

    const updated = await prisma.cafeInventory.update({
      where: { id },
      data: { quantity: { decrement: quantity } },
    });
    await prisma.cafeInventoryLog.create({
      data: { inventoryId: id, type: 'DEDUCT', quantity, reason, performedBy },
    });
    return updated;
  }

  async getLogs(inventoryId: string, limit = 50) {
    return prisma.cafeInventoryLog.findMany({
      where: { inventoryId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getCategories() {
    const result = await prisma.cafeInventory.groupBy({ by: ['category'], _count: true, where: { isActive: true } });
    return result.map(r => ({ category: r.category, count: r._count }));
  }

  async delete(id: string) {
    return prisma.cafeInventory.update({ where: { id }, data: { isActive: false } });
  }
}

export const cafeInventoryService = new CafeInventoryService();

import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateOrderRef } from '../utils/helpers';

export class CafeService {
  async getMenu(showAll = false) {
    return prisma.cafeCategory.findMany({
      where: { isActive: true },
      include: {
        items: {
          ...(showAll ? {} : { where: { isAvailable: true } }),
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createOrder(data: {
    tableNumber: number;
    guestName?: string;
    notes?: string;
    items: { itemId: string; quantity: number; notes?: string }[];
  }) {
    return prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItems: any[] = [];

      for (const item of data.items) {
        const menuItem = await tx.cafeItem.findUnique({
          where: { id: item.itemId },
        });

        if (!menuItem || !menuItem.isAvailable) {
          throw new AppError(`Item ${item.itemId} is not available`, 400);
        }

        const unitPrice = menuItem.price;
        const totalPrice = unitPrice * item.quantity;
        totalAmount += totalPrice;

        orderItems.push({
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          notes: item.notes,
        });
      }

      const order = await tx.cafeOrder.create({
        data: {
          orderRef: generateOrderRef(),
          tableNumber: data.tableNumber,
          guestName: data.guestName,
          notes: data.notes,
          totalAmount,
          status: 'PENDING',
          items: { create: orderItems },
        },
        include: { items: { include: { item: true } } },
      });

      return order;
    });
  }

  async updateOrderStatus(orderId: string, status: string) {
    const order = await prisma.cafeOrder.update({
      where: { id: orderId },
      data: { status: status as any },
      include: { items: { include: { item: true } } },
    });
    return order;
  }

  async getOrders(params: { page: number; limit: number; status?: string }) {
    const where: any = {};
    if (params.status) where.status = params.status;

    const [orders, total] = await Promise.all([
      prisma.cafeOrder.findMany({
        where,
        include: { items: { include: { item: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.cafeOrder.count({ where }),
    ]);

    return { orders, total, page: params.page, totalPages: Math.ceil(total / params.limit) };
  }

  async getKitchenOrders() {
    return prisma.cafeOrder.findMany({
      where: { status: { in: ['PENDING', 'PREPARING'] } },
      include: { items: { include: { item: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async addCategory(data: { name: string; description?: string; image?: string }) {
    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    return prisma.cafeCategory.create({ data: { ...data, slug } });
  }

  async addItem(data: {
    categoryId: string;
    name: string;
    description?: string;
    price: number;
    image?: string;
    isVegetarian?: boolean;
  }) {
    return prisma.cafeItem.create({ data });
  }

  async updateItem(id: string, data: Partial<{
    name: string;
    description: string;
    price: number;
    image: string;
    isAvailable: boolean;
    isVegetarian: boolean;
  }>) {
    return prisma.cafeItem.update({ where: { id }, data });
  }

  async getDailySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await prisma.cafeOrder.findMany({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: today, lt: tomorrow },
      },
    });
    const total = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const count = orders.length;
    return { total, count, date: today.toISOString().split('T')[0] };
  }

  async getMonthlySales() {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const orders = await prisma.cafeOrder.findMany({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: start, lt: end },
      },
    });
    const total = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const count = orders.length;
    return { total, count, month: now.getMonth() + 1, year: now.getFullYear() };
  }

  async getTopItems(limit = 10) {
    const items = await prisma.cafeOrderItem.groupBy({
      by: ['itemId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit,
    });

    const itemIds = items.map(i => i.itemId);
    const menuItems = await prisma.cafeItem.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, name: true, price: true },
    });
    const itemMap = new Map(menuItems.map(i => [i.id, i]));

    return items.map(i => ({
      itemId: i.itemId,
      name: itemMap.get(i.itemId)?.name || 'Unknown',
      price: itemMap.get(i.itemId)?.price || 0,
      totalSold: i._sum.quantity || 0,
    }));
  }

  async getSalesChart(days = 7) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const orders = await prisma.cafeOrder.findMany({
      where: {
        status: 'DELIVERED',
        createdAt: { gte: start, lt: end },
      },
      select: { totalAmount: true, createdAt: true },
    });

    const dailyMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      dailyMap.set(d.toISOString().split('T')[0], 0);
    }
    for (const o of orders) {
      const key = o.createdAt.toISOString().split('T')[0];
      dailyMap.set(key, (dailyMap.get(key) || 0) + o.totalAmount);
    }
    return Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total }));
  }
}

export const cafeService = new CafeService();

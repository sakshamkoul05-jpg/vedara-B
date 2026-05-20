import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { generateOrderRef } from '../utils/helpers';

export class CafeService {
  async getMenu() {
    return prisma.cafeCategory.findMany({
      where: { isActive: true },
      include: {
        items: {
          where: { isAvailable: true },
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
}

export const cafeService = new CafeService();

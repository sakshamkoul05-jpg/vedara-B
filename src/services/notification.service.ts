import prisma from '../config/database';

export class NotificationService {
  async getAll(userId?: string, unreadOnly = false) {
    const where: any = {};
    if (userId) where.userId = userId;
    if (unreadOnly) where.isRead = false;
    return prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
  }

  async create(data: { userId?: string; type: string; title: string; message: string; data?: any }) {
    return prisma.notification.create({ data });
  }

  async markAsRead(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    return prisma.notification.update({ where, data: { isRead: true, readAt: new Date() } });
  }

  async markAllAsRead(userId?: string) {
    const where: any = { isRead: false };
    if (userId) where.userId = userId;
    return prisma.notification.updateMany({ where, data: { isRead: true, readAt: new Date() } });
  }

  async getUnreadCount(userId?: string) {
    const where: any = { isRead: false };
    if (userId) where.userId = userId;
    return prisma.notification.count({ where });
  }

  async delete(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    return prisma.notification.delete({ where });
  }
}

export const notificationService = new NotificationService();

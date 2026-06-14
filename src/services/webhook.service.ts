import prisma from '../config/database';
import crypto from 'crypto';

export class WebhookService {
  async getAll() {
    return prisma.webhook.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async create(data: { url: string; events: string[]; secret?: string }) {
    const secret = data.secret || crypto.randomBytes(32).toString('hex');
    return prisma.webhook.create({ data: { ...data, secret } });
  }

  async update(id: string, data: Record<string, unknown>) {
    return prisma.webhook.update({ where: { id }, data });
  }

  async delete(id: string) {
    return prisma.webhook.delete({ where: { id } });
  }

  async trigger(event: string, payload: unknown) {
    const webhooks = await prisma.webhook.findMany({
      where: { isActive: true },
    });

    const deliveries = [];
    for (const webhook of webhooks) {
      const events = webhook.events as string[];
      if (!events.includes(event) && !events.includes('*')) continue;

      const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
      const signature = webhook.secret
        ? crypto.createHmac('sha256', webhook.secret).update(body).digest('hex')
        : undefined;

      const delivery = await prisma.webhookDelivery.create({
        data: { webhookId: webhook.id, event, payload: payload as any },
      });

      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(signature ? { 'X-Webhook-Signature': signature } : {}),
            'X-Webhook-Event': event,
          },
          body,
          signal: AbortSignal.timeout(10000),
        });

        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: { statusCode: response.status, success: response.ok, deliveredAt: new Date(), attempts: 1 },
        });

        await prisma.webhook.update({
          where: { id: webhook.id },
          data: { lastTriggered: new Date(), failCount: 0 },
        });

        deliveries.push({ webhookId: webhook.id, success: true });
      } catch {
        await prisma.webhookDelivery.update({
          where: { id: delivery.id },
          data: { success: false, attempts: 1 },
        });
        await prisma.webhook.update({
          where: { id: webhook.id },
          data: { failCount: { increment: 1 } },
        });
        deliveries.push({ webhookId: webhook.id, success: false });
      }
    }

    return deliveries;
  }

  async getDeliveries(webhookId: string, limit = 50) {
    return prisma.webhookDelivery.findMany({
      where: { webhookId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const webhookService = new WebhookService();

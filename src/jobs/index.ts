import cron from 'node-cron';
import prisma from '../config/database';
import { logger } from '../utils/logger';

export function startCronJobs() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expired = await prisma.booking.updateMany({
        where: {
          status: 'PENDING',
          holdExpiresAt: { lte: new Date() },
        },
        data: { status: 'EXPIRED' },
      });

      if (expired.count > 0) {
        logger.info(`Expired ${expired.count} pending bookings`);
      }
    } catch (error) {
      logger.error('Cron job error (expire bookings)', { error });
    }
  });

  logger.info('Cron jobs initialized');
}

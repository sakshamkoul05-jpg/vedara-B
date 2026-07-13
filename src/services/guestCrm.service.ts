import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class GuestCrmService {
  async getProfile(guestId: string) {
    let profile = await prisma.guestProfile.findUnique({
      where: { guestId },
      include: { guest: true, reviews: true, loyaltyTransactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!profile) {
      profile = await prisma.guestProfile.create({
        data: { guestId, referralCode: `VED${Date.now().toString(36).toUpperCase()}` },
        include: { guest: true, reviews: true, loyaltyTransactions: true },
      });
    }
    return profile;
  }

  async updateProfile(guestId: string, data: Record<string, unknown>) {
    return prisma.guestProfile.upsert({
      where: { guestId },
      update: data,
      create: { guestId, ...data as any, referralCode: `VED${Date.now().toString(36).toUpperCase()}` },
    });
  }

  async addLoyaltyPoints(guestId: string, points: number, type: string, description?: string, bookingId?: string) {
    await prisma.guestProfile.update({
      where: { guestId },
      data: { loyaltyPoints: { increment: points } },
    });
    return prisma.loyaltyTransaction.create({
      data: { guestId, points, type, description, bookingId, expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
    });
  }

  async redeemPoints(guestId: string, points: number, description?: string) {
    return prisma.$transaction(async (tx) => {
      // Lock the profile row to prevent concurrent redemptions
      await tx.$executeRaw`SELECT 1 FROM "GuestProfile" WHERE "guestId" = ${guestId} FOR UPDATE`;

      const profile = await tx.guestProfile.findUnique({ where: { guestId } });
      if (!profile || profile.loyaltyPoints < points) {
        throw new AppError('Insufficient loyalty points', 400);
      }
      await tx.guestProfile.update({
        where: { guestId },
        data: { loyaltyPoints: { decrement: points } },
      });
      return tx.loyaltyTransaction.create({
        data: { guestId, points: -points, type: 'REDEEM', description },
      });
    });
  }

  async getLeaderboard(limit = 20) {
    return prisma.guestProfile.findMany({
      take: limit,
      orderBy: { loyaltyPoints: 'desc' },
      include: { guest: { select: { name: true } } },
    });
  }

  async getByReferralCode(code: string) {
    return prisma.guestProfile.findFirst({ where: { referralCode: code } });
  }

  async processReferral(refereeEmail: string, refereeName: string, referrerCode: string) {
    const referrer = await prisma.guestProfile.findFirst({ where: { referralCode: referrerCode } });
    if (!referrer) throw new AppError('Invalid referral code', 400);

    const existing = await prisma.referral.findFirst({ where: { refereeEmail } });
    if (existing) throw new AppError('Email already referred', 400);

    await prisma.referral.create({
      data: { referrerCode, refereeEmail, refereeName, status: 'PENDING', rewardPoints: 500 },
    });

    return { success: true, message: 'Referral recorded. Points will be credited after first booking.' };
  }

  async getGuestStats() {
    const [totalGuests, totalReviews, avgRating, topReferrers] = await Promise.all([
      prisma.guestProfile.count(),
      prisma.review.count({ where: { isVerified: true } }),
      prisma.review.aggregate({ _avg: { rating: true }, where: { isVerified: true } }),
      prisma.guestProfile.findMany({
        take: 10,
        orderBy: { totalStays: 'desc' },
        include: { guest: { select: { name: true, email: true } } },
      }),
    ]);
    return { totalGuests, totalReviews, avgRating: avgRating._avg.rating || 0, topReferrers };
  }
}

export const guestCrmService = new GuestCrmService();

import prisma from '../config/database';

export class DynamicPricingService {
  async getRules() {
    return prisma.pricingRule.findMany({ orderBy: { priority: 'desc' } });
  }

  async createRule(data: {
    name: string; type: string; dayOfWeek?: number; startDate?: Date; endDate?: Date;
    multiplier: number; minStay?: number; maxStay?: number; priority?: number;
  }) {
    return prisma.pricingRule.create({ data });
  }

  async updateRule(id: string, data: Record<string, unknown>) {
    return prisma.pricingRule.update({ where: { id }, data });
  }

  async deleteRule(id: string) {
    return prisma.pricingRule.delete({ where: { id } });
  }

  async calculatePrice(basePrice: number, checkIn: Date, checkOut: Date, nights: number) {
    const rules = await prisma.pricingRule.findMany({
      where: { isActive: true },
      orderBy: { priority: 'desc' },
    });

    let multiplier = 1.0;
    const checkInDay = checkIn.getDay();

    for (const rule of rules) {
      if (rule.type === 'WEEKEND' && (checkInDay === 0 || checkInDay === 5 || checkInDay === 6)) {
        multiplier = Math.max(multiplier, rule.multiplier);
      }
      if (rule.type === 'SEASON' && rule.startDate && rule.endDate) {
        if (checkIn >= rule.startDate && checkIn <= rule.endDate) {
          multiplier = Math.max(multiplier, rule.multiplier);
        }
      }
      if (rule.type === 'HOLIDAY') {
        if (rule.startDate && rule.endDate) {
          if (checkIn >= rule.startDate && checkIn <= rule.endDate) {
            multiplier = Math.max(multiplier, rule.multiplier);
          }
        }
      }
      if (rule.type === 'LAST_MINUTE' && nights <= 2) {
        multiplier = Math.max(multiplier, rule.multiplier);
      }
      if (rule.type === 'LONG_STAY' && nights >= 7) {
        multiplier = Math.min(multiplier, rule.multiplier);
      }
    }

    const dynamicPrice = Math.round(basePrice * multiplier);
    return { basePrice, multiplier, dynamicPrice, nights, total: dynamicPrice * nights };
  }
}

export const dynamicPricingService = new DynamicPricingService();

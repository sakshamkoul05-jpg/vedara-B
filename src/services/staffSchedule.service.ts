import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

export class StaffScheduleService {
  async getShifts(staffId: string, startDate: Date, endDate: Date) {
    return prisma.staffShift.findMany({
      where: { staffId, date: { gte: startDate, lte: endDate } },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async createShift(data: { staffId: string; date: Date; startTime: string; endTime: string; shiftType?: string }) {
    return prisma.staffShift.create({ data });
  }

  async createBulkShifts(staffId: string, startDate: Date, endDate: Date, pattern: { startTime: string; endTime: string; shiftType: string; workDays: number[] }) {
    const shifts = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      if (pattern.workDays.includes(current.getDay())) {
        shifts.push({
          staffId,
          date: new Date(current),
          startTime: pattern.startTime,
          endTime: pattern.endTime,
          shiftType: pattern.shiftType,
        });
      }
      current.setDate(current.getDate() + 1);
    }
    return prisma.staffShift.createMany({ data: shifts });
  }

  async deleteShift(id: string) {
    return prisma.staffShift.delete({ where: { id } });
  }

  async getAttendance(staffId: string, startDate: Date, endDate: Date) {
    return prisma.staffAttendance.findMany({
      where: { staffId, date: { gte: startDate, lte: endDate } },
      orderBy: { date: 'asc' },
    });
  }

  async checkIn(staffId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return prisma.staffAttendance.upsert({
      where: { staffId_date: { staffId, date: today } },
      update: { checkIn: new Date(), status: 'PRESENT' },
      create: { staffId, date: today, checkIn: new Date(), status: 'PRESENT' },
    });
  }

  async checkOut(staffId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkOut = new Date();
    const attendance = await prisma.staffAttendance.findUnique({
      where: { staffId_date: { staffId, date: today } },
    });
    if (!attendance?.checkIn) throw new AppError('Not checked in yet', 400);

    const hoursWorked = (checkOut.getTime() - attendance.checkIn.getTime()) / (1000 * 60 * 60);
    const overtime = Math.max(0, hoursWorked - 8);

    return prisma.staffAttendance.update({
      where: { staffId_date: { staffId, date: today } },
      data: { checkOut, hoursWorked: Math.round(hoursWorked * 100) / 100, overtime: Math.round(overtime * 100) / 100 },
    });
  }

  async getStaffScheduleSummary(staffId: string, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [shifts, attendance] = await Promise.all([
      this.getShifts(staffId, startDate, endDate),
      this.getAttendance(staffId, startDate, endDate),
    ]);

    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
    const totalHours = attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
    const totalOvertime = attendance.reduce((sum, a) => sum + (a.overtime || 0), 0);

    return { shifts, attendance, totalDays, presentDays, totalHours, totalOvertime };
  }
}
export const staffScheduleService = new StaffScheduleService();

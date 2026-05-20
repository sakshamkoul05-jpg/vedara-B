import crypto from 'crypto';

export const generateRef = (prefix: string): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

export const generateBookingRef = (): string => generateRef('VDR');
export const generateOrderRef = (): string => generateRef('VDF');

export const calculateNights = (checkIn: Date, checkOut: Date): number => {
  return Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
};

export const calculateDatesArray = (start: Date, end: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current < end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
};

export const isDateOverlap = (
  start1: Date, end1: Date,
  start2: Date, end2: Date
): boolean => {
  return start1 < end2 && start2 < end1;
};

export const sanitizeHtml = (input: string): string => {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

export function parsePagination(query: Record<string, any>) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ACCOUNT_LOCKOUT } from '../utils/security';
import prisma from '../config/database';

const attempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

export const checkLockout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const email = req.body?.email?.toLowerCase();
  if (!email) return next();

  const record = attempts.get(email);
  if (record?.lockedUntil && record.lockedUntil > Date.now()) {
    const remaining = Math.ceil((record.lockedUntil - Date.now()) / 1000 / 60);
    return res.status(429).json({
      success: false,
      error: `Account temporarily locked. Try again in ${remaining} minute(s).`,
    });
  }
  next();
};

export const recordFailedAttempt = async (email: string) => {
  const now = Date.now();
  const record = attempts.get(email);

  if (!record || now - record.firstAttempt > ACCOUNT_LOCKOUT.windowMs) {
    attempts.set(email, { count: 1, firstAttempt: now });
    return;
  }

  record.count += 1;
  if (record.count >= ACCOUNT_LOCKOUT.maxAttempts) {
    record.lockedUntil = now + ACCOUNT_LOCKOUT.lockoutDurationMs;

    await prisma.user.updateMany({
      where: { email },
      data: { lockoutUntil: new Date(record.lockedUntil) },
    }).catch(() => {});
  }
};

export const resetAttempts = (email: string) => {
  attempts.delete(email);
};

export const cleanupLockouts = () => {
  const now = Date.now();
  for (const [email, record] of attempts.entries()) {
    if (now - record.firstAttempt > ACCOUNT_LOCKOUT.windowMs && !record.lockedUntil) {
      attempts.delete(email);
    }
    if (record.lockedUntil && record.lockedUntil < now) {
      attempts.delete(email);
    }
  }
};

setInterval(cleanupLockouts, 60 * 1000);

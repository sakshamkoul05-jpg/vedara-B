import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { ACCOUNT_LOCKOUT } from '../utils/security';
import prisma from '../config/database';
import { cacheGet, cacheSet, cacheDel } from '../utils/cache';

const attempts = new Map<string, { count: number; firstAttempt: number; lockedUntil?: number }>();

const LOCKOUT_KEY = (email: string) => `lockout:${email}`;
const ATTEMPTS_KEY = (email: string) => `attempts:${email}`;

export const checkLockout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const email = req.body?.email?.toLowerCase();
  if (!email) return next();

  const lockedUntil = await cacheGet(LOCKOUT_KEY(email));
  if (lockedUntil && parseInt(lockedUntil) > Date.now()) {
    const remaining = Math.ceil((parseInt(lockedUntil) - Date.now()) / 1000 / 60);
    return res.status(429).json({
      success: false,
      error: `Account temporarily locked. Try again in ${remaining} minute(s).`,
    });
  }

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
    await cacheSet(ATTEMPTS_KEY(email), '1', Math.floor(ACCOUNT_LOCKOUT.windowMs / 1000));
    return;
  }

  record.count += 1;
  await cacheSet(ATTEMPTS_KEY(email), record.count.toString(), Math.floor(ACCOUNT_LOCKOUT.windowMs / 1000));

  if (record.count >= ACCOUNT_LOCKOUT.maxAttempts) {
    record.lockedUntil = now + ACCOUNT_LOCKOUT.lockoutDurationMs;
    await cacheSet(LOCKOUT_KEY(email), record.lockedUntil.toString(), Math.floor(ACCOUNT_LOCKOUT.lockoutDurationMs / 1000));

    await prisma.user.updateMany({
      where: { email },
      data: { lockoutUntil: new Date(record.lockedUntil) },
    }).catch(() => {});
  }
};

export const resetAttempts = async (email: string) => {
  attempts.delete(email);
  await cacheDel(ATTEMPTS_KEY(email)).catch(() => {});
  await cacheDel(LOCKOUT_KEY(email)).catch(() => {});
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

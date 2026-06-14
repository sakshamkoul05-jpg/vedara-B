import rateLimit from 'express-rate-limit';
import { config } from '../config';
import { getRedis } from '../utils/cache';

function createRedisStore(redis: ReturnType<typeof getRedis>, prefix: string) {
  return {
    increment: async (key: string, windowMs: number) => {
      const fullKey = `${prefix}:${key}`;
      const redis = getRedis();
      if (!redis) return { totalHits: 0, resetTime: Date.now() + windowMs };

      try {
        const current = await redis.incr(fullKey);
        if (current === 1) {
          await redis.pexpire(fullKey, windowMs);
        }
        const ttl = await redis.pttl(fullKey);
        return { totalHits: current, resetTime: Date.now() + ttl };
      } catch {
        return { totalHits: 0, resetTime: Date.now() + windowMs };
      }
    },
    decrement: async (key: string) => {
      const redis = getRedis();
      if (!redis) return;
      try { await redis.decr(`${prefix}:${key}`); } catch {}
    },
    resetKey: async (key: string) => {
      const redis = getRedis();
      if (!redis) return;
      try { await redis.del(`${prefix}:${key}`); } catch {}
    },
  };
}

const redisStore = getRedis() ? createRedisStore(getRedis(), 'rl') : undefined;

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
  ...(redisStore ? { store: { increment: redisStore.increment, decrement: redisStore.decrement, resetKey: redisStore.resetKey } as any } : {}),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many login attempts. Try again later.' },
  skipSuccessfulRequests: true,
});

export const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many booking attempts. Try again later.' },
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many submissions. Try again later.' },
});

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, slow down.' },
});

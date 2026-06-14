import Redis from 'ioredis';
import { logger } from './logger';

const REDIS_URL = process.env.REDIS_URL;

let redis: Redis | null = null;

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });
    redis.on('error', (err: Error) => {
      logger.warn('Redis connection error, falling back to in-memory', { error: err.message });
      redis = null;
    });
    redis.on('connect', () => {
      logger.info('Redis connected');
    });
  } catch {
    redis = null;
  }
}

export function getRedis(): Redis | null {
  return redis;
}

export async function cacheGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds?: number): Promise<void> {
  if (!redis) return;
  try {
    if (ttlSeconds) {
      await redis.setex(key, ttlSeconds, value);
    } else {
      await redis.set(key, value);
    }
  } catch {}
}

export async function cacheDel(key: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.del(key);
  } catch {}
}

export async function cacheIncr(key: string, ttlSeconds?: number): Promise<number> {
  if (!redis) return 0;
  try {
    const val = await redis.incr(key);
    if (ttlSeconds && val === 1) {
      await redis.expire(key, ttlSeconds);
    }
    return val;
  } catch {
    return 0;
  }
}

export async function cacheSetAdd(key: string, value: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.sadd(key, value);
  } catch {}
}

export async function cacheSetHas(key: string, value: string): Promise<boolean> {
  if (!redis) return false;
  try {
    return (await redis.sismember(key, value)) === 1;
  } catch {
    return false;
  }
}

export async function cacheSetRemove(key: string, value: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.srem(key, value);
  } catch {}
}

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { logger } from '../utils/logger';
import { cacheSetHas, cacheSetAdd } from '../utils/cache';

const TOKEN_BLACKLIST_KEY = 'token:blacklist';
const TOKEN_BLACKLIST_TTL = 7 * 24 * 60 * 60;

class LRUSet {
  private map = new Map<string, true>();
  private maxsize: number;
  constructor(maxsize: number) { this.maxsize = maxsize; }
  has(key: string): boolean { if (!this.map.has(key)) return false; const v = this.map.get(key)!; this.map.delete(key); this.map.set(key, v); return true; }
  add(key: string): void { if (this.map.has(key)) this.map.delete(key); this.map.set(key, true); if (this.map.size > this.maxsize) { const first = this.map.keys().next().value; if (first !== undefined) this.map.delete(first); } }
  get size(): number { return this.map.size; }
}

const memoryBlacklist = new LRUSet(10000);

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    const isBlacklisted = (await cacheSetHas(TOKEN_BLACKLIST_KEY, token)) || memoryBlacklist.has(token);
    if (isBlacklisted) {
      res.status(401).json({ success: false, error: 'Token has been revoked.' });
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    if (decoded.type !== 'access') {
      res.status(401).json({ success: false, error: 'Invalid token type.' });
      return;
    }

    req.user = decoded;
    next();
  } catch (error) {
    const message = error instanceof jwt.TokenExpiredError
      ? 'Token expired.'
      : 'Invalid token.';
    res.status(401).json({ success: false, error: message });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Unauthorized access attempt', {
        userId: req.user.userId,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
      });
      res.status(403).json({ success: false, error: 'Insufficient permissions.' });
      return;
    }

    next();
  };
};

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const isBlacklisted = (await cacheSetHas(TOKEN_BLACKLIST_KEY, token)) || memoryBlacklist.has(token);
      if (!isBlacklisted) {
        const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
        if (decoded.type === 'access') {
          req.user = decoded;
        }
      }
    }
  } catch {
    // Continue without user
  }
  next();
};

export const invalidateToken = async (token: string): Promise<void> => {
  memoryBlacklist.add(token);
  await cacheSetAdd(TOKEN_BLACKLIST_KEY, token).catch(() => {});
};

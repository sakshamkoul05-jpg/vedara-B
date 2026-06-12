import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { AuthRequest, JwtPayload } from '../types';
import { logger } from '../utils/logger';

const tokenBlacklist = new Set<string>();

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: 'Authentication required.' });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (tokenBlacklist.has(token)) {
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

export const optionalAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (!tokenBlacklist.has(token)) {
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

export const invalidateToken = (token: string): void => {
  tokenBlacklist.add(token);
  if (tokenBlacklist.size > 10000) {
    const iterator = tokenBlacklist.values();
    for (let i = 0; i < 1000; i++) {
      const value = iterator.next();
      if (value.done) break;
      tokenBlacklist.delete(value.value);
    }
  }
};

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config';
import { JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler';
import { validatePassword } from '../utils/security';
import { recordFailedAttempt, resetAttempts } from '../middleware/accountLockout';
import { logger } from '../utils/logger';

async function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

async function compareToken(raw: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(raw, hashed);
}

export class AuthService {
  async login(email: string, password: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!user || !user.isActive) {
      await recordFailedAttempt(normalizedEmail);
      throw new AppError('Invalid email or password.', 401);
    }

    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      const remaining = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 1000 / 60);
      throw new AppError(`Account temporarily locked. Try again in ${remaining} minute(s).`, 429);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      await recordFailedAttempt(normalizedEmail);
      logger.warn('Failed login attempt', { email: normalizedEmail });
      throw new AppError('Invalid email or password.', 401);
    }

    resetAttempts(normalizedEmail);

    const payload: JwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      type: 'access',
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    const refreshPayload: JwtPayload = {
      userId: user.id,
      role: user.role,
      email: user.email,
      type: 'refresh',
    };
    const refreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn as any,
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: await hashToken(refreshToken), lastLoginAt: new Date() },
    });

    logger.info('Successful login', { userId: user.id, role: user.role });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;

      if (decoded.type !== 'refresh') {
        throw new AppError('Invalid token type.', 401);
      }

      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user || !user.isActive || !user.refreshToken || !(await compareToken(refreshToken, user.refreshToken))) {
        throw new AppError('Invalid refresh token.', 401);
      }

      const payload: JwtPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
        type: 'access',
      };
      const newAccessToken = jwt.sign(payload, config.jwt.secret, {
        expiresIn: config.jwt.expiresIn as any,
      });

      const refreshPayload: JwtPayload = {
        userId: user.id,
        role: user.role,
        email: user.email,
        type: 'refresh',
      };
      const newRefreshToken = jwt.sign(refreshPayload, config.jwt.refreshSecret, {
        expiresIn: config.jwt.refreshExpiresIn as any,
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: await hashToken(newRefreshToken) },
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Session expired. Please login again.', 401);
    }
  }

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, avatar: true, createdAt: true, isActive: true,
      },
    });
    if (!user) throw new AppError('User not found.', 404);
    return user;
  }

  async createUser(data: {
    name: string; email: string; password: string; role: string; phone?: string
  }) {
    const validation = validatePassword(data.password);
    if (!validation.valid) {
      throw new AppError(validation.message, 400);
    }

    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new AppError('Email already in use.', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: data.role as any,
        phone: data.phone?.trim() || undefined,
      },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, createdAt: true,
      },
    });

    logger.info('User created', { userId: user.id, role: user.role });
    return user;
  }

  async updateUser(id: string, data: {
    name?: string; phone?: string; role?: string; isActive?: boolean
  }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name.trim() }),
        ...(data.phone && { phone: data.phone.trim() }),
        ...(data.role && { role: data.role as any }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, isActive: true, createdAt: true,
      },
    });
    return user;
  }
}

export const authService = new AuthService();

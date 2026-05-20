import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { config } from '../config';
import { JwtPayload } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Invalid credentials', 401);
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AppError('Invalid credentials', 401);
    }

    const payload: JwtPayload = { userId: user.id, role: user.role, email: user.email };
    const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as any });

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as JwtPayload;
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      const payload: JwtPayload = { userId: user.id, role: user.role, email: user.email };
      const newAccessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
      const newRefreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as any });

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Invalid refresh token', 401);
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
      select: { id: true, name: true, email: true, role: true, phone: true, avatar: true, createdAt: true },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async createUser(data: { name: string; email: string; password: string; role: string; phone?: string }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already in use', 409);

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role as any,
        phone: data.phone,
      },
      select: { id: true, name: true, email: true, role: true, phone: true, createdAt: true },
    });
    return user;
  }

  async updateUser(id: string, data: { name?: string; phone?: string; role?: string; isActive?: boolean }) {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.role && { role: data.role as any }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
      select: { id: true, name: true, email: true, role: true, phone: true, isActive: true, createdAt: true },
    });
    return user;
  }
}

export const authService = new AuthService();

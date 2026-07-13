import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { authService } from '../services/auth.service';
import { loginSchema as loginValidator, createUserSchema as createUserValidator, updateUserSchema as updateUserValidator } from '../validators/auth.validator';

export const authController = {
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { email, password } = loginValidator.parse(req.body).body;
      const result = await authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) return res.status(400).json({ success: false, error: 'Refresh token required' });
      const result = await authService.refresh(refreshToken);
      res.json({ success: true, data: result });
    } catch (error) { next(error); }
  },

  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (req.user) await authService.logout(req.user.userId);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) { next(error); }
  },

  async profile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getProfile(req.user!.userId);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  },

  async createUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { body: data } = createUserValidator.parse({ body: req.body });
      const user = await authService.createUser(data);
      res.status(201).json({ success: true, data: user });
    } catch (error) { next(error); }
  },

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { body: data } = updateUserValidator.parse({ body: req.body });
      const user = await authService.updateUser(req.params.id as string, data);
      res.json({ success: true, data: user });
    } catch (error) { next(error); }
  },
};

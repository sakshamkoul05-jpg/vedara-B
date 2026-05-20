import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { cafeService } from '../services/cafe.service';

export const cafeController = {
  async getMenu(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const menu = await cafeService.getMenu();
      res.json({ success: true, data: menu });
    } catch (error) { next(error); }
  },

  async createOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const order = await cafeService.createOrder(req.body);
      res.status(201).json({ success: true, data: order });
    } catch (error) { next(error); }
  },

  async updateOrderStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body;
      const order = await cafeService.updateOrderStatus(req.params.id, status);
      res.json({ success: true, data: order });
    } catch (error) { next(error); }
  },

  async getOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const result = await cafeService.getOrders({ page, limit, status: req.query.status as string });
      res.json({ success: true, ...result });
    } catch (error) { next(error); }
  },

  async getKitchenOrders(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const orders = await cafeService.getKitchenOrders();
      res.json({ success: true, data: orders });
    } catch (error) { next(error); }
  },

  async addCategory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const category = await cafeService.addCategory(req.body);
      res.status(201).json({ success: true, data: category });
    } catch (error) { next(error); }
  },

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await cafeService.addItem(req.body);
      res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
  },

  async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const item = await cafeService.updateItem(req.params.id, req.body);
      res.json({ success: true, data: item });
    } catch (error) { next(error); }
  },
};

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { cafeService } from '../services/cafe.service';

export const cafeController = {
  async getMenu(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const showAll = req.query.staff === 'true';
      const menu = await cafeService.getMenu(showAll);
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
      const order = await cafeService.updateOrderStatus(req.params.id as string, status);
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
      const allowedFields = ['name', 'description', 'price', 'image', 'isAvailable', 'isVegetarian', 'sortOrder', 'categoryId'];
      const data: Record<string, any> = {};
      for (const key of allowedFields) {
        if (req.body[key] !== undefined) data[key] = req.body[key];
      }
      const item = await cafeService.updateItem(req.params.id as string, data);
      res.json({ success: true, data: item });
    } catch (error) { next(error); }
  },

  async getDailySales(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await cafeService.getDailySales();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  },

  async getMonthlySales(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await cafeService.getMonthlySales();
      res.json({ success: true, data });
    } catch (error) { next(error); }
  },

  async getTopItems(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const data = await cafeService.getTopItems(limit);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  },

  async getSalesChart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const days = Math.min(parseInt(req.query.days as string) || 7, 90);
      const data = await cafeService.getSalesChart(days);
      res.json({ success: true, data });
    } catch (error) { next(error); }
  },
};

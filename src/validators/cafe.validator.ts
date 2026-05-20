import { z } from 'zod';

export const createCafeOrderSchema = z.object({
  body: z.object({
    tableNumber: z.number().int().min(1, 'Table number is required'),
    guestName: z.string().optional(),
    notes: z.string().optional(),
    items: z.array(z.object({
      itemId: z.string().min(1),
      quantity: z.number().int().min(1),
      notes: z.string().optional(),
    })).min(1, 'At least one item is required'),
  }),
});

export const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']),
  }),
});

export const addCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Category name is required'),
    description: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const addItemSchema = z.object({
  body: z.object({
    categoryId: z.string().min(1),
    name: z.string().min(2, 'Item name is required'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    image: z.string().optional(),
    isVegetarian: z.boolean().optional(),
  }),
});

import { z } from 'zod';
import { isHtml } from '../utils/security';

const sanitizedString = (min = 1, max = 1000) =>
  z.string()
    .min(min, `Must be at least ${min} character(s)`)
    .max(max, `Must be at most ${max} characters`)
    .refine((val) => !isHtml(val), { message: 'HTML content is not allowed' })
    .transform((val) => val.trim().replace(/[<>]/g, ''));

export const phoneSchema = z.string()
  .regex(/^[\d\s+\-()]{7,20}$/, 'Invalid phone number format')
  .transform((v) => v.trim());

export const emailSchema = z.string()
  .email('Invalid email address')
  .max(254)
  .transform((v) => v.toLowerCase().trim());

export const dateSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)');

export const positiveInt = z.union([z.number().int().positive(), z.string().regex(/^\d+$/)])
  .transform((v) => typeof v === 'string' ? parseInt(v, 10) : v);

export { sanitizedString };

import { z } from 'zod';
import { sanitizedString, emailSchema, phoneSchema } from './index';

export const contactSchema = z.object({
  body: z.object({
    name: sanitizedString(2, 100),
    email: emailSchema,
    phone: phoneSchema.optional().or(z.literal('')),
    subject: sanitizedString(2, 200),
    message: sanitizedString(10, 5000),
    honeypot: z.string().max(0, 'Bot detected').optional(),
    timestamp: z.number().optional(),
  }).refine(
    (data) => {
      if (!data.timestamp) return true;
      const elapsed = Date.now() - data.timestamp;
      return elapsed > 3000;
    },
    { message: 'Form submitted too quickly', path: ['timestamp'] }
  ),
});

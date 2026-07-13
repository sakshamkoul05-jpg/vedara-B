import crypto from 'crypto';
import { config } from '../config';

export const sanitize = (input: string): string => {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};

export const sanitizeObject = <T extends Record<string, unknown>>(obj: T): T => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = typeof value === 'string' ? sanitize(value) : value;
  }
  return result as T;
};

export const generateCsrfToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const validatePassword = (password: string): { valid: boolean; message: string } => {
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain an uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain a lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain a number' };
  if (!/[^A-Za-z0-9]/.test(password)) return { valid: false, message: 'Password must contain a special character' };
  return { valid: true, message: '' };
};

export const isHtml = (input: string): boolean => {
  return /<[a-z][\s\S]*>/i.test(input);
};

export const csrfProtection = (req: any, res: any, next: any) => {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const publicPaths = ['/bookings', '/payments', '/contact', '/chatbot', '/chat', '/packages', '/reviews', '/guests/referral', '/pricing'];
  const isPublicPath = publicPaths.some(p => req.path?.startsWith(p) || req.originalUrl?.includes(p));
  if (isPublicPath) return next();

  const token = req.headers['x-csrf-token'] || req.headers['xsrf-token'];
  const cookieToken = req.cookies?.csrf_token;
  if (!token || !cookieToken || token !== cookieToken) {
    return res.status(403).json({ success: false, error: 'CSRF token validation failed' });
  }
  next();
};

export const setCsrfCookie = (req: any, res: any, next: any) => {
  if (!req.cookies?.csrf_token) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie('csrf_token', token, {
      httpOnly: false,
      secure: config.isProd,
      sameSite: 'strict',
      maxAge: 86400000,
      path: '/',
    });
  }
  next();
};

export const secureRandomToken = (bytes = 48): string => {
  return crypto.randomBytes(bytes).toString('hex');
};

export const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/webp', 'image/avif',
  'application/pdf',
  'text/plain',
] as const;

export const validateFileType = (mimeType: string): boolean => {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
};

export const ACCOUNT_LOCKOUT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
  lockoutDurationMs: 15 * 60 * 1000,
};

export const sensitiveFields = [
  'password', 'refreshToken', 'resetToken',
  'razorpayKeySecret', 'cloudinaryApiSecret',
  'smtpPass', 'groqApiKey', 'whatsappApiKey',
] as const;

export const REDACTED = '[REDACTED]';

export const redactSensitive = (data: Record<string, unknown>): Record<string, unknown> => {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (sensitiveFields.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      result[key] = REDACTED;
    }
  }
  return result;
};

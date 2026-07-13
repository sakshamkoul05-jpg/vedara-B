import dotenv from 'dotenv';
dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: (process.env.NODE_ENV || 'development') === 'development',
  isProd: process.env.NODE_ENV === 'production',

  jwt: {
    secret: requireEnv('JWT_SECRET'),
    refreshSecret: requireEnv('JWT_REFRESH_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  cookieSecret: requireEnv('COOKIE_SECRET'),

  razorpay: {
    keyId: requireEnv('RAZORPAY_KEY_ID'),
    keySecret: requireEnv('RAZORPAY_KEY_SECRET'),
    webhookSecret: requireEnv('RAZORPAY_WEBHOOK_SECRET'),
  },

  cloudinary: {
    cloudName: requireEnv('CLOUDINARY_CLOUD_NAME'),
    apiKey: requireEnv('CLOUDINARY_API_KEY'),
    apiSecret: requireEnv('CLOUDINARY_API_SECRET'),
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@vedara.com',
  },

  groq: {
    apiKey: requireEnv('GROQ_API_KEY'),
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',

  bookingHoldMinutes: parseInt(process.env.BOOKING_HOLD_MINUTES || '15', 10),

  whatsapp: {
    apiUrl: process.env.WHATSAPP_API_URL || '',
    apiKey: requireEnv('WHATSAPP_API_KEY'),
    toNumber: process.env.WHATSAPP_TO_NUMBER || '919118882242',
  },

  adminEmail: process.env.ADMIN_EMAIL || 'vedararetreat@gmail.com',
  adminPhone: process.env.ADMIN_PHONE || '919118882242',
};

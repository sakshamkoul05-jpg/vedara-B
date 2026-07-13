import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { globalLimiter, apiLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './config/swagger';
import routes from './routes';
import { setupSocket } from './sockets';
import { startCronJobs } from './jobs';
import { logger } from './utils/logger';
import { prisma } from './config/database';

const allowedOrigins = [
  config.frontendUrl,
  'https://vedara-f.vercel.app',
  'https://www.thevedara.com',
  'https://thevedara.com',
  'http://localhost:3000',
  'http://localhost:5173',
].filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  // Allow any Vercel deployment (production + preview) so the frontend keeps
  // working regardless of the generated *.vercel.app hostname.
  if (origin.endsWith('.vercel.app')) return true;
  return false;
}

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) return callback(null, true);
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.vedara.in', 'https://res.cloudinary.com'],
      frameAncestors: ["'none'"]
    }
  },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginEmbedderPolicy: false,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  xContentTypeOptions: true,
  xDnsPrefetchControl: { allow: true },
  xDownloadOptions: true,
  xFrameOptions: { action: 'deny' },
  xPoweredBy: false,
  xXssProtection: true,
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || isAllowedOrigin(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-XSRF-Token'],
  exposedHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400,
}));

app.use(cookieParser(config.cookieSecret));
app.use(express.json({
  limit: '1mb',
  verify: (req, _res, buf) => {
    (req as any).rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', globalLimiter);
app.use('/api', apiLimiter);

app.use('/api', routes);

setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

setupSocket(io);
startCronJobs();

// Idempotent schema patches applied on boot so the production DB stays in sync
// with schema.prisma even though the deploy pipeline does not run migrations.
// Safe to run on every start; each statement is a no-op if already applied.
async function applyPendingSchema(): Promise<void> {
  const patches = [
    `ALTER TABLE "Cottage" ADD COLUMN IF NOT EXISTS "extraGuestCharge" INTEGER NOT NULL DEFAULT 1500;`,
    `CREATE TABLE IF NOT EXISTS "CouponUsage" (
      "id" TEXT NOT NULL,
      "couponId" TEXT NOT NULL,
      "bookingId" TEXT NOT NULL,
      "usedById" TEXT NOT NULL,
      "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "discountAmount" INTEGER NOT NULL,
      CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
    );`,
    `CREATE INDEX IF NOT EXISTS "CouponUsage_couponId_idx" ON "CouponUsage"("couponId");`,
    `CREATE INDEX IF NOT EXISTS "CouponUsage_bookingId_idx" ON "CouponUsage"("bookingId");`,
    `ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;`,
    `CREATE INDEX IF NOT EXISTS "Booking_status_holdExpiresAt_idx" ON "Booking"("status","holdExpiresAt");`,
  ];

  for (const sql of patches) {
    try {
      await prisma.$executeRawUnsafe(sql);
      logger.info('Applied schema patch', { sql });
    } catch (e) {
      logger.error('Schema patch failed (non-fatal)', { sql, error: (e as Error)?.message });
    }
  }
}

applyPendingSchema().finally(() => {
  httpServer.listen(config.port, () => {
    logger.info(`Vedara Retreat API running on port ${config.port}`, { env: config.nodeEnv });
  });
});

export default app;

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { csrfProtection, setCsrfCookie } from './utils/security';
import { globalLimiter, apiLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './config/swagger';
import routes from './routes';
import { setupSocket } from './sockets';
import { startCronJobs } from './jobs';
import { logger } from './utils/logger';

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
  if (/^https:\/\/vedara-f-[a-z0-9]+\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/vedara-[a-z0-9]+-sakshamkoul05-jpgs-projects\.vercel\.app$/i.test(origin)) return true;
  if (/^https:\/\/vedara-[a-z0-9]+\.vercel\.app$/i.test(origin)) return true;
  return false;
}

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  },
});

app.use(helmet({
  contentSecurityPolicy: false,
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
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/api', globalLimiter);
app.use('/api', apiLimiter);
app.use('/api', setCsrfCookie);
app.use('/api', csrfProtection);

app.use('/api', routes);

setupSwagger(app);

app.use(notFoundHandler);
app.use(errorHandler);

setupSocket(io);
startCronJobs();

httpServer.listen(config.port, () => {
  logger.info(`Vedara Retreat API running on port ${config.port}`, { env: config.nodeEnv });
});

export default app;

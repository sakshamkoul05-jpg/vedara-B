import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { csrfProtection } from './utils/security';
import { globalLimiter, apiLimiter } from './middleware/rateLimiter';
import { setupSwagger } from './config/swagger';
import routes from './routes';
import { setupSocket } from './sockets';
import { startCronJobs } from './jobs';
import { logger } from './utils/logger';

const allowedOrigins = [
  config.frontendUrl,
  'https://vedara-f.vercel.app',
  'https://vedara-f-tau.vercel.app',
  'https://vedara-qc4atr8c2-sakshamkoul05-jpgs-projects.vercel.app',
  'https://vedara-2b4rim0kz-sakshamkoul05-jpgs-projects.vercel.app',
].filter(Boolean);

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST'],
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
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
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

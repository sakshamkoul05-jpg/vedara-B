import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './config';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import routes from './routes';
import { setupSocket } from './sockets';
import { startCronJobs } from './jobs';
import { logger } from './utils/logger';

const app = express();
app.set('trust proxy', 1);
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.frontendUrl,
    methods: ['GET', 'POST'],
  },
});

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

setupSocket(io);
startCronJobs();

httpServer.listen(config.port, () => {
  logger.info(`Vedara Retreat API running on port ${config.port}`, { env: config.nodeEnv });
});

export default app;

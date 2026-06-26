import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config';
import { logger } from '../utils/logger';
import { redactSensitive } from '../utils/security';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors,
    });
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.code && { code: err.code }),
    });
    return;
  }

  const requestInfo = {
    method: req.method,
    path: req.path,
    ip: req.ip?.replace(/::ffff:/, ''),
  };

  if (config.isDev) {
    logger.error('Unhandled error', {
      ...requestInfo,
      message: err.message,
      stack: err.stack,
      body: redactSensitive(req.body || {}),
    });
  } else {
    logger.error('Unhandled error', {
      ...requestInfo,
      errorId: Math.random().toString(36).substring(2, 10),
    });
  }

  res.status(500).json({
    success: false,
    error: 'An unexpected error occurred. Please try again later.',
    debug: err.message,
  });
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  res.status(404).json({ success: false, error: 'The requested resource was not found.' });
};

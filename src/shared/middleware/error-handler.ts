import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '@shared/types';
import { logger } from '@shared/utils/logger';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Default error response
  let statusCode = 500;
  let apiError: ApiError = {
    code: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred'
  };

  // Handle different types of errors
  if (error.name === 'ValidationError') {
    statusCode = 400;
    apiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: error.message
    };
  } else if (error.name === 'CastError') {
    statusCode = 400;
    apiError = {
      code: 'INVALID_ID',
      message: 'Invalid ID format'
    };
  } else if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = 409;
    apiError = {
      code: 'DUPLICATE_KEY',
      message: 'Resource already exists'
    };
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    apiError = {
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token'
    };
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    apiError = {
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired'
    };
  }

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    apiError.stack = error.stack;
  }

  const response: ApiResponse = {
    success: false,
    error: apiError,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] as string || 'unknown'
  };

  res.status(statusCode).json(response);
};
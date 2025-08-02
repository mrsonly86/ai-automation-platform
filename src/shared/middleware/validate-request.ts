import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse, ApiError } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const apiError: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid input data',
      details: errors.array()
    };

    const response: ApiResponse = {
      success: false,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    };

    res.status(400).json(response);
    return;
  }

  next();
};
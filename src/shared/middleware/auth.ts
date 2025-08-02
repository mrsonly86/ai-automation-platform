import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ApiResponse, ApiError } from '@shared/types';
import { v4 as uuidv4 } from 'uuid';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    const apiError: ApiError = {
      code: 'UNAUTHORIZED',
      message: 'Access token is required'
    };

    const response: ApiResponse = {
      success: false,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    };

    res.status(401).json(response);
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (error) {
    const apiError: ApiError = {
      code: 'INVALID_TOKEN',
      message: 'Invalid or expired access token'
    };

    const response: ApiResponse = {
      success: false,
      error: apiError,
      timestamp: new Date().toISOString(),
      requestId: uuidv4()
    };

    res.status(403).json(response);
  }
};
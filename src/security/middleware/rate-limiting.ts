import rateLimit from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

export interface RateLimitConfig {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Rate Limiting Middleware for API Protection
 */
export class RateLimitingService {
  
  /**
   * General API rate limiting
   */
  static createGeneralRateLimit(): any {
    return rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 100 requests per window
      message: {
        error: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau.',
        retryAfter: 'Thử lại sau 15 phút'
      },
      standardHeaders: true,
      legacyHeaders: false,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          error: 'Quá nhiều yêu cầu',
          message: 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.',
          retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
        });
      }
    });
  }

  /**
   * Strict rate limiting for authentication endpoints
   */
  static createAuthRateLimit(): any {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: {
        error: 'Quá nhiều lần đăng nhập thất bại',
        retryAfter: 'Thử lại sau 15 phút'
      },
      skipSuccessfulRequests: true,
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          error: 'Tài khoản tạm thời bị khóa',
          message: 'Quá nhiều lần đăng nhập thất bại. Tài khoản sẽ được mở khóa sau 15 phút.',
          retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
        });
      }
    });
  }

  /**
   * Rate limiting for payment operations
   */
  static createPaymentRateLimit(): any {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // 10 payment attempts per hour
      message: {
        error: 'Quá nhiều giao dịch thanh toán',
        retryAfter: 'Thử lại sau 1 giờ'
      },
      keyGenerator: (req: Request) => {
        // Rate limit based on user ID for authenticated requests
        return req.user?.id || req.ip;
      },
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          error: 'Giới hạn giao dịch',
          message: 'Bạn đã thực hiện quá nhiều giao dịch. Vui lòng thử lại sau 1 giờ.',
          retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
        });
      }
    });
  }

  /**
   * Rate limiting for AI agent execution
   */
  static createAgentExecutionRateLimit(): any {
    return rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 20, // 20 agent executions per 5 minutes
      message: {
        error: 'Quá nhiều lần thực thi AI agent',
        retryAfter: 'Thử lại sau 5 phút'
      },
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip;
      },
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          error: 'Giới hạn thực thi AI',
          message: 'Bạn đã thực thi AI quá nhiều lần. Vui lòng thử lại sau 5 phút.',
          retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
        });
      }
    });
  }

  /**
   * Rate limiting for data export operations
   */
  static createExportRateLimit(): any {
    return rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 3, // 3 exports per hour
      message: {
        error: 'Quá nhiều lần xuất dữ liệu',
        retryAfter: 'Thử lại sau 1 giờ'
      },
      keyGenerator: (req: Request) => {
        return req.user?.id || req.ip;
      },
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          error: 'Giới hạn xuất dữ liệu',
          message: 'Bạn đã xuất dữ liệu quá nhiều lần. Vui lòng thử lại sau 1 giờ.',
          retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
        });
      }
    });
  }

  /**
   * Custom rate limiter with dynamic limits based on user role
   */
  static createDynamicRateLimit(): any {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = req.user;
      let maxRequests = 100; // Default for guests

      if (user) {
        switch (user.role) {
          case 'super_admin':
            maxRequests = 1000;
            break;
          case 'admin':
            maxRequests = 500;
            break;
          case 'manager':
            maxRequests = 300;
            break;
          case 'user':
            maxRequests = 200;
            break;
          default:
            maxRequests = 100;
        }
      }

      const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: maxRequests,
        keyGenerator: (req: Request) => {
          return req.user?.id || req.ip;
        },
        handler: (req: Request, res: Response) => {
          res.status(429).json({
            error: 'Giới hạn yêu cầu',
            message: `Bạn đã vượt quá giới hạn ${maxRequests} yêu cầu trong 15 phút.`,
            retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
          });
        }
      });

      return limiter(req, res, next);
    };
  }

  /**
   * Rate limiting for Vietnamese payment gateways
   */
  static createVietnamesePaymentRateLimit(): any {
    return rateLimit({
      windowMs: 30 * 60 * 1000, // 30 minutes
      max: 5, // 5 payment gateway calls per 30 minutes
      message: {
        error: 'Quá nhiều lần gọi cổng thanh toán',
        retryAfter: 'Thử lại sau 30 phút'
      },
      keyGenerator: (req: Request) => {
        // Combine user ID and payment gateway type
        const gateway = req.body?.gateway || req.params?.gateway || 'unknown';
        return `${req.user?.id || req.ip}:${gateway}`;
      },
      handler: (req: Request, res: Response) => {
        res.status(429).json({
          error: 'Giới hạn cổng thanh toán',
          message: 'Quá nhiều lần kết nối với cổng thanh toán. Vui lòng thử lại sau 30 phút.',
          retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
        });
      }
    });
  }

  /**
   * IP-based blocking for suspicious activities
   */
  static createSuspiciousActivityRateLimit(): any {
    const suspiciousIPs = new Set<string>();
    
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = req.ip;
      
      // Check if IP is in suspicious list
      if (suspiciousIPs.has(clientIP)) {
        return res.status(403).json({
          error: 'IP bị chặn',
          message: 'Địa chỉ IP của bạn đã bị chặn do hoạt động đáng ngờ.'
        });
      }

      // Apply stricter rate limiting
      const strictLimiter = rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 10, // Very strict limit
        onLimitReached: (req: Request) => {
          // Add IP to suspicious list if limit is reached multiple times
          suspiciousIPs.add(req.ip);
          console.warn(`Suspicious activity detected from IP: ${req.ip}`);
        },
        handler: (req: Request, res: Response) => {
          res.status(429).json({
            error: 'Hoạt động đáng ngờ',
            message: 'Phát hiện hoạt động đáng ngờ. IP sẽ bị chặn tạm thời.',
            retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
          });
        }
      });

      return strictLimiter(req, res, next);
    };
  }

  /**
   * Rate limiting for Vietnamese business hours
   */
  static createBusinessHoursRateLimit(): any {
    return (req: Request, res: Response, next: NextFunction) => {
      const now = new Date();
      const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const hour = vietnamTime.getHours();
      
      // Different limits for business hours (8 AM - 6 PM) vs off-hours
      const isBusinessHours = hour >= 8 && hour < 18;
      const maxRequests = isBusinessHours ? 200 : 50;

      const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: maxRequests,
        handler: (req: Request, res: Response) => {
          const timeType = isBusinessHours ? 'giờ làm việc' : 'ngoài giờ làm việc';
          res.status(429).json({
            error: 'Giới hạn theo giờ',
            message: `Quá nhiều yêu cầu trong ${timeType}. Vui lòng thử lại sau.`,
            retryAfter: Math.ceil((req.rateLimit?.resetTime || Date.now()) / 1000)
          });
        }
      });

      return limiter(req, res, next);
    };
  }
}
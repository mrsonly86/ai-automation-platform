import cors from 'cors';
import { Request } from 'express';

export interface CorsConfig {
  development: cors.CorsOptions;
  production: cors.CorsOptions;
  testing: cors.CorsOptions;
}

/**
 * CORS Security Configuration for AI Automation Platform
 * Implements secure cross-origin resource sharing for Vietnamese market
 */
export class CorsSecurityService {
  
  /**
   * Allowed domains for Vietnamese market
   */
  private static readonly VIETNAMESE_DOMAINS = [
    'localhost',
    '127.0.0.1',
    '.vietnamnet.vn',
    '.vnexpress.net',
    '.dantri.com.vn',
    '.tuoitre.vn',
    '.thanhnien.vn',
    '.shopee.vn',
    '.tiki.vn',
    '.lazada.vn',
    '.sendo.vn',
    '.facebook.com',
    '.zalo.me',
    '.momo.vn',
    '.vnpay.vn',
    '.zalopay.vn'
  ];

  /**
   * Trusted domains for business integrations
   */
  private static readonly TRUSTED_BUSINESS_DOMAINS = [
    '.salesforce.com',
    '.hubspot.com',
    '.slack.com',
    '.microsoft.com',
    '.google.com',
    '.zapier.com',
    '.stripe.com',
    '.paypal.com'
  ];

  /**
   * Government and banking domains (Vietnam)
   */
  private static readonly GOVERNMENT_BANKING_DOMAINS = [
    '.gov.vn',
    '.vietcombank.com.vn',
    '.agribank.com.vn',
    '.bidv.com.vn',
    '.mbbank.com.vn',
    '.techcombank.com.vn',
    '.acb.com.vn',
    '.tpb.vn'
  ];

  /**
   * Get CORS configuration based on environment
   */
  static getCorsConfig(): CorsConfig {
    return {
      development: this.getDevelopmentCors(),
      production: this.getProductionCors(),
      testing: this.getTestingCors()
    };
  }

  /**
   * Development CORS configuration (more permissive)
   */
  private static getDevelopmentCors(): cors.CorsOptions {
    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (this.isAllowedOrigin(origin) || this.isLocalhostOrigin(origin)) {
          callback(null, true);
        } else {
          console.warn(`CORS blocked origin in development: ${origin}`);
          callback(null, true); // Still allow in development for debugging
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'X-Client-Version',
        'X-Request-ID',
        'X-Vietnam-Timezone'
      ],
      exposedHeaders: [
        'X-Total-Count',
        'X-Rate-Limit-Remaining',
        'X-Rate-Limit-Reset',
        'X-Request-ID'
      ],
      maxAge: 86400 // 24 hours
    };
  }

  /**
   * Production CORS configuration (strict security)
   */
  private static getProductionCors(): cors.CorsOptions {
    return {
      origin: (origin, callback) => {
        if (!origin) {
          // Be more strict in production - require origin
          return callback(new Error('Origin header required in production'), false);
        }
        
        if (this.isAllowedOrigin(origin)) {
          callback(null, true);
        } else {
          console.error(`CORS blocked origin in production: ${origin}`);
          callback(new Error(`Origin ${origin} not allowed by CORS policy`), false);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-API-Key',
        'X-Client-Version',
        'X-Request-ID',
        'X-Vietnam-Timezone',
        'X-CSRF-Token'
      ],
      exposedHeaders: [
        'X-Total-Count',
        'X-Rate-Limit-Remaining',
        'X-Rate-Limit-Reset',
        'X-Request-ID'
      ],
      maxAge: 3600, // 1 hour in production
      optionsSuccessStatus: 204
    };
  }

  /**
   * Testing CORS configuration
   */
  private static getTestingCors(): cors.CorsOptions {
    return {
      origin: true, // Allow all origins in testing
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['*'],
      maxAge: 0 // Disable preflight caching in tests
    };
  }

  /**
   * Check if origin is allowed
   */
  private static isAllowedOrigin(origin: string): boolean {
    const url = new URL(origin);
    const hostname = url.hostname.toLowerCase();
    
    // Check exact matches and wildcard domains
    const allAllowedDomains = [
      ...this.VIETNAMESE_DOMAINS,
      ...this.TRUSTED_BUSINESS_DOMAINS,
      ...this.GOVERNMENT_BANKING_DOMAINS
    ];

    return allAllowedDomains.some(domain => {
      if (domain.startsWith('.')) {
        // Wildcard domain (e.g., .shopee.vn)
        return hostname.endsWith(domain.substring(1)) || hostname === domain.substring(1);
      } else {
        // Exact domain match
        return hostname === domain;
      }
    });
  }

  /**
   * Check if origin is localhost (development)
   */
  private static isLocalhostOrigin(origin: string): boolean {
    try {
      const url = new URL(origin);
      const hostname = url.hostname.toLowerCase();
      
      return hostname === 'localhost' || 
             hostname === '127.0.0.1' || 
             hostname.startsWith('192.168.') ||
             hostname.startsWith('10.') ||
             hostname.endsWith('.local');
    } catch {
      return false;
    }
  }

  /**
   * Dynamic CORS based on request context
   */
  static createDynamicCors() {
    return (req: Request, callback: (err: Error | null, options?: cors.CorsOptions) => void) => {
      let corsOptions: cors.CorsOptions;
      
      // Check if request is from a payment gateway
      if (this.isPaymentGatewayRequest(req)) {
        corsOptions = this.getPaymentGatewayCors();
      }
      // Check if request is for Vietnamese integrations
      else if (this.isVietnameseIntegrationRequest(req)) {
        corsOptions = this.getVietnameseIntegrationCors();
      }
      // Check if request is for government services
      else if (this.isGovernmentServiceRequest(req)) {
        corsOptions = this.getGovernmentServiceCors();
      }
      // Default CORS based on environment
      else {
        const environment = process.env.NODE_ENV || 'development';
        const config = this.getCorsConfig();
        corsOptions = config[environment as keyof CorsConfig] || config.development;
      }
      
      callback(null, corsOptions);
    };
  }

  /**
   * CORS for payment gateway callbacks
   */
  private static getPaymentGatewayCors(): cors.CorsOptions {
    return {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // Allow no origin for webhooks
        
        const paymentDomains = ['.vnpay.vn', '.zalopay.vn', '.momo.vn'];
        const isPaymentDomain = paymentDomains.some(domain => 
          origin.includes(domain.substring(1))
        );
        
        callback(null, isPaymentDomain);
      },
      credentials: false, // No credentials for payment callbacks
      methods: ['POST', 'GET'],
      allowedHeaders: ['Content-Type', 'X-Signature', 'X-Webhook-Signature']
    };
  }

  /**
   * CORS for Vietnamese platform integrations
   */
  private static getVietnameseIntegrationCors(): cors.CorsOptions {
    return {
      origin: this.VIETNAMESE_DOMAINS,
      credentials: true,
      methods: ['GET', 'POST', 'PUT'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-API-Key',
        'X-Vietnam-Timezone',
        'X-Shop-ID',
        'X-Seller-ID'
      ]
    };
  }

  /**
   * CORS for government service integrations
   */
  private static getGovernmentServiceCors(): cors.CorsOptions {
    return {
      origin: this.GOVERNMENT_BANKING_DOMAINS,
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-API-Key',
        'X-Government-Token',
        'X-Tax-Code'
      ],
      maxAge: 300 // Shorter cache for government requests
    };
  }

  /**
   * Check if request is from payment gateway
   */
  private static isPaymentGatewayRequest(req: Request): boolean {
    const path = req.path.toLowerCase();
    return path.includes('/payment') || 
           path.includes('/webhook') || 
           path.includes('/callback');
  }

  /**
   * Check if request is for Vietnamese integration
   */
  private static isVietnameseIntegrationRequest(req: Request): boolean {
    const path = req.path.toLowerCase();
    return path.includes('/integration/vietnam') || 
           path.includes('/shopee') || 
           path.includes('/tiki') || 
           path.includes('/zalo');
  }

  /**
   * Check if request is for government service
   */
  private static isGovernmentServiceRequest(req: Request): boolean {
    const path = req.path.toLowerCase();
    return path.includes('/government') || 
           path.includes('/tax') || 
           path.includes('/legal') ||
           path.includes('/compliance');
  }

  /**
   * Middleware to add Vietnam-specific headers
   */
  static vietnamSpecificHeaders() {
    return (req: Request, res: any, next: any) => {
      // Add Vietnam timezone header
      res.setHeader('X-Vietnam-Timezone', 'Asia/Ho_Chi_Minh');
      
      // Add Vietnamese language support
      res.setHeader('X-Supported-Languages', 'vi,en');
      
      // Add local compliance headers
      res.setHeader('X-GDPR-Compliant', 'true');
      res.setHeader('X-Vietnam-Data-Protection', 'compliant');
      
      next();
    };
  }

  /**
   * Log CORS violations for monitoring
   */
  static logCorsViolation(origin: string, method: string, path: string) {
    console.error('CORS Violation:', {
      origin,
      method,
      path,
      timestamp: new Date().toISOString(),
      timezone: 'Asia/Ho_Chi_Minh'
    });
    
    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to monitoring/alerting service
    }
  }
}
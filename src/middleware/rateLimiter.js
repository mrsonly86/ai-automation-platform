const { RateLimiterRedis, RateLimiterMemory } = require('rate-limiter-flexible');
const { getRedisClient } = require('../utils/redis');
const { logger } = require('../utils/logger');

// Create rate limiter based on Redis availability
function createRateLimiter() {
    const redisClient = getRedisClient();
    
    const options = {
        keyPrefix: 'ai_platform_rl',
        points: parseInt(process.env.RATE_LIMIT_MAX) || 100, // Number of requests
        duration: parseInt(process.env.RATE_LIMIT_WINDOW) || 900, // Per 15 minutes (900 seconds)
        blockDuration: 900, // Block for 15 minutes if limit exceeded
    };
    
    if (redisClient) {
        return new RateLimiterRedis({
            storeClient: redisClient,
            ...options
        });
    } else {
        // Fallback to memory-based rate limiter
        return new RateLimiterMemory(options);
    }
}

const rateLimiter = createRateLimiter();

/**
 * Rate limiting middleware
 */
async function rateLimitMiddleware(req, res, next) {
    try {
        // Get client identifier (IP address, user ID, or API key)
        const key = req.ip || req.connection.remoteAddress;
        
        // Apply rate limiting
        await rateLimiter.consume(key);
        
        // Add rate limit headers
        const resRateLimiter = await rateLimiter.get(key);
        if (resRateLimiter) {
            res.set({
                'X-RateLimit-Limit': rateLimiter.points,
                'X-RateLimit-Remaining': resRateLimiter.remainingPoints,
                'X-RateLimit-Reset': new Date(Date.now() + resRateLimiter.msBeforeNext).toISOString()
            });
        }
        
        next();
    } catch (rateLimiterRes) {
        // Rate limit exceeded
        const remainingTime = Math.round(rateLimiterRes.msBeforeNext / 1000);
        
        logger.warn('Rate limit exceeded', {
            ip: req.ip,
            path: req.path,
            remainingTime
        });
        
        res.status(429).json({
            error: 'Too Many Requests',
            message: `Rate limit exceeded. Try again in ${remainingTime} seconds.`,
            retryAfter: remainingTime
        });
    }
}

module.exports = rateLimitMiddleware;
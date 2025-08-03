const redis = require('redis');
const { logger } = require('./logger');

let redisClient = null;

/**
 * Initialize Redis connection
 */
async function initializeRedis() {
    try {
        const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
        
        redisClient = redis.createClient({
            url: redisUrl,
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 50, 500)
            }
        });
        
        redisClient.on('error', (error) => {
            logger.error('Redis connection error', error);
        });
        
        redisClient.on('connect', () => {
            logger.info('Connected to Redis successfully');
        });
        
        redisClient.on('reconnecting', () => {
            logger.info('Reconnecting to Redis...');
        });
        
        await redisClient.connect();
        
        return redisClient;
    } catch (error) {
        logger.error('Failed to connect to Redis', error);
        
        // In development, continue without Redis
        if (process.env.NODE_ENV === 'development') {
            logger.warn('Continuing without Redis in development mode');
            return null;
        }
        
        throw error;
    }
}

/**
 * Get Redis client instance
 */
function getRedisClient() {
    return redisClient;
}

/**
 * Cache helper functions
 */
const cache = {
    async set(key, value, expiration = 3600) {
        if (!redisClient) return false;
        
        try {
            const serialized = JSON.stringify(value);
            await redisClient.setEx(key, expiration, serialized);
            return true;
        } catch (error) {
            logger.error('Redis set error', { key, error });
            return false;
        }
    },
    
    async get(key) {
        if (!redisClient) return null;
        
        try {
            const cached = await redisClient.get(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            logger.error('Redis get error', { key, error });
            return null;
        }
    },
    
    async del(key) {
        if (!redisClient) return false;
        
        try {
            await redisClient.del(key);
            return true;
        } catch (error) {
            logger.error('Redis delete error', { key, error });
            return false;
        }
    },
    
    async exists(key) {
        if (!redisClient) return false;
        
        try {
            const exists = await redisClient.exists(key);
            return exists === 1;
        } catch (error) {
            logger.error('Redis exists error', { key, error });
            return false;
        }
    }
};

/**
 * Close Redis connection
 */
async function closeRedisConnection() {
    if (redisClient) {
        try {
            await redisClient.quit();
            logger.info('Redis connection closed');
        } catch (error) {
            logger.error('Error closing Redis connection', error);
        }
    }
}

module.exports = {
    initializeRedis,
    getRedisClient,
    cache,
    closeRedisConnection
};
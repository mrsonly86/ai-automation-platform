const { logger } = require('../utils/logger');

/**
 * Global error handling middleware
 */
function errorHandler(error, req, res, next) {
    // Log the error
    logger.error('Unhandled error', {
        error: error.message,
        stack: error.stack,
        path: req.path,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    
    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: 'Invalid input data',
            details: isDevelopment ? error.message : undefined
        });
    }
    
    if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }
    
    if (error.name === 'ForbiddenError') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Insufficient permissions'
        });
    }
    
    if (error.name === 'NotFoundError') {
        return res.status(404).json({
            error: 'Not Found',
            message: 'Resource not found'
        });
    }
    
    if (error.code === 'ECONNREFUSED') {
        return res.status(503).json({
            error: 'Service Unavailable',
            message: 'External service connection failed'
        });
    }
    
    if (error.code === 'ETIMEDOUT') {
        return res.status(504).json({
            error: 'Gateway Timeout',
            message: 'Request timeout'
        });
    }
    
    // Default error response
    res.status(error.status || 500).json({
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'An unexpected error occurred',
        stack: isDevelopment ? error.stack : undefined,
        timestamp: new Date().toISOString()
    });
}

/**
 * 404 handler for undefined routes
 */
function notFoundHandler(req, res) {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString()
    });
}

/**
 * Async error wrapper for route handlers
 */
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}

module.exports = {
    errorHandler,
    notFoundHandler,
    asyncHandler
};
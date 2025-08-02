"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("@shared/utils/logger");
const errorHandler = (error, req, res, next) => {
    logger_1.logger.error('Error occurred:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    // Default error response
    let statusCode = 500;
    let apiError = {
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
    }
    else if (error.name === 'CastError') {
        statusCode = 400;
        apiError = {
            code: 'INVALID_ID',
            message: 'Invalid ID format'
        };
    }
    else if (error.name === 'MongoServerError' && error.code === 11000) {
        statusCode = 409;
        apiError = {
            code: 'DUPLICATE_KEY',
            message: 'Resource already exists'
        };
    }
    else if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        apiError = {
            code: 'INVALID_TOKEN',
            message: 'Invalid authentication token'
        };
    }
    else if (error.name === 'TokenExpiredError') {
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
    const response = {
        success: false,
        error: apiError,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id'] || 'unknown'
    };
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error-handler.js.map
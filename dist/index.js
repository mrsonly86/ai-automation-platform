"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const connection_1 = require("@shared/database/connection");
const routes_1 = require("@shared/routes");
const error_handler_1 = require("@shared/middleware/error-handler");
const logger_1 = require("@shared/utils/logger");
const rate_limiter_1 = require("@shared/middleware/rate-limiter");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(rate_limiter_1.rateLimiter);
// Body parsing middleware
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: '1.0.0',
        system: 'Enterprise Conglomerate Management System'
    });
});
// Setup application routes
(0, routes_1.setupRoutes)(app);
// Global error handler
app.use(error_handler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: 'The requested resource was not found',
        path: req.originalUrl
    });
});
async function startServer() {
    try {
        // Connect to database
        await (0, connection_1.connectDatabase)();
        // Start server
        app.listen(PORT, () => {
            logger_1.logger.info(`🚀 Enterprise Management System started on port ${PORT}`);
            logger_1.logger.info(`🌍 Environment: ${process.env.NODE_ENV}`);
            logger_1.logger.info(`📊 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
}
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.logger.error('Unhandled Promise Rejection:', err);
    process.exit(1);
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.logger.error('Uncaught Exception:', err);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGTERM', () => {
    logger_1.logger.info('SIGTERM received, shutting down gracefully');
    process.exit(0);
});
process.on('SIGINT', () => {
    logger_1.logger.info('SIGINT received, shutting down gracefully');
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map
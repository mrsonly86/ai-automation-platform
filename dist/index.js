"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./shared/config");
const routes_1 = require("./vietnam/e-invoice/routes");
const routes_2 = require("./agents/vietnamese-voice/routes");
const logger_1 = require("./shared/utils/logger");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Disable for development
}));
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
            eInvoice: 'active',
            voiceAssistant: 'active'
        }
    });
});
// API Routes
app.use('/api/vietnam/e-invoice', routes_1.vietnamEInvoiceRouter);
app.use('/api/agents/vietnamese-voice', routes_2.vietnameseVoiceRouter);
// Serve dashboard at root
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});
const PORT = config_1.config.port || 3000;
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 AI Automation Platform started on port ${PORT}`);
    logger_1.logger.info(`🌐 Dashboard: http://localhost:${PORT}`);
    logger_1.logger.info(`🧾 E-Invoice Vietnam Integration: Ready`);
    logger_1.logger.info(`🗣️ Vietnamese Voice Assistant: Ready`);
    logger_1.logger.info(`💰 Business Value Target: $450K/year`);
});
exports.default = app;
//# sourceMappingURL=index.js.map
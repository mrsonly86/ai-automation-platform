const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
require('dotenv').config();

// Import core modules
const { logger } = require('./utils/logger');
const { connectDatabase } = require('./utils/database');
const { initializeRedis } = require('./utils/redis');
const rateLimiter = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const aiAgentsRoutes = require('./routes/ai-agents');
const voiceRoutes = require('./routes/voice');
const complianceRoutes = require('./routes/compliance');
const salesRoutes = require('./routes/sales');
const demoRoutes = require('./routes/demo');

// Import services
const VoiceCommandService = require('./voice/VoiceCommandService');
const ComplianceService = require('./compliance/ComplianceService');
const AIAgentOrchestrator = require('./ai-agents/AIAgentOrchestrator');

class AIAutomationPlatform {
    constructor() {
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIO(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        this.port = process.env.PORT || 3000;
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.initializeServices();
    }

    setupMiddleware() {
        // Security middleware
        this.app.use(helmet());
        this.app.use(cors());
        
        // Rate limiting
        this.app.use(rateLimiter);
        
        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
        
        // Static files
        this.app.use(express.static(path.join(__dirname, '../public')));
        
        // Logging
        this.app.use((req, res, next) => {
            logger.info(`${req.method} ${req.path}`, { 
                ip: req.ip, 
                userAgent: req.get('User-Agent') 
            });
            next();
        });
    }

    setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                version: require('../package.json').version,
                environment: process.env.NODE_ENV
            });
        });

        // API routes
        this.app.use('/api/ai-agents', aiAgentsRoutes);
        this.app.use('/api/voice', voiceRoutes);
        this.app.use('/api/compliance', complianceRoutes);
        this.app.use('/api/sales', salesRoutes);
        this.app.use('/api/demo', demoRoutes);

        // Vietnamese documentation route
        this.app.get('/docs', (req, res) => {
            res.sendFile(path.join(__dirname, '../docs/index.html'));
        });

        // Error handling
        this.app.use(errorHandler.errorHandler);
    }

    setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger.info('Client connected', { socketId: socket.id });

            // Voice command handling
            socket.on('voice-command', async (data) => {
                try {
                    const result = await this.voiceService.processCommand(data);
                    socket.emit('voice-result', result);
                } catch (error) {
                    logger.error('Voice command error', error);
                    socket.emit('voice-error', { message: error.message });
                }
            });

            // AI agent communication
            socket.on('ai-agent-request', async (data) => {
                try {
                    const result = await this.aiOrchestrator.processRequest(data);
                    socket.emit('ai-agent-response', result);
                } catch (error) {
                    logger.error('AI agent error', error);
                    socket.emit('ai-agent-error', { message: error.message });
                }
            });

            // Compliance updates
            socket.on('compliance-check', async (data) => {
                try {
                    const result = await this.complianceService.validateCompliance(data);
                    socket.emit('compliance-result', result);
                } catch (error) {
                    logger.error('Compliance check error', error);
                    socket.emit('compliance-error', { message: error.message });
                }
            });

            socket.on('disconnect', () => {
                logger.info('Client disconnected', { socketId: socket.id });
            });
        });
    }

    async initializeServices() {
        try {
            // Initialize database connections
            await connectDatabase();
            await initializeRedis();

            // Initialize core services
            this.voiceService = new VoiceCommandService();
            this.complianceService = new ComplianceService();
            this.aiOrchestrator = new AIAgentOrchestrator();

            await this.voiceService.initialize();
            await this.complianceService.initialize();
            await this.aiOrchestrator.initialize();

            // Make services available to routes
            this.app.locals.voiceService = this.voiceService;
            this.app.locals.complianceService = this.complianceService;
            this.app.locals.aiOrchestrator = this.aiOrchestrator;

            logger.info('All services initialized successfully');
        } catch (error) {
            logger.error('Service initialization failed', error);
            process.exit(1);
        }
    }

    async start() {
        try {
            this.server.listen(this.port, () => {
                logger.info(`🚀 AI Automation Platform started on port ${this.port}`, {
                    environment: process.env.NODE_ENV,
                    version: require('../package.json').version
                });
                
                console.log(`
╔══════════════════════════════════════════════════════════════╗
║  🎯 AI AUTOMATION PLATFORM - VIETNAM EDITION                ║
║  ────────────────────────────────────────────────────────── ║
║  🎤 Vietnamese Voice Commands: ACTIVE                       ║
║  🏛️  Vietnam Compliance: E-Invoice + BHXH + Enterprise Law  ║
║  🤖 18 AI Agents: READY                                     ║
║  💼 Sales & Marketing: ENABLED                              ║
║  ☁️  Production Infrastructure: CONFIGURED                  ║
║  📚 Vietnamese Documentation: AVAILABLE                     ║
║  ────────────────────────────────────────────────────────── ║
║  🌐 Server: http://localhost:${this.port}                        ║
║  📖 Docs: http://localhost:${this.port}/docs                     ║
║  🎮 Demo: http://localhost:${this.port}/demo                     ║
╚══════════════════════════════════════════════════════════════╝
                `);
            });
        } catch (error) {
            logger.error('Failed to start server', error);
            process.exit(1);
        }
    }
}

// Create and start the platform
const platform = new AIAutomationPlatform();
platform.start();

module.exports = AIAutomationPlatform;
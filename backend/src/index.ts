import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import logger from './utils/logger';
import errorHandler from './middleware/errorHandler';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import workflowRoutes from './routes/workflows';
import agentRoutes from './routes/agents';
import integrationRoutes from './routes/integrations';
import deploymentRoutes from './routes/deployments';
import analyticsRoutes from './routes/analytics';

// Load environment variables
dotenv.config();

// Initialize Prisma client (commented out for now due to network issues)
// export const prisma = new PrismaClient();

const app = express();
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true
}));
app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AI Automation Platform API',
    version: '1.0.0',
    description: 'Backend API for AI Automation Platform with 8 specialized AI agents',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      projects: '/api/projects',
      workflows: '/api/workflows',
      agents: '/api/agents',
      integrations: '/api/integrations',
      deployments: '/api/deployments',
      analytics: '/api/analytics'
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('join-project', (projectId: string) => {
    socket.join(`project:${projectId}`);
    logger.info(`Socket ${socket.id} joined project: ${projectId}`);
  });

  socket.on('leave-project', (projectId: string) => {
    socket.leave(`project:${projectId}`);
    logger.info(`Socket ${socket.id} left project: ${projectId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Make io available globally
declare global {
  var io: Server;
}
global.io = io;

// Error handling middleware
app.use(errorHandler);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    // prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('HTTP server closed');
    // prisma.$disconnect();
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 AI Automation Platform API server running on port ${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
  logger.info(`🔗 CORS origin: ${process.env.CORS_ORIGIN || "http://localhost:3000"}`);
});

export default app;
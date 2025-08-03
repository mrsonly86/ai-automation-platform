import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './shared/config';
import { vietnamEInvoiceRouter } from './vietnam/e-invoice/routes';
import { vietnameseVoiceRouter } from './agents/vietnamese-voice/routes';
import { logger } from './shared/utils/logger';

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
}));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

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
app.use('/api/vietnam/e-invoice', vietnamEInvoiceRouter);
app.use('/api/agents/vietnamese-voice', vietnameseVoiceRouter);

// Serve dashboard at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

const PORT = config.port || 3000;

app.listen(PORT, () => {
  logger.info(`🚀 AI Automation Platform started on port ${PORT}`);
  logger.info(`🌐 Dashboard: http://localhost:${PORT}`);
  logger.info(`🧾 E-Invoice Vietnam Integration: Ready`);
  logger.info(`🗣️ Vietnamese Voice Assistant: Ready`);
  logger.info(`💰 Business Value Target: $450K/year`);
});

export default app;
// Main entry point for AI Automation Platform
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/config';
import { logger } from './utils/logger';
import { PredictiveAnalyticsAgent } from './agents/predictive-analytics/predictive-analytics-agent';
import { EInvoiceService } from './vietnam/e-invoice/e-invoice-service';
import { VietnameseVoiceAgent } from './agents/vietnamese-voice/vietnamese-voice-agent';

class AIAutomationPlatform {
  private app: express.Application;
  private predictiveAnalytics: PredictiveAnalyticsAgent;
  private eInvoiceService: EInvoiceService;
  private voiceAgent: VietnameseVoiceAgent;

  constructor() {
    this.app = express();
    this.predictiveAnalytics = new PredictiveAnalyticsAgent();
    this.eInvoiceService = new EInvoiceService();
    this.voiceAgent = new VietnameseVoiceAgent();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        features: {
          predictiveAnalytics: true,
          eInvoice: true,
          voiceAssistant: true
        }
      });
    });

    // Predictive Analytics API
    this.app.use('/api/predictive', this.predictiveAnalytics.getRouter());
    
    // E-Invoice API
    this.app.use('/api/e-invoice', this.eInvoiceService.getRouter());
    
    // Voice Assistant API
    this.app.use('/api/voice', this.voiceAgent.getRouter());
  }

  public async start(): Promise<void> {
    try {
      this.setupMiddleware();
      this.setupRoutes();

      // Initialize services
      await this.predictiveAnalytics.initialize();
      await this.eInvoiceService.initialize();
      await this.voiceAgent.initialize();

      const port = config.port;
      this.app.listen(port, () => {
        logger.info(`🚀 AI Automation Platform started on port ${port}`);
        logger.info('📊 Predictive Analytics Engine: Ready');
        logger.info('🧾 E-Invoice Integration: Ready');
        logger.info('🗣️ Vietnamese Voice Assistant: Ready');
      });
    } catch (error) {
      logger.error('Failed to start platform:', error);
      process.exit(1);
    }
  }
}

// Start the platform
const platform = new AIAutomationPlatform();
platform.start().catch((error) => {
  logger.error('Platform startup failed:', error);
  process.exit(1);
});

export default AIAutomationPlatform;
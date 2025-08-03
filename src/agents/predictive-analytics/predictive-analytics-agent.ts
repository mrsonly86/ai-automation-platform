import express, { Router, Request, Response } from 'express';
import { PredictionEngine, PredictionRequest } from './prediction-engine/prediction-scheduler';
import { TimeSeriesAnalysis } from './data-processing/time-series-analysis';
import { AnomalyDetection } from './data-processing/anomaly-detection';
import { EquipmentData, SensorReading, ApiResponse } from '../../types/index';
import { logger } from '../../utils/logger';

export class PredictiveAnalyticsAgent {
  private predictionEngine: PredictionEngine;
  private timeSeriesAnalysis: TimeSeriesAnalysis;
  private anomalyDetection: AnomalyDetection;
  private router: Router;
  private isInitialized = false;
  private equipmentDatabase: Map<string, EquipmentData> = new Map();

  constructor() {
    this.predictionEngine = new PredictionEngine();
    this.timeSeriesAnalysis = new TimeSeriesAnalysis();
    this.anomalyDetection = new AnomalyDetection();
    this.router = express.Router();
    this.setupRoutes();
  }

  async initialize(): Promise<void> {
    try {
      logger.info('🚀 Initializing Predictive Analytics Agent...');
      
      await Promise.all([
        this.predictionEngine.initialize(),
        this.timeSeriesAnalysis.initialize(),
        this.anomalyDetection.initialize(),
      ]);

      // Load sample equipment data for demonstration
      await this.loadSampleEquipmentData();

      this.isInitialized = true;
      logger.info('✅ Predictive Analytics Agent initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Predictive Analytics Agent:', error);
      throw error;
    }
  }

  private setupRoutes(): void {
    // Health check
    this.router.get('/health', this.handleHealthCheck.bind(this));

    // Sensor data ingestion
    this.router.post('/sensors/data', this.handleSensorData.bind(this));

    // Equipment management
    this.router.get('/equipment', this.handleGetEquipment.bind(this));
    this.router.post('/equipment', this.handleAddEquipment.bind(this));
    this.router.get('/equipment/:id', this.handleGetEquipmentById.bind(this));

    // Predictions
    this.router.post('/predict', this.handlePredict.bind(this));
    this.router.get('/predictions/history', this.handlePredictionHistory.bind(this));

    // Scheduled predictions
    this.router.post('/predictions/schedule', this.handleSchedulePrediction.bind(this));
    this.router.get('/predictions/schedule', this.handleGetScheduledPredictions.bind(this));
    this.router.delete('/predictions/schedule/:id', this.handleCancelScheduledPrediction.bind(this));

    // Analytics and monitoring
    this.router.get('/analytics/realtime', this.handleRealtimeAnalytics.bind(this));
    this.router.get('/analytics/equipment/:id', this.handleEquipmentAnalytics.bind(this));
    this.router.get('/anomalies', this.handleGetAnomalies.bind(this));

    // Model management
    this.router.get('/models/status', this.handleModelStatus.bind(this));
    this.router.post('/models/train', this.handleTrainModels.bind(this));
  }

  private async handleHealthCheck(req: Request, res: Response): Promise<void> {
    const health = {
      status: this.isInitialized ? 'healthy' : 'initializing',
      timestamp: new Date().toISOString(),
      services: {
        predictionEngine: this.predictionEngine.getEngineStatus().isInitialized,
        timeSeriesAnalysis: this.timeSeriesAnalysis.getProcessingStatus().isInitialized,
        anomalyDetection: this.anomalyDetection.getDetectionSummary().isInitialized,
      },
      equipmentCount: this.equipmentDatabase.size,
    };

    res.json(health);
  }

  private async handleSensorData(req: Request, res: Response): Promise<void> {
    try {
      const sensorReading: SensorReading = req.body;

      // Validate sensor reading
      if (!this.validateSensorReading(sensorReading)) {
        res.status(400).json({
          success: false,
          error: 'Invalid sensor reading format',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      // Process sensor data
      await this.timeSeriesAnalysis.processSensorData(sensorReading);
      await this.timeSeriesAnalysis.updateProcessingRate();

      // Detect anomalies
      const equipmentId = sensorReading.sensorId.split('_')[0];
      const equipment = this.equipmentDatabase.get(equipmentId);
      const anomalyResult = await this.anomalyDetection.detectAnomaly(sensorReading, equipment);

      // Update equipment data
      if (equipment) {
        equipment.sensors.push(sensorReading);
        // Keep only last 1000 sensor readings
        if (equipment.sensors.length > 1000) {
          equipment.sensors = equipment.sensors.slice(-1000);
        }
        equipment.updatedAt = new Date();
      }

      res.json({
        success: true,
        data: {
          processed: true,
          anomaly: anomalyResult,
        },
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error processing sensor data:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to process sensor data',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleGetEquipment(req: Request, res: Response): Promise<void> {
    try {
      const equipment = Array.from(this.equipmentDatabase.values());
      
      res.json({
        success: true,
        data: equipment.map(eq => ({
          ...eq,
          sensors: eq.sensors.slice(-10), // Return only last 10 sensor readings
        })),
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting equipment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get equipment data',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleAddEquipment(req: Request, res: Response): Promise<void> {
    try {
      const equipmentData: EquipmentData = {
        ...req.body,
        id: req.body.id || `eq_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        sensors: req.body.sensors || [],
        maintenanceHistory: req.body.maintenanceHistory || [],
      };

      this.equipmentDatabase.set(equipmentData.equipmentId, equipmentData);

      res.json({
        success: true,
        data: equipmentData,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error adding equipment:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add equipment',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleGetEquipmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const equipment = this.equipmentDatabase.get(id!);

      if (!equipment) {
        res.status(404).json({
          success: false,
          error: 'Equipment not found',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: equipment,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting equipment by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get equipment',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handlePredict(req: Request, res: Response): Promise<void> {
    try {
      const request: PredictionRequest = req.body;
      const equipmentData = Array.from(this.equipmentDatabase.values());

      if (equipmentData.length === 0) {
        res.status(400).json({
          success: false,
          error: 'No equipment data available for prediction',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      const result = await this.predictionEngine.predict(request, equipmentData);

      res.json({
        success: true,
        data: result,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error making prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to make prediction',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handlePredictionHistory(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const history = this.predictionEngine.getPredictionHistory(limit);

      res.json({
        success: true,
        data: history,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting prediction history:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get prediction history',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleSchedulePrediction(req: Request, res: Response): Promise<void> {
    try {
      const schedule = req.body;
      const scheduleId = await this.predictionEngine.scheduleRepeatingPrediction(schedule);

      res.json({
        success: true,
        data: { scheduleId },
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error scheduling prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to schedule prediction',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleGetScheduledPredictions(req: Request, res: Response): Promise<void> {
    try {
      const scheduled = this.predictionEngine.getScheduledPredictions();

      res.json({
        success: true,
        data: scheduled,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting scheduled predictions:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get scheduled predictions',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleCancelScheduledPrediction(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cancelled = await this.predictionEngine.cancelScheduledPrediction(id!);

      if (!cancelled) {
        res.status(404).json({
          success: false,
          error: 'Scheduled prediction not found',
          timestamp: new Date(),
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: { cancelled: true },
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error cancelling scheduled prediction:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel scheduled prediction',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleRealtimeAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const metrics = await this.timeSeriesAnalysis.getRealtimeMetrics();

      res.json({
        success: true,
        data: metrics,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting realtime analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get realtime analytics',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleEquipmentAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const timeRange = req.query.range as string || '1h';
      
      const statistics = await this.timeSeriesAnalysis.calculateStatistics(id!, timeRange);

      res.json({
        success: true,
        data: statistics,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting equipment analytics:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get equipment analytics',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleGetAnomalies(req: Request, res: Response): Promise<void> {
    try {
      const summary = this.anomalyDetection.getDetectionSummary();

      res.json({
        success: true,
        data: summary,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting anomalies:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get anomaly data',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleModelStatus(req: Request, res: Response): Promise<void> {
    try {
      const status = this.predictionEngine.getEngineStatus();

      res.json({
        success: true,
        data: status,
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error getting model status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get model status',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private async handleTrainModels(req: Request, res: Response): Promise<void> {
    try {
      // In a real implementation, this would trigger model training
      logger.info('🎯 Model training requested - not implemented in demo');

      res.json({
        success: true,
        data: { message: 'Model training started (demo mode)' },
        timestamp: new Date(),
      } as ApiResponse);

    } catch (error) {
      logger.error('Error training models:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to train models',
        timestamp: new Date(),
      } as ApiResponse);
    }
  }

  private validateSensorReading(reading: any): reading is SensorReading {
    if (!reading ||
        typeof reading.sensorId !== 'string' ||
        typeof reading.type !== 'string' ||
        typeof reading.value !== 'number' ||
        typeof reading.unit !== 'string' ||
        !reading.timestamp ||
        isNaN(new Date(reading.timestamp).getTime())) {
      return false;
    }

    // Convert timestamp string to Date object
    reading.timestamp = new Date(reading.timestamp);
    return true;
  }

  private async loadSampleEquipmentData(): Promise<void> {
    const sampleEquipment: EquipmentData[] = [
      {
        id: 'eq_001',
        equipmentId: 'MOTOR_001',
        type: 'motor',
        status: 'operational',
        sensors: [],
        maintenanceHistory: [
          {
            date: new Date('2023-12-01'),
            type: 'preventive',
            description: 'Routine maintenance',
            cost: 500,
            duration: 2,
          },
        ],
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date(),
      },
      {
        id: 'eq_002',
        equipmentId: 'PUMP_001',
        type: 'pump',
        status: 'operational',
        sensors: [],
        maintenanceHistory: [
          {
            date: new Date('2023-11-15'),
            type: 'corrective',
            description: 'Seal replacement',
            cost: 1200,
            duration: 4,
          },
        ],
        createdAt: new Date('2023-02-01'),
        updatedAt: new Date(),
      },
      {
        id: 'eq_003',
        equipmentId: 'CONVEYOR_001',
        type: 'conveyor',
        status: 'maintenance',
        sensors: [],
        maintenanceHistory: [
          {
            date: new Date('2023-12-10'),
            type: 'preventive',
            description: 'Belt inspection',
            cost: 300,
            duration: 1,
          },
        ],
        createdAt: new Date('2023-03-01'),
        updatedAt: new Date(),
      },
    ];

    for (const equipment of sampleEquipment) {
      this.equipmentDatabase.set(equipment.equipmentId, equipment);
    }

    logger.info(`📊 Loaded ${sampleEquipment.length} sample equipment records`);
  }

  public getRouter(): Router {
    return this.router;
  }

  public async processScheduledPredictions(): Promise<void> {
    if (!this.isInitialized) return;

    try {
      const equipmentData = Array.from(this.equipmentDatabase.values());
      await this.predictionEngine.processPendingScheduledPredictions(equipmentData);
    } catch (error) {
      logger.error('Error processing scheduled predictions:', error);
    }
  }

  public getStatus(): Record<string, any> {
    return {
      isInitialized: this.isInitialized,
      equipmentCount: this.equipmentDatabase.size,
      predictionEngine: this.predictionEngine.getEngineStatus(),
      timeSeriesAnalysis: this.timeSeriesAnalysis.getProcessingStatus(),
      anomalyDetection: this.anomalyDetection.getDetectionSummary(),
    };
  }
}